"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Tables, InsertTables } from "@/lib/types/database";
import { useRealtimeSubscription } from "@/lib/hooks/useRealtime";
import { useViewMode } from "@/lib/contexts/ViewModeContext";

type ActivityWithProfile = Tables<"activities"> & {
  profiles: { full_name: string | null } | null;
};

export interface ActivityFilters {
  businessId?: string;
  type?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useActivities(filters: ActivityFilters = {}) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();
  useRealtimeSubscription("activities", [["activities"]]);

  return useQuery({
    queryKey: ["activities", filters, isAdminView],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }
      if (filters.type) {
        query = query.eq("activity_type", filters.type);
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as ActivityWithProfile[];
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (activity: InsertTables<"activities">) => {
      const { data, error } = await supabase
        .from("activities")
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      if (data.business_id) {
        queryClient.invalidateQueries({
          queryKey: ["activities", { businessId: data.business_id }],
        });
        queryClient.invalidateQueries({ queryKey: ["lead", data.business_id] });
      }
    },
  });
}

export function useTouchpoints(businessId: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["touchpoints", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("touchpoints")
        .select("*")
        .eq("business_id", businessId)
        .order("occurred_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });
}

export function useCreateTouchpoint() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (touchpoint: InsertTables<"touchpoints">) => {
      const { data, error } = await supabase
        .from("touchpoints")
        .insert(touchpoint)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["touchpoints", data.business_id],
      });
    },
  });
}

// Combined timeline of activities and touchpoints
export function useCustomerJourney(businessId: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["customerJourney", businessId],
    queryFn: async () => {
      // Fetch activities
      const { data: rawActivities, error: activitiesError } = await supabase
        .from("activities")
        .select("*, profiles(full_name)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (activitiesError) throw activitiesError;
      const activities = rawActivities as unknown as ActivityWithProfile[];

      // Fetch touchpoints
      const { data: touchpoints, error: touchpointsError } = await supabase
        .from("touchpoints")
        .select("*")
        .eq("business_id", businessId)
        .order("occurred_at", { ascending: false });

      if (touchpointsError) throw touchpointsError;

      // Combine and format for timeline
      const timelineEvents = [
        ...(activities || []).map((activity) => ({
          id: activity.id,
          type: activity.activity_type,
          title: activity.subject || `${activity.activity_type} Activity`,
          description: activity.description,
          metadata: activity.metadata as Record<string, unknown> | undefined,
          created_at: activity.created_at,
          user_name: activity.profiles?.full_name,
        })),
        ...(touchpoints || []).map((tp) => ({
          id: tp.id,
          type: tp.type,
          title: getTouchpointTitle(tp.type, tp.metadata as Record<string, unknown> | null),
          description: (tp.metadata as Record<string, unknown>)?.description as string | undefined,
          metadata: tp.metadata as Record<string, unknown> | undefined,
          created_at: tp.occurred_at,
          user_name: undefined,
        })),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return timelineEvents;
    },
    enabled: !!businessId,
  });
}

function getTouchpointTitle(
  type: string,
  metadata?: Record<string, unknown> | null
): string {
  const titles: Record<string, string> = {
    website_visit: `Visited ${(metadata?.page_url as string) || "website"}`,
    email_open: `Opened email: ${(metadata?.email_subject as string) || "Email"}`,
    email_click: `Clicked link in email`,
    form_submission: `Submitted form: ${(metadata?.form_name as string) || "Form"}`,
    download: `Downloaded: ${(metadata?.file_name as string) || "File"}`,
    webinar_attended: `Attended webinar`,
    social_interaction: `Social interaction`,
  };

  return titles[type] || `${type} touchpoint`;
}

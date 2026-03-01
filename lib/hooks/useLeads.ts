"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Business, InsertTables, UpdateTables } from "@/lib/types/database";
import { checkResourceLimit } from "@/lib/hooks/useGatedMutation";
import { useRealtimeSubscription } from "@/lib/hooks/useRealtime";
import { useViewMode } from "@/lib/contexts/ViewModeContext";

export interface LeadFilters {
  status?: string;
  temperature?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface LeadSort {
  column: string;
  direction: "asc" | "desc";
}

export interface UseLeadsOptions {
  page?: number;
  pageSize?: number;
  filters?: LeadFilters;
  sort?: LeadSort;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const { page = 1, pageSize = 25, filters = {}, sort } = options;
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();
  useRealtimeSubscription("businesses", [["leads"]]);

  return useQuery({
    queryKey: ["leads", page, pageSize, filters, sort, isAdminView],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("*", {
          count: "exact",
        });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.temperature) {
        query = query.eq("lead_temperature", filters.temperature);
      }
      if (filters.source) {
        query = query.eq("source", filters.source);
      }
      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }
      if (filters.search) {
        const sanitized = filters.search.replace(/['"`;\\,.()\[\]{}]/g, "").trim();
        if (sanitized) {
          query = query.or(
            `business_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,city.ilike.%${sanitized}%`
          );
        }
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, { ascending: sort.direction === "asc" });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        leads: data as (Business & { profiles: { full_name: string; email: string } | null })[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
}

export function useLead(id: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch related data separately to avoid FK join failures
      const [contactsResult, activitiesResult] = await Promise.allSettled([
        supabase.from("contacts").select("*").eq("business_id", id),
        supabase.from("activities").select("*").eq("business_id", id).order("created_at", { ascending: false }),
      ]);

      const contacts = contactsResult.status === "fulfilled" ? contactsResult.value.data : [];
      const activities = activitiesResult.status === "fulfilled" ? activitiesResult.value.data : [];

      // Fetch assigned profile if exists
      let profiles = null;
      if (data.assigned_to) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", data.assigned_to)
          .single();
        profiles = profile;
      }

      return { ...data, profiles, contacts, activities, touchpoints: [] };
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (lead: InsertTables<"businesses">) => {
      await checkResourceLimit("businesses", "leads");

      const { data, error } = await supabase
        .from("businesses")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;

      // Auto-create a primary contact if email or phone is provided
      if (data && (lead.email || lead.phone)) {
        await supabase.from("contacts").insert({
          business_id: data.id,
          first_name: lead.business_name,
          email: lead.email || null,
          phone: lead.phone || null,
          is_primary: true,
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      // Fire automation rules for "lead_created" trigger (fire-and-forget)
      if (data) {
        fetch("/api/automation/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            triggerType: "lead_created",
            triggerData: {
              businessId: data.id,
              businessName: data.business_name,
              email: data.email,
              contactName: data.business_name,
            },
          }),
        }).catch((err) => {
          console.error("Automation trigger failed:", err);
        });
      }
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTables<"businesses">;
    }) => {
      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", data.id] });

      // Fire automation rules (fire-and-forget)
      if (data) {
        const triggerData = {
          businessId: data.id,
          businessName: data.business_name,
          email: data.email,
          contactName: data.business_name,
        };

        // Always fire lead_updated
        fetch("/api/automation/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ triggerType: "lead_updated", triggerData }),
        }).catch((err) => console.error("Automation trigger failed:", err));

        // If status changed, also fire status_changed
        if (variables.updates.status) {
          fetch("/api/automation/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              triggerType: "status_changed",
              triggerData: { ...triggerData, newStatus: variables.updates.status },
            }),
          }).catch((err) => console.error("Automation trigger failed:", err));
        }
      }
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("businesses").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: UpdateTables<"businesses">;
    }) => {
      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .in("id", ids)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

const BUSINESS_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "do_not_contact",
] as const;

export function useLeadStats() {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["leadStats", isAdminView],
    queryFn: async () => {
      // Build all count queries in parallel using head-only requests
      // instead of fetching all rows and counting client-side
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [statusResults, pipelineResult, newThisWeekResult, totalResult] =
        await Promise.all([
          // Count per status — one lightweight head-only query each
          Promise.all(
            BUSINESS_STATUSES.map((status) =>
              supabase
                .from("businesses")
                .select("*", { count: "exact", head: true })
                .eq("status", status)
                .then(({ count, error }) => {
                  if (error) throw error;
                  return { status, count: count || 0 };
                })
            )
          ),
          // Pipeline value — only select deal_value for active pipeline leads
          supabase
            .from("businesses")
            .select("deal_value")
            .not("deal_value", "is", null)
            .not("status", "in", '("won","lost")'),
          // New leads this week — head-only count
          supabase
            .from("businesses")
            .select("*", { count: "exact", head: true })
            .gte("created_at", weekAgo.toISOString()),
          // Total count — head-only
          supabase
            .from("businesses")
            .select("*", { count: "exact", head: true }),
        ]);

      // Build status counts map from parallel results
      const statusCounts: Record<string, number> = {};
      for (const { status, count } of statusResults) {
        if (count > 0) {
          statusCounts[status] = count;
        }
      }

      // Pipeline value
      if (pipelineResult.error) throw pipelineResult.error;
      const pipelineValue =
        pipelineResult.data?.reduce(
          (sum, row) => sum + (row.deal_value || 0),
          0
        ) || 0;

      // New this week
      if (newThisWeekResult.error) throw newThisWeekResult.error;

      // Total
      if (totalResult.error) throw totalResult.error;

      return {
        statusCounts,
        pipelineValue,
        newThisWeek: newThisWeekResult.count || 0,
        total: totalResult.count || 0,
      };
    },
  });
}

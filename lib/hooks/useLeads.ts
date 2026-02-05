"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Business, InsertTables, UpdateTables } from "@/lib/types/database";

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

  return useQuery({
    queryKey: ["leads", page, pageSize, filters, sort],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("*, profiles!businesses_assigned_to_fkey(full_name, email)", {
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
        query = query.or(
          `business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
        );
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
        .select(
          `
          *,
          profiles!businesses_assigned_to_fkey(id, full_name, email, avatar_url),
          contacts(*),
          activities(*, profiles(full_name)),
          touchpoints(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (lead: InsertTables<"businesses">) => {
      const { data, error } = await supabase
        .from("businesses")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", data.id] });
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

export function useLeadStats() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from("businesses")
        .select("status")
        .then((result) => {
          if (result.error) throw result.error;
          const counts: Record<string, number> = {};
          result.data?.forEach((row) => {
            counts[row.status] = (counts[row.status] || 0) + 1;
          });
          return { data: counts, error: null };
        });

      if (statusError) throw statusError;

      // Get total pipeline value
      const { data: pipelineData, error: pipelineError } = await supabase
        .from("businesses")
        .select("deal_value")
        .not("deal_value", "is", null)
        .not("status", "in", '("won","lost")');

      if (pipelineError) throw pipelineError;

      const pipelineValue = pipelineData?.reduce(
        (sum, row) => sum + (row.deal_value || 0),
        0
      );

      // Get new leads this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: newThisWeek, error: newError } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      if (newError) throw newError;

      return {
        statusCounts: statusCounts || {},
        pipelineValue: pipelineValue || 0,
        newThisWeek: newThisWeek || 0,
        total: Object.values(statusCounts || {}).reduce((a, b) => a + b, 0),
      };
    },
  });
}

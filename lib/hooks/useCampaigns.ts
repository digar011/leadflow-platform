"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { InsertTables, UpdateTables } from "@/lib/types/database";
import { checkResourceLimit } from "@/lib/hooks/useGatedMutation";

export interface CampaignFilters {
  status?: string;
  type?: string;
  search?: string;
}

export function useCampaigns(filters: CampaignFilters = {}) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: async () => {
      let query = supabase
        .from("campaigns")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.type) {
        query = query.eq("campaign_type", filters.type);
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCampaign(id: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          profiles(full_name),
          campaign_members(
            id,
            business_id,
            status,
            added_at,
            businesses(business_name, email, status)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (campaign: InsertTables<"campaigns">) => {
      await checkResourceLimit("campaigns", "campaigns");

      const { data, error } = await supabase
        .from("campaigns")
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTables<"campaigns">;
    }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useAddToCampaign() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      businessIds,
    }: {
      campaignId: string;
      businessIds: string[];
    }) => {
      const members = businessIds.map((businessId) => ({
        campaign_id: campaignId,
        business_id: businessId,
        status: "pending" as const,
      }));

      const { data, error } = await supabase
        .from("campaign_members")
        .insert(members)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign", variables.campaignId],
      });
    },
  });
}

export function useRemoveFromCampaign() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      memberId,
    }: {
      campaignId: string;
      memberId: string;
    }) => {
      const { error } = await supabase
        .from("campaign_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign", variables.campaignId],
      });
    },
  });
}

export function useCampaignStats() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["campaignStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("status, budget, spent");

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter((c) => c.status === "active").length,
        draft: data.filter((c) => c.status === "draft").length,
        completed: data.filter((c) => c.status === "completed").length,
        totalBudget: data.reduce((sum, c) => sum + (c.budget || 0), 0),
        totalSpent: data.reduce((sum, c) => sum + (c.spent || 0), 0),
      };

      return stats;
    },
  });
}

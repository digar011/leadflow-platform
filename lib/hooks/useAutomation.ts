"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { InsertTables, UpdateTables } from "@/lib/types/database";

export function useAutomationRules() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["automationRules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*, profiles(full_name)")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAutomationRule(id: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["automationRule", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select(`
          *,
          profiles(full_name),
          automation_logs(id, status, executed_at, error_message)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAutomationRule() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (rule: InsertTables<"automation_rules">) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
    },
  });
}

export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTables<"automation_rules">;
    }) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
      queryClient.invalidateQueries({ queryKey: ["automationRule", data.id] });
    },
  });
}

export function useDeleteAutomationRule() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("automation_rules").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
    },
  });
}

export function useToggleAutomationRule() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("automation_rules")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
      queryClient.invalidateQueries({ queryKey: ["automationRule", data.id] });
    },
  });
}

export function useAutomationLogs(ruleId?: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["automationLogs", ruleId],
    queryFn: async () => {
      let query = supabase
        .from("automation_logs")
        .select(`
          *,
          automation_rules(name),
          businesses(business_name)
        `)
        .order("executed_at", { ascending: false })
        .limit(100);

      if (ruleId) {
        query = query.eq("rule_id", ruleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useAutomationStats() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["automationStats"],
    queryFn: async () => {
      // Get rule counts
      const { data: rules, error: rulesError } = await supabase
        .from("automation_rules")
        .select("is_active, trigger_count");

      if (rulesError) throw rulesError;

      // Get recent log counts
      const { count: totalExecutions, error: execError } = await supabase
        .from("automation_logs")
        .select("*", { count: "exact", head: true });

      if (execError) throw execError;

      const { count: successfulExecutions, error: successError } = await supabase
        .from("automation_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "success");

      if (successError) throw successError;

      return {
        totalRules: rules.length,
        activeRules: rules.filter((r) => r.is_active).length,
        totalTriggers: rules.reduce((sum, r) => sum + (r.trigger_count || 0), 0),
        totalExecutions: totalExecutions || 0,
        successfulExecutions: successfulExecutions || 0,
        successRate: totalExecutions
          ? ((successfulExecutions || 0) / totalExecutions) * 100
          : 0,
      };
    },
  });
}

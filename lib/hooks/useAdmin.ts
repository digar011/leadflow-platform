"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Types
import type { UserPermissions, SubscriptionTier, BillingCycle } from "@/lib/types/database";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "manager" | "user";
  is_active: boolean;
  permissions: UserPermissions;
  subscription_tier: SubscriptionTier;
  subscription_billing_cycle: BillingCycle;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  is_public: boolean;
  updated_at: string;
}

// Users Management
export function useUsers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as User[];
    },
  });
}

// Helper: call the admin API route (uses service role server-side)
async function adminUserAction(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Admin action failed");
  }
  return res.json();
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return adminUserAction({ userId, action: "updateRole", role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return adminUserAction({ userId, action: "toggleActive", isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: UserPermissions;
    }) => {
      return adminUserAction({ userId, action: "updatePermissions", permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      tier,
      billingCycle,
    }: {
      userId: string;
      tier: SubscriptionTier;
      billingCycle?: BillingCycle;
    }) => {
      return adminUserAction({ userId, action: "updateTier", tier, billingCycle });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// Audit Logs
export function useAuditLogs(options: {
  limit?: number;
  offset?: number;
  action?: string;
  resourceType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const supabase = createClient();
  const { limit = 50, offset = 0, action, resourceType, userId, startDate, endDate } = options;

  return useQuery({
    queryKey: ["admin", "audit-logs", options],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (action) {
        query = query.eq("action", action);
      }
      if (resourceType) {
        query = query.eq("resource_type", resourceType);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { logs: data as unknown as AuditLog[], total: count || 0 };
    },
  });
}

export function useAuditLogStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "audit-logs", "stats"],
    queryFn: async () => {
      // Get total logs
      const { count: totalLogs } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true });

      // Get logs today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: logsToday } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Get unique actions
      const { data: actions } = await supabase
        .from("audit_logs")
        .select("action")
        .limit(100);

      const uniqueActions = new Set(actions?.map((a) => a.action) || []);

      return {
        totalLogs: totalLogs || 0,
        logsToday: logsToday || 0,
        uniqueActions: uniqueActions.size,
      };
    },
  });
}

// System Settings
export function useSystemSettings(category?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "settings", category],
    queryFn: async () => {
      let query = supabase
        .from("system_settings")
        .select("*")
        .order("category")
        .order("key");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useUpdateSystemSetting() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { data, error } = await supabase
        .from("system_settings")
        .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

// Admin Stats
export function useAdminStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: adminUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      // Get recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentSignups } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        adminUsers: adminUsers || 0,
        recentSignups: recentSignups || 0,
      };
    },
  });
}

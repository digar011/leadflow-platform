"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { PermissionKey, UserPermissions, UserRole } from "@/lib/types/database";
import { getEffectivePermissions, hasPermission } from "@/lib/utils/permissions";

export function usePermissions() {
  const supabase = getSupabaseClient();

  const { data, isLoading } = useQuery({
    queryKey: ["currentUserPermissions"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return {
        role: profile.role as UserRole,
        overrides: (profile.permissions || {}) as UserPermissions,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const role = data?.role ?? "user";
  const overrides = data?.overrides ?? {};
  const effective = getEffectivePermissions(role, overrides);

  const can = (key: PermissionKey): boolean => {
    if (!data) return false;
    return hasPermission(role, overrides, key);
  };

  const canAll = (keys: PermissionKey[]): boolean => {
    return keys.every((key) => can(key));
  };

  const canAny = (keys: PermissionKey[]): boolean => {
    return keys.some((key) => can(key));
  };

  return {
    can,
    canAll,
    canAny,
    permissions: effective,
    role,
    isLoading,
  };
}

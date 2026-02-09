"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Subscribe to Supabase Realtime postgres_changes on a table.
 * On any INSERT/UPDATE/DELETE, invalidates the specified React Query keys.
 */
export function useRealtimeSubscription(
  table: string,
  queryKeys: (string | undefined)[][],
  enabled = true
) {
  const queryClient = useQueryClient();
  const queryKeysRef = useRef(queryKeys);
  queryKeysRef.current = queryKeys;

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryKeysRef.current.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, queryClient]);
}

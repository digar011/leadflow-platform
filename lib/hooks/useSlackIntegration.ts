"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface SlackConfig {
  webhookUrl: string;
  channelName: string;
  enabledEvents: string[];
  isActive: boolean;
}

export const SLACK_EVENTS = [
  { value: "lead_created", label: "New lead created" },
  { value: "status_changed", label: "Lead status changed" },
  { value: "deal_won", label: "Deal won (closed-won)" },
  { value: "lead_assigned", label: "Lead assigned" },
] as const;

/**
 * Hook to manage Slack integration config stored in the api_keys table.
 * Uses integration_type="slack", external_key for webhook URL,
 * and scopes[] for config JSON.
 */
export function useSlackIntegration() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["slack-integration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("integration_type", "slack")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Parse config from scopes field (we store JSON-encoded config there)
      let channelName = "";
      let enabledEvents: string[] = [];
      try {
        const meta = JSON.parse(data.scopes?.[0] || "{}");
        channelName = meta.channelName || "";
        enabledEvents = meta.enabledEvents || [];
      } catch {
        // scopes not parseable, use defaults
      }

      return {
        id: data.id,
        config: {
          webhookUrl: data.external_key || "",
          channelName,
          enabledEvents,
          isActive: data.is_active,
        } as SlackConfig,
      };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (config: SlackConfig) => {
      const existing = query.data;
      const metaJson = JSON.stringify({
        channelName: config.channelName,
        enabledEvents: config.enabledEvents,
      });

      if (existing?.id) {
        // Update existing
        const { error } = await supabase
          .from("api_keys")
          .update({
            external_key: config.webhookUrl,
            scopes: [metaJson],
            is_active: config.isActive,
            name: `Slack - ${config.channelName || "Webhook"}`,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new — generate a dummy key hash since it's not a real API key
        const keyPrefix = "slack___";
        const keyHash = await hashString(`slack_${Date.now()}_${Math.random()}`);

        const { error } = await supabase.from("api_keys").insert({
          name: `Slack - ${config.channelName || "Webhook"}`,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          scopes: [metaJson],
          integration_type: "slack",
          external_key: config.webhookUrl,
          is_active: config.isActive,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-integration"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const existing = query.data;
      if (!existing?.id) return;

      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-integration"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/integrations/slack/test", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Test failed");
      return data as { ok: boolean };
    },
  });

  return {
    config: query.data?.config || null,
    isLoading: query.isLoading,
    saveConfig: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteConfig: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    testConnection: testMutation.mutateAsync,
    isTesting: testMutation.isPending,
    testError: testMutation.error,
  };
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

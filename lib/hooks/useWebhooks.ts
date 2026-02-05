"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Types
export interface WebhookConfig {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: "inbound" | "outbound";
  url: string | null;
  secret: string | null;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  retry_delay: number;
  ip_allowlist: string[] | null;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  attempt_number: number;
  status: "pending" | "success" | "failed" | "retrying";
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface CreateWebhookInput {
  name: string;
  description?: string;
  type: "inbound" | "outbound";
  url?: string;
  events: string[];
  headers?: Record<string, string>;
  is_active?: boolean;
  retry_count?: number;
  ip_allowlist?: string[];
}

// Webhook events
export const WEBHOOK_EVENTS = [
  { value: "lead.created", label: "Lead Created" },
  { value: "lead.updated", label: "Lead Updated" },
  { value: "lead.deleted", label: "Lead Deleted" },
  { value: "lead.status_changed", label: "Lead Status Changed" },
  { value: "lead.converted", label: "Lead Converted" },
  { value: "contact.created", label: "Contact Created" },
  { value: "contact.updated", label: "Contact Updated" },
  { value: "activity.logged", label: "Activity Logged" },
  { value: "campaign.started", label: "Campaign Started" },
  { value: "campaign.completed", label: "Campaign Completed" },
  { value: "automation.triggered", label: "Automation Triggered" },
];

// Webhooks
export function useWebhooks(type?: "inbound" | "outbound") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["webhooks", type],
    queryFn: async () => {
      let query = supabase
        .from("webhook_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WebhookConfig[];
    },
  });
}

export function useWebhook(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["webhooks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_configs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as WebhookConfig;
    },
    enabled: !!id,
  });
}

export function useCreateWebhook() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWebhookInput) => {
      // Generate a secret for the webhook
      const secret = generateWebhookSecret();

      const { data, error } = await supabase
        .from("webhook_configs")
        .insert({
          ...input,
          secret,
          headers: input.headers || {},
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, generatedSecret: secret } as WebhookConfig & { generatedSecret: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useUpdateWebhook() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateWebhookInput>;
    }) => {
      const { data, error } = await supabase
        .from("webhook_configs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WebhookConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhooks", data.id] });
    },
  });
}

export function useDeleteWebhook() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhook_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useToggleWebhook() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("webhook_configs")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WebhookConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useRegenerateWebhookSecret() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const newSecret = generateWebhookSecret();

      const { data, error } = await supabase
        .from("webhook_configs")
        .update({ secret: newSecret })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, newSecret } as WebhookConfig & { newSecret: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhooks", data.id] });
    },
  });
}

// Webhook Deliveries
export function useWebhookDeliveries(webhookId?: string, limit = 50) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["webhook-deliveries", webhookId, limit],
    queryFn: async () => {
      let query = supabase
        .from("webhook_deliveries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (webhookId) {
        query = query.eq("webhook_id", webhookId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WebhookDelivery[];
    },
  });
}

export function useWebhookStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["webhook-stats"],
    queryFn: async () => {
      const { count: totalWebhooks } = await supabase
        .from("webhook_configs")
        .select("*", { count: "exact", head: true });

      const { count: activeWebhooks } = await supabase
        .from("webhook_configs")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: totalDeliveries } = await supabase
        .from("webhook_deliveries")
        .select("*", { count: "exact", head: true });

      const { count: successfulDeliveries } = await supabase
        .from("webhook_deliveries")
        .select("*", { count: "exact", head: true })
        .eq("status", "success");

      const successRate = totalDeliveries
        ? Math.round((successfulDeliveries || 0) / totalDeliveries * 100)
        : 0;

      return {
        totalWebhooks: totalWebhooks || 0,
        activeWebhooks: activeWebhooks || 0,
        totalDeliveries: totalDeliveries || 0,
        successRate,
      };
    },
  });
}

// Helper function to generate webhook secret
function generateWebhookSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

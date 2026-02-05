"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Types
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: string[];
  expires_at?: string;
}

// Scopes
export const API_SCOPES = [
  { value: "leads:read", label: "Read Leads", description: "View lead information" },
  { value: "leads:write", label: "Write Leads", description: "Create and update leads" },
  { value: "contacts:read", label: "Read Contacts", description: "View contact information" },
  { value: "contacts:write", label: "Write Contacts", description: "Create and update contacts" },
  { value: "activities:read", label: "Read Activities", description: "View activity logs" },
  { value: "activities:write", label: "Write Activities", description: "Log activities" },
  { value: "campaigns:read", label: "Read Campaigns", description: "View campaigns" },
  { value: "campaigns:write", label: "Write Campaigns", description: "Manage campaigns" },
  { value: "reports:read", label: "Read Reports", description: "Generate reports" },
  { value: "webhooks:manage", label: "Manage Webhooks", description: "Configure webhooks" },
];

// API Keys
export function useApiKeys() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
  });
}

export function useCreateApiKey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      // Generate the actual API key
      const apiKey = generateApiKey();
      const keyHash = await hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 8);

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          name: input.name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          scopes: input.scopes,
          expires_at: input.expires_at,
        })
        .select()
        .single();

      if (error) throw error;

      // Return the full key only once - it won't be stored
      return { ...data, fullKey: apiKey } as ApiKey & { fullKey: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useUpdateApiKey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; scopes?: string[] };
    }) => {
      const { data, error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useToggleApiKey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("api_keys")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

// Helper function to generate API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "lf_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Helper function to hash API key (using SubtleCrypto for browser)
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

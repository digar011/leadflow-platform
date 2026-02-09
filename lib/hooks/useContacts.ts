"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { InsertTables, UpdateTables } from "@/lib/types/database";
import { useRealtimeSubscription } from "@/lib/hooks/useRealtime";

export function useContacts(businessId?: string) {
  const supabase = getSupabaseClient();
  useRealtimeSubscription("contacts", [["contacts", businessId], ["contacts"]]);

  return useQuery({
    queryKey: ["contacts", businessId],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("*")
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: businessId ? !!businessId : true,
  });
}

export function useContact(id: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, businesses(business_name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (contact: InsertTables<"contacts">) => {
      const { data, error } = await supabase
        .from("contacts")
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      if (data.business_id) {
        queryClient.invalidateQueries({
          queryKey: ["contacts", data.business_id],
        });
        queryClient.invalidateQueries({ queryKey: ["lead", data.business_id] });
      }
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTables<"contacts">;
    }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", data.id] });
      if (data.business_id) {
        queryClient.invalidateQueries({
          queryKey: ["contacts", data.business_id],
        });
      }
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get the contact first to know which business to invalidate
      const { data: contact } = await supabase
        .from("contacts")
        .select("business_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("contacts").delete().eq("id", id);

      if (error) throw error;
      return contact?.business_id;
    },
    onSuccess: (businessId) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: ["contacts", businessId],
        });
        queryClient.invalidateQueries({ queryKey: ["lead", businessId] });
      }
    },
  });
}

export function useSetPrimaryContact() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      businessId,
    }: {
      contactId: string;
      businessId: string;
    }) => {
      // The database trigger will handle unsetting other primary contacts
      const { data, error } = await supabase
        .from("contacts")
        .update({ is_primary: true })
        .eq("id", contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      if (data.business_id) {
        queryClient.invalidateQueries({
          queryKey: ["contacts", data.business_id],
        });
        queryClient.invalidateQueries({ queryKey: ["lead", data.business_id] });
      }
    },
  });
}

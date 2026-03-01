"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

export type SupportTicket = Tables<"support_tickets"> & {
  profiles?: { full_name: string | null; email: string | null } | null;
  support_messages?: Tables<"support_messages">[];
};

export type SupportMessage = Tables<"support_messages"> & {
  profiles?: { full_name: string | null } | null;
};

export const TICKET_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "billing", label: "Billing" },
  { value: "account", label: "Account" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

// User: fetch own tickets
export function useSupportTickets() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["supportTickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
  });
}

// Admin: fetch all tickets with user info
export function useAllSupportTickets(statusFilter?: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["adminSupportTickets", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("support_tickets")
        .select("*, profiles(full_name, email)")
        .order("updated_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SupportTicket[];
    },
  });
}

// Fetch messages for a ticket
export function useTicketMessages(ticketId: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["ticketMessages", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*, profiles(full_name)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as SupportMessage[];
    },
    enabled: !!ticketId,
  });
}

// Create a new ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (ticket: {
      subject: string;
      description: string;
      category?: string;
      priority?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category || "general",
          priority: ticket.priority || "medium",
        })
        .select()
        .single();

      if (error) throw error;

      // Also create the initial message
      await supabase.from("support_messages").insert({
        ticket_id: data.id,
        sender_id: user.id,
        message: ticket.description,
        is_admin_reply: false,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminSupportTickets"] });
    },
  });
}

// Reply to a ticket
export function useReplyToTicket() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isAdminReply,
    }: {
      ticketId: string;
      message: string;
      isAdminReply?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          message,
          is_admin_reply: isAdminReply || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticketMessages", variables.ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminSupportTickets"] });
    },
  });
}

// Update ticket status (admin)
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminSupportTickets"] });
    },
  });
}

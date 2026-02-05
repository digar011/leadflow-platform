"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { InsertTables, UpdateTables } from "@/lib/types/database";

export function useReports() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useReport(id: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, profiles(full_name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (report: InsertTables<"reports">) => {
      const { data, error } = await supabase
        .from("reports")
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTables<"reports">;
    }) => {
      const { data, error } = await supabase
        .from("reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", data.id] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Generate report data based on report configuration
export function useGenerateReport(reportId: string, enabled: boolean = true) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["reportData", reportId],
    queryFn: async () => {
      // First get the report configuration
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (reportError) throw reportError;

      // Generate data based on report type
      switch (report.report_type) {
        case "leads": {
          const { data, error } = await supabase
            .from("businesses")
            .select("*, profiles!businesses_assigned_to_fkey(full_name)")
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { type: "leads", data, report };
        }

        case "activities": {
          const { data, error } = await supabase
            .from("activities")
            .select("*, profiles(full_name), businesses(business_name)")
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { type: "activities", data, report };
        }

        case "campaigns": {
          const { data, error } = await supabase
            .from("campaigns")
            .select("*, profiles(full_name)")
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { type: "campaigns", data, report };
        }

        case "pipeline": {
          const { data, error } = await supabase
            .from("businesses")
            .select("status, deal_value")
            .not("status", "eq", "do_not_contact");

          if (error) throw error;

          // Aggregate by status
          const pipeline = data.reduce((acc, lead) => {
            if (!acc[lead.status]) {
              acc[lead.status] = { count: 0, value: 0 };
            }
            acc[lead.status].count++;
            acc[lead.status].value += lead.deal_value || 0;
            return acc;
          }, {} as Record<string, { count: number; value: number }>);

          return { type: "pipeline", data: pipeline, report };
        }

        default:
          return { type: "custom", data: [], report };
      }
    },
    enabled: enabled && !!reportId,
  });
}

// Export to CSV
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { UpgradeModal } from "@/components/subscription";
import type { LeadFilters } from "@/lib/hooks/useLeads";

interface ExportButtonProps {
  filters: LeadFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { can } = useSubscription();

  const handleExport = async () => {
    if (!can("csvExport")) {
      setShowUpgrade(true);
      return;
    }

    setExporting(true);
    try {
      // Build query string from active filters
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.temperature) params.set("temperature", filters.temperature);
      if (filters.source) params.set("source", filters.source);
      if (filters.search) params.set("search", filters.search);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.tags?.length) params.set("tags", filters.tags.join(","));

      const queryString = params.toString();
      const url = `/api/leads/export${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(err.error || "Export failed");
      }

      // Trigger browser download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Get filename from Content-Disposition or fallback
      const disposition = response.headers.get("Content-Disposition");
      const filename = disposition?.match(/filename=(.+)/)?.[1] || `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export failed:", error);
      alert(error instanceof Error ? error.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        leftIcon={
          exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )
        }
      >
        {exporting ? "Exporting..." : "Export"}
      </Button>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="csvExport"
        featureLabel="CSV Export"
      />
    </>
  );
}

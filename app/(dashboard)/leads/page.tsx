"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Upload, LayoutGrid, List, Trash2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/Modal";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { ExportButton } from "@/components/leads/ExportButton";
import { ImportModal } from "@/components/leads/ImportModal";
import { useLeads, useLeadStats, useDeleteLead, useUpdateLead, useBulkUpdateLeads, type LeadFilters as LeadFiltersType, type LeadSort } from "@/lib/hooks/useLeads";
import type { LeadStatus } from "@/lib/types/database";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";
import { UsageLimitBar } from "@/components/subscription";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [sort, setSort] = useState<LeadSort>({ column: "created_at", direction: "desc" });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const { data, isLoading, error } = useLeads({ page, pageSize, filters, sort });
  const { data: stats } = useLeadStats();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const bulkUpdate = useBulkUpdateLeads();
  const { can } = useSubscription();
  const canPipeline = can("pipelineView");

  const handleBulkStatusChange = async (status: LeadStatus) => {
    try {
      await bulkUpdate.mutateAsync({ ids: selectedLeads, updates: { status } });
      setSelectedLeads([]);
      setBulkStatus(null);
    } catch (error) {
      console.error("Failed to bulk update:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedLeads) {
        await deleteLead.mutateAsync(id);
      }
      setSelectedLeads([]);
      setShowBulkDelete(false);
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    }
  };

  const handleSort = (column: string) => {
    setSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFiltersChange = (newFilters: LeadFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLead.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLead.mutateAsync({ id, updates: { status } });
    } catch (error) {
      console.error("Failed to update lead status:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-text-secondary">
            Manage and track your business leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowImport(true)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Import
          </Button>
          <ExportButton filters={filters} />
          <Link href="/leads/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Lead</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">Total Leads</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCompactNumber(stats.total)}
              </p>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">New This Week</p>
              <p className="text-2xl font-bold text-status-success">
                +{stats.newThisWeek}
              </p>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">Pipeline Value</p>
              <p className="text-2xl font-bold text-gold">
                {formatCurrency(stats.pipelineValue)}
              </p>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">Won Deals</p>
              <p className="text-2xl font-bold text-pipeline-won">
                {stats.statusCounts.won || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Limit */}
      <UsageLimitBar feature="leads" currentUsage={data?.total || 0} showAlways />

      {/* Filters */}
      <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 px-4 py-2.5">
          <span className="text-sm font-medium text-gold">
            {selectedLeads.length} selected
          </span>
          <div className="h-4 w-px bg-white/10" />
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBulkStatus(bulkStatus ? null : "new")}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Change Status
            </Button>
            {bulkStatus !== null && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkStatus(null)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg bg-background-secondary border border-white/10 py-1 shadow-lg">
                  {(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as LeadStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleBulkStatusChange(s)}
                      className="w-full px-4 py-1.5 text-left text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary capitalize transition-colors"
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            className="text-status-error hover:text-status-error"
          >
            Delete
          </Button>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setSelectedLeads([])}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          {canPipeline ? (
            <Link href="/leads/kanban">
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="icon"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              disabled
              title="Pipeline view requires Starter plan or higher"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load leads. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <LeadTable
        leads={data?.leads || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        onSort={handleSort}
        sortColumn={sort.column}
        sortDirection={sort.direction}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        isLoading={isLoading}
      />

      {/* Import Modal */}
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        isOpen={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Leads"
        message={`Are you sure you want to delete ${selectedLeads.length} lead${selectedLeads.length > 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </div>
  );
}

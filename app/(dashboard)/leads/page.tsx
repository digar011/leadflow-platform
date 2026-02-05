"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Download, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { useLeads, useLeadStats, useDeleteLead, type LeadFilters as LeadFiltersType, type LeadSort } from "@/lib/hooks/useLeads";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [sort, setSort] = useState<LeadSort>({ column: "created_at", direction: "desc" });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const { data, isLoading, error } = useLeads({ page, pageSize, filters, sort });
  const { data: stats } = useLeadStats();
  const deleteLead = useDeleteLead();

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
          <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
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

      {/* Filters */}
      <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* View Toggle and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedLeads.length > 0 && (
            <span className="text-sm text-text-secondary">
              {selectedLeads.length} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Link href="/leads/kanban">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="icon"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </Link>
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
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        isLoading={isLoading}
      />
    </div>
  );
}

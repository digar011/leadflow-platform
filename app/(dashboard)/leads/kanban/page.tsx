"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { useLeads, useUpdateLead, useLeadStats } from "@/lib/hooks/useLeads";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card, CardContent } from "@/components/ui/Card";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function KanbanPage() {
  const router = useRouter();
  const { can } = useSubscription();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch all leads for kanban (no pagination)
  const { data, isLoading, error, refetch } = useLeads({
    pageSize: 500, // Get all leads for kanban view
  });
  const { data: stats } = useLeadStats();
  const updateLead = useUpdateLead();

  // Redirect free-tier users to list view (after all hooks)
  if (!can("pipelineView")) {
    router.replace("/leads");
    return null;
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await updateLead.mutateAsync({
      id: leadId,
      updates: { status: newStatus },
    });
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-text-secondary">
            Drag and drop leads to update their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/leads">
            <Button variant="secondary" size="sm" leftIcon={<List className="h-4 w-4" />}>
              List View
            </Button>
          </Link>
          <Link href="/leads/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Lead</Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">Total in Pipeline</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total - (stats.statusCounts.won || 0) - (stats.statusCounts.lost || 0)}
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
              <p className="text-sm text-text-muted">Won This Month</p>
              <p className="text-2xl font-bold text-pipeline-won">
                {stats.statusCounts.won || 0}
              </p>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2">
              <p className="text-sm text-text-muted">Lost This Month</p>
              <p className="text-2xl font-bold text-pipeline-lost">
                {stats.statusCounts.lost || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load leads. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <KanbanBoard
        key={refreshKey}
        leads={data?.leads || []}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </div>
  );
}

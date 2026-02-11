"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useFollowUpStats } from "@/lib/hooks/useAnalytics";

export function FollowUpWidgets() {
  const { data: stats, isLoading } = useFollowUpStats();

  if (isLoading || !stats) return null;

  const hasOverdue = stats.overdue.length > 0;
  const hasDueToday = stats.dueToday.length > 0;
  const hasStale = stats.staleLeads.length > 0;

  if (!hasOverdue && !hasDueToday && !hasStale) return null;

  return (
    <div className="space-y-4">
      {/* Overdue Alert Banner */}
      {hasOverdue && (
        <div className="flex items-start gap-3 rounded-lg border border-status-error/30 bg-status-error/10 p-4">
          <AlertTriangle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-status-error">
              {stats.overdue.length} overdue follow-up{stats.overdue.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {stats.overdue.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="text-sm text-text-secondary hover:text-gold transition-colors underline underline-offset-2"
                >
                  {lead.business_name}
                </Link>
              ))}
              {stats.overdue.length > 5 && (
                <span className="text-sm text-text-muted">
                  +{stats.overdue.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      {(hasDueToday || hasStale) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasDueToday && (
            <Card variant="glass" padding="sm">
              <CardContent className="flex items-center gap-4 pt-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                  <Calendar className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.dueToday.length}
                  </p>
                  <p className="text-sm text-text-muted">Due Today</p>
                </div>
              </CardContent>
            </Card>
          )}
          {hasStale && (
            <Card variant="glass" padding="sm">
              <CardContent className="flex items-center gap-4 pt-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.staleLeads.length}
                  </p>
                  <p className="text-sm text-text-muted">Stale (7+ days)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

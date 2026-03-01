"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  Megaphone,
  TrendingUp,
  Play,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useReports, useDeleteReport } from "@/lib/hooks/useReports";
import { REPORT_TYPES } from "@/lib/utils/constants";

const typeIcons: Record<string, React.ReactNode> = {
  leads: <Users className="h-4 w-4" />,
  activities: <TrendingUp className="h-4 w-4" />,
  campaigns: <Megaphone className="h-4 w-4" />,
  pipeline: <BarChart3 className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

const scheduleLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  none: "Manual",
};

export default function ReportsPage() {
  const { data: reports, isLoading, error } = useReports();
  const deleteReport = useDeleteReport();
  const [, setRunningReportId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteReport.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary">
            Generate and schedule reports for your data
          </p>
        </div>
        <Link href="/reports/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Report</Button>
        </Link>
      </div>

      {/* Pre-built Reports */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.slice(0, 4).map((type) => (
            <Card
              key={type.value}
              variant="glass"
              hover
              className="cursor-pointer"
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    {typeIcons[type.value]}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{type.label}</p>
                    <p className="text-xs text-text-muted">Run instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load reports. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass" className="animate-pulse">
              <CardContent className="pt-4">
                <div className="h-16 bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Saved Reports */}
      {!isLoading && reports && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Saved Reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <Card variant="glass">
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-secondary">No saved reports yet</p>
                <p className="text-sm text-text-muted mt-1">
                  Create a report to save it for later
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} variant="glass">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-text-secondary">
                          {typeIcons[report.report_type]}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{report.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" size="sm">
                              {REPORT_TYPES.find((t) => t.value === report.report_type)?.label || report.report_type}
                            </Badge>
                            {report.schedule && report.schedule !== "none" && (
                              <Badge variant="info" size="sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {scheduleLabels[report.schedule]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.last_generated_at && (
                          <span className="text-xs text-text-muted">
                            Last run: {format(new Date(report.last_generated_at), "MMM d, h:mm a")}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRunningReportId(report.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                          className="text-status-error hover:text-status-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

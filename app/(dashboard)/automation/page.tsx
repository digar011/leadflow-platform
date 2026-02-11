"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Plus,
  Zap,
  Play,
  Pause,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  useAutomationRules,
  useToggleAutomationRule,
  useDeleteAutomationRule,
  useAutomationStats,
  useAutomationLogs,
} from "@/lib/hooks/useAutomation";
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { UsageLimitBar } from "@/components/subscription";

export default function AutomationPage() {
  const { data: rules, isLoading, error } = useAutomationRules();
  const { data: stats } = useAutomationStats();
  const { data: recentLogs } = useAutomationLogs();
  const toggleRule = useToggleAutomationRule();
  const deleteRule = useDeleteAutomationRule();

  const handleToggle = async (id: string, currentState: boolean) => {
    await toggleRule.mutateAsync({ id, isActive: !currentState });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this automation rule?")) {
      await deleteRule.mutateAsync(id);
    }
  };

  const getTriggerLabel = (type: string) => {
    return AUTOMATION_TRIGGERS.find((t) => t.value === type)?.label || type;
  };

  const getActionLabel = (type: string) => {
    return AUTOMATION_ACTIONS.find((a) => a.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Automation</h1>
          <p className="text-text-secondary">
            Create rules to automate your workflow
          </p>
        </div>
        <Link href="/automation/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Rule</Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Zap className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalRules}</p>
                <p className="text-xs text-text-muted">Total Rules</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Play className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.activeRules}</p>
                <p className="text-xs text-text-muted">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalExecutions}</p>
                <p className="text-xs text-text-muted">Executions</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.successRate.toFixed(0)}%
                </p>
                <p className="text-xs text-text-muted">Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Limit */}
      <UsageLimitBar feature="automationRules" currentUsage={stats?.totalRules || 0} showAlways />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Automation Rules ({rules?.length || 0})
          </h2>

          {/* Error State */}
          {error && (
            <Card variant="outlined" padding="md">
              <CardContent className="text-center text-status-error">
                Failed to load rules. Please try again.
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="glass" className="animate-pulse">
                  <CardContent className="pt-4">
                    <div className="h-20 bg-white/5 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && rules?.length === 0 && (
            <Card variant="glass">
              <CardContent className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-secondary">No automation rules yet</p>
                <p className="text-sm text-text-muted mt-1">
                  Create a rule to automate repetitive tasks
                </p>
                <Link href="/automation/new">
                  <Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />}>
                    Create Rule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Rules */}
          {!isLoading && rules && rules.length > 0 && (
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  variant="glass"
                  className={cn(!rule.is_active && "opacity-60")}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary">
                            {rule.name}
                          </h3>
                          {rule.is_active ? (
                            <Badge variant="success" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Inactive</Badge>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-text-muted mt-1">
                            {rule.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-text-secondary">
                            <span className="text-text-muted">When:</span>
                            {getTriggerLabel(rule.trigger_type)}
                          </div>
                          <div className="flex items-center gap-1 text-text-secondary">
                            <span className="text-text-muted">Then:</span>
                            {getActionLabel(rule.action_type)}
                          </div>
                        </div>
                        {(rule.trigger_count ?? 0) > 0 && (
                          <p className="text-xs text-text-muted mt-2">
                            Triggered {rule.trigger_count} times
                            {rule.last_triggered_at && (
                              <> • Last: {format(new Date(rule.last_triggered_at), "MMM d, h:mm a")}</>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(rule.id, rule.is_active ?? false)}
                        >
                          {rule.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Link href={`/automation/${rule.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
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

        {/* Recent Activity */}
        <div>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentLogs?.length ? (
                <div className="text-center py-4 text-text-muted">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.slice(0, 10).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-text-secondary truncate">
                          {log.automation_rules?.name ?? "Unknown Rule"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {log.businesses?.business_name || "Unknown"} •{" "}
                          {format(new Date(log.created_at!), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

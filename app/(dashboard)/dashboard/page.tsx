"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangeSelector, type DateRange } from "@/components/dashboard/DateRangeSelector";
import {
  LeadsTrendChart,
  RevenueTrendChart,
  PipelineFunnelChart,
  SourceDistributionChart,
  ActivityHeatmap,
} from "@/components/dashboard/Charts";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { FollowUpWidgets } from "@/components/dashboard/FollowUpWidgets";
import {
  useDashboardStats,
  useLeadsTrend,
  useRevenueTrend,
  usePipelineFunnel,
  useActivityHeatmap,
  useRecentActivities,
} from "@/lib/hooks/useAnalytics";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";
import { subDays } from "date-fns";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
    label: "Last 30 Days",
  });

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateRange);
  const { data: leadsTrend, isLoading: leadsTrendLoading } = useLeadsTrend(30);
  const { data: revenueTrend, isLoading: revenueTrendLoading } = useRevenueTrend(6);
  const { data: pipelineFunnel, isLoading: funnelLoading } = usePipelineFunnel();
  const { data: activityHeatmap, isLoading: heatmapLoading } = useActivityHeatmap(12);
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities(5);

  // Calculate change percentages
  const leadsChange = stats && stats.newLeadsPreviousWeek > 0
    ? ((stats.newLeadsThisWeek - stats.newLeadsPreviousWeek) / stats.newLeadsPreviousWeek) * 100
    : 0;

  const pipelineChange = stats && stats.previousPipelineValue > 0
    ? ((stats.pipelineValue - stats.previousPipelineValue) / stats.previousPipelineValue) * 100
    : 0;

  const conversionChange = stats && stats.previousConversionRate > 0
    ? stats.conversionRate - stats.previousConversionRate
    : 0;

  // Prepare source distribution data
  const sourceData = stats?.sourceCounts
    ? Object.entries(stats.sourceCounts)
        .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Overview of your leads and sales performance
          </p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* Follow-up Alerts */}
      <FollowUpWidgets />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={stats ? formatCompactNumber(stats.totalLeads) : "0"}
          change={leadsChange}
          changeLabel="vs last week"
          icon={Building2}
          isLoading={statsLoading}
          href="/leads"
          tooltip="Total number of businesses/leads in your system"
        />
        <KPICard
          title="New This Week"
          value={stats?.newLeadsThisWeek || 0}
          change={leadsChange}
          changeLabel="vs previous week"
          icon={Users}
          isLoading={statsLoading}
          href="/leads"
          tooltip="Leads created in the last 7 days"
        />
        <KPICard
          title="Pipeline Value"
          value={stats ? formatCurrency(stats.pipelineValue) : "$0"}
          change={pipelineChange}
          changeLabel="vs last week"
          icon={DollarSign}
          iconColor="text-gold"
          isLoading={statsLoading}
          href="/leads/kanban"
          tooltip="Total estimated value of all active deals in your pipeline (excludes won/lost)"
        />
        <KPICard
          title="Conversion Rate"
          value={stats ? `${stats.conversionRate.toFixed(1)}%` : "0%"}
          change={conversionChange}
          changeLabel="pp vs last week"
          icon={Target}
          isLoading={statsLoading}
          href="/reports"
          tooltip="Percentage of total leads that have been marked as won"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadsTrendChart
          data={leadsTrend || []}
          title="New Leads (30 Days)"
          icon={<TrendingUp className="h-5 w-5 text-gold" />}
          isLoading={leadsTrendLoading}
        />
        <RevenueTrendChart
          data={revenueTrend || []}
          title="Won Revenue (6 Months)"
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          isLoading={revenueTrendLoading}
        />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineFunnelChart
            data={pipelineFunnel || []}
            title="Pipeline Overview"
            icon={<BarChart3 className="h-5 w-5 text-gold" />}
            isLoading={funnelLoading}
          />
        </div>
        <SourceDistributionChart
          data={sourceData}
          title="Lead Sources"
          icon={<PieChart className="h-5 w-5 text-gold" />}
          isLoading={statsLoading}
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap
        data={activityHeatmap || []}
        title="Activity Heatmap (Last 12 Weeks)"
        icon={<Calendar className="h-5 w-5 text-gold" />}
        isLoading={heatmapLoading}
      />

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivityFeed
            activities={recentActivities || []}
            isLoading={activitiesLoading}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsPanel />
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/leads?status=won">
          <Card variant="glass" padding="sm" hover className="cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-success/20">
                <TrendingUp className="h-5 w-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.wonDealsCount || 0}
                </p>
                <p className="text-sm text-text-muted">Deals Won</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/leads?status=won">
          <Card variant="glass" padding="sm" hover className="cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <DollarSign className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats ? formatCurrency(stats.wonDealsValue) : "$0"}
                </p>
                <p className="text-sm text-text-muted">Revenue Won</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/activities">
          <Card variant="glass" padding="sm" hover className="cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-info/20">
                <Activity className="h-5 w-5 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.activitiesToday || 0}
                </p>
                <p className="text-sm text-text-muted">Activities Today</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports">
          <Card variant="glass" padding="sm" hover className="cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats ? formatCurrency(stats.avgDealSize) : "$0"}
                </p>
                <p className="text-sm text-text-muted">Avg Deal Size</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

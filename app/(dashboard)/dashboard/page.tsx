import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "LeadFlow Dashboard - Overview of your leads and activities",
};

// Placeholder KPI data (will be replaced with real data from Supabase)
const kpiData = [
  {
    title: "Total Leads",
    value: "1,234",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Building2,
  },
  {
    title: "New This Week",
    value: "89",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: Target,
  },
  {
    title: "Revenue Pipeline",
    value: "$284,500",
    change: "-3.2%",
    changeType: "negative" as const,
    icon: DollarSign,
  },
];

const recentActivities = [
  { id: 1, type: "email_sent", lead: "Acme Corp", user: "John Doe", time: "2 minutes ago" },
  { id: 2, type: "call_completed", lead: "TechStart Inc", user: "Jane Smith", time: "15 minutes ago" },
  { id: 3, type: "meeting_scheduled", lead: "Global Services", user: "John Doe", time: "1 hour ago" },
  { id: 4, type: "status_changed", lead: "NewVenture LLC", user: "Jane Smith", time: "2 hours ago" },
  { id: 5, type: "note_added", lead: "Enterprise Co", user: "John Doe", time: "3 hours ago" },
];

const pipelineStages = [
  { name: "New", count: 45, color: "bg-pipeline-new" },
  { name: "Contacted", count: 32, color: "bg-pipeline-contacted" },
  { name: "Qualified", count: 28, color: "bg-pipeline-qualified" },
  { name: "Proposal", count: 15, color: "bg-pipeline-proposal" },
  { name: "Negotiation", count: 8, color: "bg-pipeline-negotiation" },
  { name: "Won", count: 12, color: "bg-pipeline-won" },
];

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
        <p className="text-text-secondary">
          Here&apos;s what&apos;s happening with your leads today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{kpi.title}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{kpi.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
                  <kpi.icon className="h-6 w-6 text-gold" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                {kpi.changeType === "positive" ? (
                  <ArrowUpRight className="h-4 w-4 text-status-success" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-status-error" />
                )}
                <span
                  className={
                    kpi.changeType === "positive"
                      ? "text-status-success"
                      : "text-status-error"
                  }
                >
                  {kpi.change}
                </span>
                <span className="text-text-muted">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold" />
              Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-text-secondary">
                    {stage.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-full rounded-lg bg-background-secondary overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500`}
                        style={{
                          width: `${(stage.count / 45) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-text-primary">
                    {stage.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gold" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10">
                    <Calendar className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {activity.lead}
                    </p>
                    <p className="text-xs text-text-muted">
                      {activity.type.replace("_", " ")} by {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="glass" padding="sm">
          <CardContent className="flex items-center gap-4 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-success/20">
              <TrendingUp className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">156</p>
              <p className="text-sm text-text-muted">Emails Sent Today</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="flex items-center gap-4 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-info/20">
              <Users className="h-5 w-5 text-status-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">23</p>
              <p className="text-sm text-text-muted">Calls Made Today</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="flex items-center gap-4 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-warning/20">
              <Calendar className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">8</p>
              <p className="text-sm text-text-muted">Meetings Today</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="flex items-center gap-4 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
              <Target className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">3</p>
              <p className="text-sm text-text-muted">Deals Closed Today</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

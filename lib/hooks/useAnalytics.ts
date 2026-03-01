"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import { subDays, startOfDay, format, subWeeks, subMonths } from "date-fns";
import { useViewMode } from "@/lib/contexts/ViewModeContext";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  newLeadsPreviousWeek: number;
  pipelineValue: number;
  previousPipelineValue: number;
  wonDealsCount: number;
  wonDealsValue: number;
  conversionRate: number;
  previousConversionRate: number;
  avgDealSize: number;
  totalActivities: number;
  activitiesToday: number;
  statusCounts: Record<string, number>;
  temperatureCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PipelineFunnelData {
  stage: string;
  count: number;
  value: number;
  color: string;
}

export function useDashboardStats(dateRange?: DateRange) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["dashboardStats", dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), isAdminView],
    queryFn: async () => {
      // Get all leads
      const { data: leads, error: leadsError } = await supabase
        .from("businesses")
        .select("id, status, lead_temperature, source, deal_value, created_at");

      if (leadsError) throw leadsError;

      // Calculate stats
      const now = new Date();
      const weekAgo = subWeeks(now, 1);
      const twoWeeksAgo = subWeeks(now, 2);

      const totalLeads = leads?.length || 0;

      const newLeadsThisWeek = leads?.filter(
        (l) => new Date(l.created_at!) >= weekAgo
      ).length || 0;

      const newLeadsPreviousWeek = leads?.filter(
        (l) => {
          const date = new Date(l.created_at!);
          return date >= twoWeeksAgo && date < weekAgo;
        }
      ).length || 0;

      // Pipeline value (excluding won and lost)
      const pipelineLeads = leads?.filter(
        (l) => !["won", "lost", "do_not_contact"].includes(l.status ?? "")
      );
      const pipelineValue = pipelineLeads?.reduce(
        (sum, l) => sum + (l.deal_value || 0),
        0
      ) || 0;

      // Won deals
      const wonLeads = leads?.filter((l) => l.status === "won");
      const wonDealsCount = wonLeads?.length || 0;
      const wonDealsValue = wonLeads?.reduce(
        (sum, l) => sum + (l.deal_value || 0),
        0
      ) || 0;

      // Previous pipeline value (pipeline from leads created before this week)
      const previousPipelineLeads = leads?.filter(
        (l) =>
          new Date(l.created_at!) < weekAgo &&
          !["won", "lost", "do_not_contact"].includes(l.status ?? "")
      );
      const previousPipelineValue = previousPipelineLeads?.reduce(
        (sum, l) => sum + (l.deal_value || 0),
        0
      ) || 0;

      // Conversion rate
      const conversionRate = totalLeads > 0
        ? (wonDealsCount / totalLeads) * 100
        : 0;

      // Previous conversion rate (leads created before this week)
      const leadsBeforeThisWeek = leads?.filter(
        (l) => new Date(l.created_at!) < weekAgo
      );
      const wonBeforeThisWeek = leadsBeforeThisWeek?.filter(
        (l) => l.status === "won"
      ).length || 0;
      const previousConversionRate = leadsBeforeThisWeek?.length
        ? (wonBeforeThisWeek / leadsBeforeThisWeek.length) * 100
        : 0;

      // Average deal size
      const dealsWithValue = leads?.filter((l) => l.deal_value && l.deal_value > 0);
      const avgDealSize = dealsWithValue?.length
        ? dealsWithValue.reduce((sum, l) => sum + (l.deal_value || 0), 0) / dealsWithValue.length
        : 0;

      // Status counts
      const statusCounts: Record<string, number> = {};
      leads?.forEach((l) => {
        const s = l.status ?? "unknown";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      // Temperature counts
      const temperatureCounts: Record<string, number> = {};
      leads?.forEach((l) => {
        if (l.lead_temperature) {
          temperatureCounts[l.lead_temperature] = (temperatureCounts[l.lead_temperature] || 0) + 1;
        }
      });

      // Source counts
      const sourceCounts: Record<string, number> = {};
      leads?.forEach((l) => {
        if (l.source) {
          sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
        }
      });

      // Get today's activities count (resilient — don't break dashboard if activities table fails)
      let activitiesToday = 0;
      let totalActivities = 0;
      try {
        const today = startOfDay(now);
        const todayResult = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());
        activitiesToday = todayResult.count || 0;

        const totalResult = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true });
        totalActivities = totalResult.count || 0;
      } catch {
        // Activities table may not be ready — continue with 0s
      }

      return {
        totalLeads,
        newLeadsThisWeek,
        newLeadsPreviousWeek,
        pipelineValue,
        previousPipelineValue,
        wonDealsCount,
        wonDealsValue,
        conversionRate,
        previousConversionRate,
        avgDealSize,
        totalActivities,
        activitiesToday,
        statusCounts,
        temperatureCounts,
        sourceCounts,
      } as DashboardStats;
    },
  });
}

export interface FollowUpStats {
  overdue: { id: string; business_name: string; next_follow_up: string }[];
  dueToday: { id: string; business_name: string; next_follow_up: string }[];
  staleLeads: { id: string; business_name: string; updated_at: string }[];
}

export function useFollowUpStats() {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["followUpStats", isAdminView],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss");

      // Overdue follow-ups
      const { data: overdue } = await supabase
        .from("businesses")
        .select("id, business_name, next_follow_up")
        .lt("next_follow_up", today)
        .not("status", "in", '("won","lost","do_not_contact")')
        .not("next_follow_up", "is", null)
        .order("next_follow_up", { ascending: true })
        .limit(10);

      // Due today
      const { data: dueToday } = await supabase
        .from("businesses")
        .select("id, business_name, next_follow_up")
        .eq("next_follow_up", today)
        .not("status", "in", '("won","lost","do_not_contact")')
        .order("business_name");

      // Stale leads (not updated in 7+ days, active status)
      const { data: stale } = await supabase
        .from("businesses")
        .select("id, business_name, updated_at")
        .lt("updated_at", sevenDaysAgo)
        .not("status", "in", '("won","lost","do_not_contact")')
        .order("updated_at", { ascending: true })
        .limit(10);

      return {
        overdue: overdue || [],
        dueToday: dueToday || [],
        staleLeads: stale || [],
      } as FollowUpStats;
    },
    refetchInterval: 60000,
  });
}

export function useLeadsTrend(days: number = 30) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["leadsTrend", days, isAdminView],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      const { data, error } = await supabase
        .from("businesses")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, number> = {};
      data?.forEach((lead) => {
        const date = format(new Date(lead.created_at!), "yyyy-MM-dd");
        grouped[date] = (grouped[date] || 0) + 1;
      });

      // Fill in missing dates with 0
      const result: ChartDataPoint[] = [];
      for (let i = 0; i <= days; i++) {
        const date = format(subDays(new Date(), days - i), "yyyy-MM-dd");
        result.push({
          date,
          value: grouped[date] || 0,
          label: format(new Date(date), "MMM d"),
        });
      }

      return result;
    },
  });
}

export function useRevenueTrend(months: number = 6) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["revenueTrend", months, isAdminView],
    queryFn: async () => {
      const startDate = subMonths(new Date(), months);

      const { data, error } = await supabase
        .from("businesses")
        .select("deal_value, created_at, status")
        .gte("created_at", startDate.toISOString())
        .eq("status", "won");

      if (error) throw error;

      // Group by month
      const grouped: Record<string, number> = {};
      data?.forEach((lead) => {
        const month = format(new Date(lead.created_at!), "yyyy-MM");
        grouped[month] = (grouped[month] || 0) + (lead.deal_value || 0);
      });

      // Create result with all months
      const result: ChartDataPoint[] = [];
      for (let i = months; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const month = format(date, "yyyy-MM");
        result.push({
          date: month,
          value: grouped[month] || 0,
          label: format(date, "MMM yyyy"),
        });
      }

      return result;
    },
  });
}

export function usePipelineFunnel() {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["pipelineFunnel", isAdminView],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("status, deal_value");

      if (error) throw error;

      const stages = [
        { stage: "New", status: "new", color: "#6366f1" },
        { stage: "Contacted", status: "contacted", color: "#8b5cf6" },
        { stage: "Qualified", status: "qualified", color: "#ec4899" },
        { stage: "Proposal", status: "proposal", color: "#f97316" },
        { stage: "Negotiation", status: "negotiation", color: "#eab308" },
        { stage: "Won", status: "won", color: "#22c55e" },
      ];

      return stages.map((s) => {
        const leads = data?.filter((l) => l.status === s.status) || [];
        return {
          stage: s.stage,
          count: leads.length,
          value: leads.reduce((sum, l) => sum + (l.deal_value || 0), 0),
          color: s.color,
        };
      }) as PipelineFunnelData[];
    },
  });
}

export function useActivityHeatmap(weeks: number = 12) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["activityHeatmap", weeks, isAdminView],
    retry: 1,
    queryFn: async () => {
      const startDate = subWeeks(new Date(), weeks);

      const { data, error } = await supabase
        .from("activities")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Group by day of week and hour
      const heatmap: Record<string, Record<number, number>> = {
        Sun: {},
        Mon: {},
        Tue: {},
        Wed: {},
        Thu: {},
        Fri: {},
        Sat: {},
      };

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      data?.forEach((activity) => {
        const date = new Date(activity.created_at!);
        const dayName = dayNames[date.getDay()];
        const hour = date.getHours();
        heatmap[dayName][hour] = (heatmap[dayName][hour] || 0) + 1;
      });

      // Convert to array format for chart
      const result: { day: string; hour: number; count: number }[] = [];
      dayNames.forEach((day) => {
        for (let hour = 8; hour <= 18; hour++) {
          result.push({
            day,
            hour,
            count: heatmap[day][hour] || 0,
          });
        }
      });

      return result;
    },
  });
}

export function useRecentActivities(limit: number = 10) {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["recentActivities", limit, isAdminView],
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          id,
          activity_type,
          subject,
          created_at,
          profiles(full_name),
          businesses(business_name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useTopPerformers() {
  const supabase = getSupabaseClient();
  const { isAdminView } = useViewMode();

  return useQuery({
    queryKey: ["topPerformers", isAdminView],
    queryFn: async () => {
      // Get activities grouped by user
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("user_id, profiles(full_name)")
        .gte("created_at", subWeeks(new Date(), 1).toISOString());

      if (activitiesError) throw activitiesError;

      // Get won deals by user
      const { data: wonDeals, error: wonError } = await supabase
        .from("businesses")
        .select("assigned_to, deal_value")
        .eq("status", "won")
        .gte("created_at", subWeeks(new Date(), 1).toISOString());

      if (wonError) throw wonError;

      // Aggregate by user
      const userStats: Record<string, {
        name: string;
        activities: number;
        wonDeals: number;
        wonValue: number;
      }> = {};

      activities?.forEach((a) => {
        if (a.user_id && a.profiles) {
          if (!userStats[a.user_id]) {
            userStats[a.user_id] = {
              name: a.profiles.full_name ?? "Unknown",
              activities: 0,
              wonDeals: 0,
              wonValue: 0,
            };
          }
          userStats[a.user_id].activities++;
        }
      });

      wonDeals?.forEach((d) => {
        if (d.assigned_to && userStats[d.assigned_to]) {
          userStats[d.assigned_to].wonDeals++;
          userStats[d.assigned_to].wonValue += d.deal_value || 0;
        }
      });

      // Sort by activities
      return Object.values(userStats)
        .sort((a, b) => b.activities - a.activities)
        .slice(0, 5);
    },
  });
}

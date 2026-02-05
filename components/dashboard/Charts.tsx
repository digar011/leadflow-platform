"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";
import type { ChartDataPoint, PipelineFunnelData } from "@/lib/hooks/useAnalytics";

interface ChartContainerProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

function ChartContainer({ title, icon, children, isLoading }: ChartContainerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-text-muted">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface LeadsTrendChartProps {
  data: ChartDataPoint[];
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function LeadsTrendChart({ data, title = "Leads Trend", icon, isLoading }: LeadsTrendChartProps) {
  return (
    <ChartContainer title={title} icon={icon} isLoading={isLoading}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d4af37"
              strokeWidth={2}
              fill="url(#colorLeads)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface RevenueTrendChartProps {
  data: ChartDataPoint[];
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function RevenueTrendChart({ data, title = "Revenue Trend", icon, isLoading }: RevenueTrendChartProps) {
  return (
    <ChartContainer title={title} icon={icon} isLoading={isLoading}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface PipelineFunnelChartProps {
  data: PipelineFunnelData[];
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function PipelineFunnelChart({ data, title = "Pipeline Overview", icon, isLoading }: PipelineFunnelChartProps) {
  return (
    <ChartContainer title={title} icon={icon} isLoading={isLoading}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 50, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              formatter={(value: number, name: string) => {
                if (name === "count") return [value, "Leads"];
                return [formatCurrency(value), "Value"];
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface SourceDistributionChartProps {
  data: { name: string; value: number }[];
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const COLORS = ["#d4af37", "#6366f1", "#22c55e", "#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#eab308"];

export function SourceDistributionChart({ data, title = "Lead Sources", icon, isLoading }: SourceDistributionChartProps) {
  return (
    <ChartContainer title={title} icon={icon} isLoading={isLoading}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}
              formatter={(value) => <span className="text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface ActivityHeatmapProps {
  data: { day: string; hour: number; count: number }[];
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function ActivityHeatmap({ data, title = "Activity Heatmap", icon, isLoading }: ActivityHeatmapProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

  const getColor = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count <= 2) return "bg-gold/20";
    if (count <= 5) return "bg-gold/40";
    if (count <= 10) return "bg-gold/60";
    return "bg-gold/80";
  };

  return (
    <ChartContainer title={title} icon={icon} isLoading={isLoading}>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Hour labels */}
          <div className="flex pl-12 gap-1 mb-1">
            {hours.map((hour) => (
              <div key={hour} className="flex-1 text-center text-xs text-text-muted">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-10 text-xs text-text-muted text-right pr-2">{day}</div>
              {hours.map((hour) => {
                const cell = data.find((d) => d.day === day && d.hour === hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`flex-1 h-6 rounded ${getColor(cell?.count || 0)} transition-colors cursor-pointer hover:ring-1 hover:ring-gold/50`}
                    title={`${day} ${hour}:00 - ${cell?.count || 0} activities`}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-text-muted">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-white/5" />
              <div className="w-4 h-4 rounded bg-gold/20" />
              <div className="w-4 h-4 rounded bg-gold/40" />
              <div className="w-4 h-4 rounded bg-gold/60" />
              <div className="w-4 h-4 rounded bg-gold/80" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}

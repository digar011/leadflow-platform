"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Filter,
  Building2,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useActivities } from "@/lib/hooks/useActivities";
import { ACTIVITY_TYPES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, React.ReactNode> = {
  call_outbound: <Phone className="h-4 w-4" />,
  call_inbound: <Phone className="h-4 w-4" />,
  call_voicemail: <Phone className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  email_received: <Mail className="h-4 w-4" />,
  email_opened: <Mail className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  meeting_completed: <Calendar className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  sms_sent: <MessageSquare className="h-4 w-4" />,
  sms_received: <MessageSquare className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  call_outbound: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  call_inbound: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  email_sent: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  email_received: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  meeting_scheduled: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  meeting_completed: "bg-green-500/20 text-green-400 border-green-500/30",
  note: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sms_sent: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  default: "bg-white/10 text-text-secondary border-white/20",
};

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const { data: activities, isLoading, error, refetch } = useActivities({
    type: typeFilter || undefined,
  });

  const getActivityLabel = (type: string) => {
    const found = ACTIVITY_TYPES.find((t) => t.value === type);
    return found?.label || type.replace(/_/g, " ");
  };

  // Group activities by date
  const groupedActivities = activities?.reduce((acc, activity) => {
    const date = format(new Date(activity.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  const sortedDates = Object.keys(groupedActivities || {}).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity Feed</h1>
          <p className="text-text-secondary">
            Recent activity across all leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[{ value: "", label: "All Activity Types" }, ...ACTIVITY_TYPES]}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load activities. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-white/10 rounded" />
                <div className="h-3 w-2/3 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities?.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No activities yet
          </h2>
          <p className="text-text-secondary">
            Activities will appear here as you interact with leads
          </p>
        </div>
      )}

      {/* Activities Timeline */}
      {!isLoading && sortedDates.length > 0 && (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span className="text-sm font-medium text-text-primary">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Activities for this date */}
              <div className="space-y-3 pl-4 border-l-2 border-white/10">
                {groupedActivities?.[date]?.map((activity) => {
                  const icon =
                    activityIcons[activity.activity_type] || activityIcons.default;
                  const colorClass =
                    activityColors[activity.activity_type] || activityColors.default;

                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className="absolute -left-[calc(1rem+5px)] top-2 w-2 h-2 rounded-full bg-white/30" />

                      {/* Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border flex-shrink-0",
                          colorClass
                        )}
                      >
                        {icon}
                      </div>

                      {/* Content */}
                      <Card variant="glass" padding="sm" className="flex-1">
                        <CardContent className="pt-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="default" size="sm">
                                  {getActivityLabel(activity.activity_type)}
                                </Badge>
                                <span className="text-text-muted text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(activity.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="font-medium text-text-primary mt-1">
                                {activity.subject}
                              </p>
                              {activity.description && (
                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                                  {activity.description}
                                </p>
                              )}
                              {activity.profiles && (
                                <p className="text-xs text-text-muted mt-2">
                                  by {activity.profiles.full_name}
                                </p>
                              )}
                            </div>

                            {/* Business Link */}
                            {activity.business_id && (
                              <Link
                                href={`/leads/${activity.business_id}`}
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-gold flex-shrink-0"
                              >
                                <Building2 className="h-3 w-3" />
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

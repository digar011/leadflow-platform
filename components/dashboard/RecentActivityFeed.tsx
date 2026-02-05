"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
  businesses?: { business_name: string } | null;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  call_outbound: <Phone className="h-4 w-4" />,
  call_inbound: <Phone className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  email_received: <Mail className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  meeting_completed: <Calendar className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  sms_sent: <MessageSquare className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  call_outbound: "bg-blue-500/20 text-blue-400",
  call_inbound: "bg-blue-500/20 text-blue-400",
  email_sent: "bg-purple-500/20 text-purple-400",
  email_received: "bg-purple-500/20 text-purple-400",
  meeting_scheduled: "bg-orange-500/20 text-orange-400",
  meeting_completed: "bg-green-500/20 text-green-400",
  note: "bg-gray-500/20 text-gray-400",
  sms_sent: "bg-pink-500/20 text-pink-400",
  default: "bg-gold/20 text-gold",
};

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gold" />
          Recent Activity
        </CardTitle>
        <Link href="/activities" className="text-sm text-gold hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const icon = activityIcons[activity.activity_type] || activityIcons.default;
              const colorClass = activityColors[activity.activity_type] || activityColors.default;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      colorClass
                    )}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {activity.businesses?.business_name || "Unknown"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {activity.title || activity.activity_type.replace(/_/g, " ")}
                      {activity.profiles && ` by ${activity.profiles.full_name}`}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

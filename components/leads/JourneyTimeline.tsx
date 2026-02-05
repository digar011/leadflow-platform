"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Globe,
  MessageSquare,
  DollarSign,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user_name?: string;
}

interface JourneyTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const eventIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  email_received: <Mail className="h-4 w-4" />,
  email_open: <Eye className="h-4 w-4" />,
  email_click: <MousePointerClick className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  website_visit: <Globe className="h-4 w-4" />,
  form_submission: <FileText className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  proposal_sent: <DollarSign className="h-4 w-4" />,
  deal_won: <CheckCircle2 className="h-4 w-4" />,
  deal_lost: <XCircle className="h-4 w-4" />,
  status_change: <Edit className="h-4 w-4" />,
  task_created: <Clock className="h-4 w-4" />,
  task_completed: <CheckCircle2 className="h-4 w-4" />,
  contact_added: <UserPlus className="h-4 w-4" />,
  default: <Clock className="h-4 w-4" />,
};

const eventColors: Record<string, string> = {
  call: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  email_sent: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  email_received: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  email_open: "bg-green-500/20 text-green-400 border-green-500/30",
  email_click: "bg-green-500/20 text-green-400 border-green-500/30",
  meeting: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  note: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  website_visit: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  form_submission: "bg-gold/20 text-gold border-gold/30",
  sms: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  proposal_sent: "bg-gold/20 text-gold border-gold/30",
  deal_won: "bg-green-500/20 text-green-400 border-green-500/30",
  deal_lost: "bg-red-500/20 text-red-400 border-red-500/30",
  status_change: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  task_created: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  task_completed: "bg-green-500/20 text-green-400 border-green-500/30",
  contact_added: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  default: "bg-white/10 text-text-secondary border-white/20",
};

export function JourneyTimeline({ events, isLoading }: JourneyTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-white/10 rounded" />
              <div className="h-3 w-2/3 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No activity recorded yet</p>
        <p className="text-sm mt-1">Interactions will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const icon = eventIcons[event.type] || eventIcons.default;
          const colorClass = eventColors[event.type] || eventColors.default;
          const isFirst = index === 0;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border",
                  colorClass,
                  isFirst && "ring-2 ring-offset-2 ring-offset-background"
                )}
              >
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {event.user_name && (
                      <p className="text-xs text-text-muted mt-1">
                        by {event.user_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-text-muted whitespace-nowrap">
                    <p>{format(new Date(event.created_at), "MMM d, h:mm a")}</p>
                    <p className="mt-0.5">
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 p-2 rounded-md bg-white/5 text-xs">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-text-muted capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-text-secondary">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

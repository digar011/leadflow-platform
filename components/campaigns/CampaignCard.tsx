"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Mail,
  Phone,
  Megaphone,
  Globe,
  Layers,
  Users,
  Calendar,
  DollarSign,
  MoreVertical,
  Play,
  Pause,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    campaign_type: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    spent: number | null;
    target_count: number | null;
    profiles?: { full_name: string } | null;
  };
  onStatusChange?: (id: string, status: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  cold_call: <Phone className="h-4 w-4" />,
  mailer: <Megaphone className="h-4 w-4" />,
  social: <Globe className="h-4 w-4" />,
  multi_channel: <Layers className="h-4 w-4" />,
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  draft: { color: "bg-white/10 text-text-muted", icon: null },
  active: { color: "bg-green-500/20 text-green-400", icon: <Play className="h-3 w-3" /> },
  paused: { color: "bg-yellow-500/20 text-yellow-400", icon: <Pause className="h-3 w-3" /> },
  completed: { color: "bg-blue-500/20 text-blue-400", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function CampaignCard({ campaign, onStatusChange }: CampaignCardProps) {
  const typeIcon = typeIcons[campaign.campaign_type] || <Megaphone className="h-4 w-4" />;
  const statusInfo = statusConfig[campaign.status] || statusConfig.draft;
  const budgetProgress = campaign.budget && campaign.spent
    ? (campaign.spent / campaign.budget) * 100
    : 0;

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card variant="glass" hover className="h-full">
        <CardContent className="pt-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 text-gold">
                {typeIcon}
              </div>
              <div>
                <h3 className="font-medium text-text-primary line-clamp-2">
                  {campaign.name}
                </h3>
                <p className="text-xs text-text-muted capitalize">
                  {campaign.campaign_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <Badge
              variant="default"
              size="sm"
              className={statusInfo.color}
            >
              {statusInfo.icon}
              <span className="ml-1 capitalize">{campaign.status}</span>
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {campaign.target_count !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-text-muted" />
                <span className="text-text-secondary">
                  {campaign.target_count} targets
                </span>
              </div>
            )}
            {campaign.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-text-muted" />
                <span className="text-text-secondary">
                  {format(new Date(campaign.start_date), "MMM d")}
                  {campaign.end_date && ` - ${format(new Date(campaign.end_date), "MMM d")}`}
                </span>
              </div>
            )}
          </div>

          {/* Budget Progress */}
          {campaign.budget !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Budget</span>
                <span className="text-text-secondary">
                  {formatCurrency(campaign.spent || 0)} / {formatCurrency(campaign.budget)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    budgetProgress > 90
                      ? "bg-red-500"
                      : budgetProgress > 70
                      ? "bg-yellow-500"
                      : "bg-gold"
                  )}
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Owner */}
          {campaign.profiles && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-text-muted">
                Created by {campaign.profiles.full_name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

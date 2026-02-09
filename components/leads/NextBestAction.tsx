"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { getNextBestActions, type NextAction } from "@/lib/utils/nextBestAction";
import type { LeadStatus, LeadTemperature } from "@/lib/types/database";

interface NextBestActionProps {
  status: LeadStatus;
  temperature: LeadTemperature;
  daysSinceLastActivity: number | null;
  hasFollowUp: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasDealValue: boolean;
  onActionClick?: (actionType: string) => void;
}

const priorityStyles = {
  high: "border-gold/30 bg-gold/5",
  medium: "border-white/10 bg-white/5",
  low: "border-white/5 bg-white/[0.02]",
};

export function NextBestAction({
  status,
  temperature,
  daysSinceLastActivity,
  hasFollowUp,
  hasEmail,
  hasPhone,
  hasDealValue,
  onActionClick,
}: NextBestActionProps) {
  const actions = getNextBestActions({
    status,
    temperature,
    daysSinceLastActivity,
    hasFollowUp,
    hasEmail,
    hasPhone,
    hasDealValue,
  });

  if (actions.length === 0) return null;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-gold" />
          Suggested Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.actionType && onActionClick?.(action.actionType)}
            disabled={!action.actionType}
            className={cn(
              "w-full text-left rounded-lg border p-3 transition-all",
              priorityStyles[action.priority],
              action.actionType && "hover:border-gold/50 cursor-pointer"
            )}
          >
            <p className="text-sm font-medium text-text-primary">
              {action.label}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {action.description}
            </p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

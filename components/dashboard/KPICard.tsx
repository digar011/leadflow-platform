"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus, Info, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
  href?: string;
  tooltip?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  iconColor = "text-gold",
  isLoading,
  href,
  tooltip,
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const changeType = change === undefined ? null : change > 0 ? "positive" : change < 0 ? "negative" : "neutral";

  if (isLoading) {
    return (
      <Card hover>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-lg" />
            </div>
            <div className="mt-4 h-4 w-36 bg-white/10 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <Card hover className={href ? "cursor-pointer" : undefined}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-text-secondary">{title}</p>
              {tooltip && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTooltip(!showTooltip); }}
                    className="text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  {showTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 px-3 py-2 text-xs text-text-primary bg-background-secondary border border-white/10 rounded-lg shadow-lg z-50">
                      {tooltip}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", iconColor === "text-gold" ? "bg-gold/10" : "bg-white/10")}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            {changeType === "positive" ? (
              <ArrowUpRight className="h-4 w-4 text-status-success" />
            ) : changeType === "negative" ? (
              <ArrowDownRight className="h-4 w-4 text-status-error" />
            ) : (
              <Minus className="h-4 w-4 text-text-muted" />
            )}
            <span
              className={cn(
                changeType === "positive"
                  ? "text-status-success"
                  : changeType === "negative"
                  ? "text-status-error"
                  : "text-text-muted"
              )}
            >
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span className="text-text-muted">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

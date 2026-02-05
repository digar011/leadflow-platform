"use client";

import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementScoreProps {
  score: number;
  previousScore?: number;
  lastActivityDate?: string;
  factors?: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    description?: string;
  }[];
}

export function EngagementScore({
  score,
  previousScore,
  lastActivityDate,
  factors = [],
}: EngagementScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-gold";
    if (value >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return "Highly Engaged";
    if (value >= 60) return "Engaged";
    if (value >= 40) return "Moderate";
    if (value >= 20) return "Low";
    return "At Risk";
  };

  const getScoreBackground = (value: number) => {
    if (value >= 80) return "from-green-500/20 to-green-500/5";
    if (value >= 60) return "from-gold/20 to-gold/5";
    if (value >= 40) return "from-orange-500/20 to-orange-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  const trend = previousScore !== undefined ? score - previousScore : 0;
  const daysSinceActivity = lastActivityDate
    ? Math.floor(
        (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Main Score Display */}
      <div
        className={cn(
          "relative p-6 rounded-xl bg-gradient-to-br border border-white/10",
          getScoreBackground(score)
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted uppercase tracking-wider">
              Engagement Score
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={cn("text-4xl font-bold", getScoreColor(score))}>
                {score}
              </span>
              <span className="text-text-muted">/100</span>
            </div>
            <p className={cn("text-sm mt-1", getScoreColor(score))}>
              {getScoreLabel(score)}
            </p>
          </div>

          {/* Circular Progress */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(score / 100) * 220} 220`}
                strokeLinecap="round"
                className={getScoreColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {score >= 60 ? (
                <CheckCircle2 className={cn("h-8 w-8", getScoreColor(score))} />
              ) : (
                <AlertTriangle className={cn("h-8 w-8", getScoreColor(score))} />
              )}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        {previousScore !== undefined && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-400" />
            ) : (
              <Minus className="h-4 w-4 text-text-muted" />
            )}
            <span
              className={cn(
                "text-sm",
                trend > 0
                  ? "text-green-400"
                  : trend < 0
                  ? "text-red-400"
                  : "text-text-muted"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend} from last week
            </span>
          </div>
        )}
      </div>

      {/* Last Activity Warning */}
      {daysSinceActivity !== null && daysSinceActivity > 7 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
          <p className="text-sm text-orange-400">
            No activity in {daysSinceActivity} days - consider following up
          </p>
        </div>
      )}

      {/* Score Factors */}
      {factors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">Score Factors</p>
          <div className="space-y-1">
            {factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm p-2 rounded bg-white/5"
              >
                {factor.impact === "positive" ? (
                  <TrendingUp className="h-3 w-3 text-green-400 flex-shrink-0" />
                ) : factor.impact === "negative" ? (
                  <TrendingDown className="h-3 w-3 text-red-400 flex-shrink-0" />
                ) : (
                  <Minus className="h-3 w-3 text-text-muted flex-shrink-0" />
                )}
                <span
                  className={cn(
                    factor.impact === "positive"
                      ? "text-green-400"
                      : factor.impact === "negative"
                      ? "text-red-400"
                      : "text-text-muted"
                  )}
                >
                  {factor.name}
                </span>
                {factor.description && (
                  <span className="text-text-muted ml-auto">
                    {factor.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

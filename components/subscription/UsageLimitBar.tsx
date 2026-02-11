"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "./UpgradeModal";
import type { FeatureKey } from "@/lib/utils/subscription";
import { useSubscription } from "@/lib/hooks/useSubscription";

const FEATURE_LABELS: Partial<Record<FeatureKey, string>> & Record<string, string> = {
  leads: "Leads",
  users: "Users",
  campaigns: "Campaigns",
  automationRules: "Automation Rules",
  savedReports: "Saved Reports",
  csvExport: "CSV Export",
  reportScheduling: "Report Scheduling",
  apiAccess: "API Access",
  webhooks: "Webhooks",
  scopedApiKeys: "Scoped API Keys",
  adminPanel: "Admin Panel",
  auditLogs: "Audit Logs",
  teamRoles: "Team Roles",
};

interface UsageLimitBarProps {
  feature: FeatureKey;
  featureLabel?: string;
  currentUsage: number;
  className?: string;
  showAlways?: boolean;
}

export function UsageLimitBar({
  feature,
  featureLabel,
  currentUsage,
  className,
  showAlways = false,
}: UsageLimitBarProps) {
  const label = featureLabel || FEATURE_LABELS[feature] || feature;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { limit: getLimit, nearLimit, atLimit } = useSubscription();

  const max = getLimit(feature);
  if (max === Infinity) return null;
  if (max === 0 && !showAlways) return null;

  // Feature unavailable on this tier — show upgrade prompt instead of "N / 0"
  if (max === 0) {
    return (
      <>
        <div
          className={cn(
            "rounded-lg border border-white/10 bg-white/5 p-3",
            className
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {label}: Not available on your plan
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpgrade(true)}
              className="text-gold hover:text-gold-light"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature={feature}
          featureLabel={label}
          currentUsage={currentUsage}
          currentLimit={max}
        />
      </>
    );
  }

  const ratio = currentUsage / max;
  const isNear = nearLimit(currentUsage, feature);
  const isOver = atLimit(currentUsage, feature);

  if (!showAlways && !isNear) return null;

  const barColor = isOver
    ? "bg-status-error"
    : isNear
    ? "bg-status-warning"
    : "bg-gold";

  return (
    <>
      <div
        className={cn(
          "rounded-lg border border-white/10 bg-white/5 p-3",
          className
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isNear && (
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            )}
            <span className="text-sm text-text-secondary">
              {label}: {currentUsage.toLocaleString()} /{" "}
              {max.toLocaleString()}
            </span>
          </div>
          {isNear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpgrade(true)}
              className="text-gold hover:text-gold-light"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              barColor
            )}
            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
          />
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={feature}
        featureLabel={label}
        currentUsage={currentUsage}
        currentLimit={max}
      />
    </>
  );
}

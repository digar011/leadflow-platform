"use client";

import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import type { FeatureKey } from "@/lib/utils/subscription";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { getPlanDefinition, minimumTierForFeature } from "@/lib/utils/subscription";

interface FeatureGateProps {
  feature: FeatureKey;
  featureLabel: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  feature,
  featureLabel,
  children,
  fallback,
}: FeatureGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { can } = useSubscription();

  if (can(feature)) {
    return <>{children}</>;
  }

  const requiredTier = minimumTierForFeature(feature);
  const requiredPlan = getPlanDefinition(requiredTier);

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-muted hover:border-gold/30 hover:bg-gold/5 transition-all cursor-pointer w-full"
      >
        <Lock className="h-4 w-4 text-gold" />
        <span>
          {featureLabel} — Available on {requiredPlan.name} and above
        </span>
      </button>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={feature}
        featureLabel={featureLabel}
      />
    </>
  );
}

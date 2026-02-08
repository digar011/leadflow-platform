"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Crown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { FeatureKey } from "@/lib/utils/subscription";
import {
  getPlanDefinition,
  minimumTierForFeature,
  formatPrice,
} from "@/lib/utils/subscription";
import { useSubscription } from "@/lib/hooks/useSubscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureKey;
  featureLabel?: string;
  currentUsage?: number;
  currentLimit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  featureLabel,
  currentUsage,
  currentLimit,
}: UpgradeModalProps) {
  const router = useRouter();
  const { tier } = useSubscription();

  const requiredTier = minimumTierForFeature(feature);
  const requiredPlan = getPlanDefinition(requiredTier);
  const currentPlan = getPlanDefinition(tier);

  const handleViewPlans = () => {
    onClose();
    router.push("/pricing");
  };

  const handleGoToBilling = () => {
    onClose();
    router.push("/settings/billing");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Required" size="md">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
            <Lock className="h-7 w-7 text-gold" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            {featureLabel || "This feature"} requires {requiredPlan.name}
          </h3>
          {currentUsage !== undefined && currentLimit !== undefined && featureLabel && (
            <p className="text-sm text-text-secondary">
              You&apos;ve used {currentUsage.toLocaleString()} of{" "}
              {currentLimit.toLocaleString()} {featureLabel.toLowerCase()} on your{" "}
              {currentPlan.name} plan.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <Badge className="bg-white/10 text-text-muted">{currentPlan.name}</Badge>
            <p className="text-xs text-text-muted mt-1">
              {formatPrice(currentPlan.monthlyPrice)}/mo
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gold" />
          <div className="text-center">
            <Badge variant="gold">{requiredPlan.name}</Badge>
            <p className="text-xs text-gold mt-1">
              {formatPrice(requiredPlan.monthlyPrice)}/mo
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button variant="outline" onClick={handleViewPlans} className="flex-1">
            View All Plans
          </Button>
          <Button onClick={handleGoToBilling} className="flex-1">
            <Crown className="h-4 w-4 mr-1.5" />
            Upgrade
          </Button>
        </div>
      </div>
    </Modal>
  );
}

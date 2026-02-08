"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SubscriptionTier, BillingCycle } from "@/lib/types/database";
import type { FeatureKey } from "@/lib/utils/subscription";
import {
  getPlanDefinition,
  hasFeature,
  getNumericLimit,
  isNearLimit,
  isAtLimit,
  minimumTierForFeature,
  TIER_ORDER,
} from "@/lib/utils/subscription";

export function useSubscription() {
  const supabase = getSupabaseClient();

  const { data, isLoading } = useQuery({
    queryKey: ["currentUserSubscription"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_billing_cycle")
        .eq("id", user.id)
        .single();

      if (error) {
        // Gracefully handle missing columns (migration not yet applied)
        return { tier: "free" as SubscriptionTier, billingCycle: "monthly" as BillingCycle };
      }
      return {
        tier: (profile.subscription_tier as SubscriptionTier) ?? "free",
        billingCycle: (profile.subscription_billing_cycle as BillingCycle) ?? "monthly",
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const tier: SubscriptionTier = data?.tier ?? "free";
  const billingCycle: BillingCycle = data?.billingCycle ?? "monthly";
  const plan = getPlanDefinition(tier);

  const can = (feature: FeatureKey): boolean => hasFeature(tier, feature);

  const limit = (feature: FeatureKey): number => getNumericLimit(tier, feature);

  const nearLimit = (usage: number, feature: FeatureKey, threshold?: number): boolean =>
    isNearLimit(usage, tier, feature, threshold);

  const atLimit = (usage: number, feature: FeatureKey): boolean =>
    isAtLimit(usage, tier, feature);

  const requiredTier = (feature: FeatureKey): SubscriptionTier =>
    minimumTierForFeature(feature);

  const isUpgrade = (targetTier: SubscriptionTier): boolean =>
    TIER_ORDER.indexOf(targetTier) > TIER_ORDER.indexOf(tier);

  return {
    tier,
    billingCycle,
    plan,
    can,
    limit,
    nearLimit,
    atLimit,
    requiredTier,
    isUpgrade,
    isLoading,
  };
}

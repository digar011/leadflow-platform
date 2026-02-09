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
        .select("subscription_tier, subscription_billing_cycle, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end")
        .eq("id", user.id)
        .single();

      if (error) {
        // Gracefully handle missing columns (migration not yet applied)
        return {
          tier: "free" as SubscriptionTier,
          billingCycle: "monthly" as BillingCycle,
          stripeCustomerId: null as string | null,
          stripeSubscriptionId: null as string | null,
          subscriptionStatus: null as string | null,
          currentPeriodEnd: null as string | null,
        };
      }
      return {
        tier: (profile.subscription_tier as SubscriptionTier) ?? "free",
        billingCycle: (profile.subscription_billing_cycle as BillingCycle) ?? "monthly",
        stripeCustomerId: (profile as Record<string, unknown>).stripe_customer_id as string | null ?? null,
        stripeSubscriptionId: (profile as Record<string, unknown>).stripe_subscription_id as string | null ?? null,
        subscriptionStatus: (profile as Record<string, unknown>).subscription_status as string | null ?? null,
        currentPeriodEnd: (profile as Record<string, unknown>).current_period_end as string | null ?? null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const tier: SubscriptionTier = data?.tier ?? "free";
  const billingCycle: BillingCycle = data?.billingCycle ?? "monthly";
  const stripeCustomerId = data?.stripeCustomerId ?? null;
  const stripeSubscriptionId = data?.stripeSubscriptionId ?? null;
  const subscriptionStatus = data?.subscriptionStatus ?? null;
  const currentPeriodEnd = data?.currentPeriodEnd ?? null;
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
    stripeCustomerId,
    stripeSubscriptionId,
    subscriptionStatus,
    currentPeriodEnd,
    can,
    limit,
    nearLimit,
    atLimit,
    requiredTier,
    isUpgrade,
    isLoading,
  };
}

"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { SubscriptionTier } from "@/lib/types/database";
import type { FeatureKey } from "@/lib/utils/subscription";
import { getNumericLimit } from "@/lib/utils/subscription";

export class LimitReachedError extends Error {
  feature: FeatureKey;
  currentUsage: number;
  limit: number;
  tier: SubscriptionTier;

  constructor(
    feature: FeatureKey,
    currentUsage: number,
    limit: number,
    tier: SubscriptionTier
  ) {
    super(`LIMIT_REACHED:${feature}`);
    this.name = "LimitReachedError";
    this.feature = feature;
    this.currentUsage = currentUsage;
    this.limit = limit;
    this.tier = tier;
  }
}

export async function checkResourceLimit(
  table: string,
  feature: FeatureKey
): Promise<void> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  // Gracefully default to free if column doesn't exist yet
  const tier: SubscriptionTier = profileError
    ? "free"
    : (profile?.subscription_tier as SubscriptionTier) ?? "free";
  const limit = getNumericLimit(tier, feature);

  if (limit === Infinity) return;

  const { count } = await (supabase
    .from(table as "profiles")
    .select("*", { count: "exact", head: true }) as unknown as Promise<{ count: number | null }>);

  const currentUsage = count ?? 0;

  if (currentUsage >= limit) {
    throw new LimitReachedError(feature, currentUsage, limit, tier);
  }
}

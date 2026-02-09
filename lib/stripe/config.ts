import type { SubscriptionTier, BillingCycle } from "@/lib/types/database";

// Maps each paid tier + billing cycle to a Stripe Price ID.
// These must match prices created in your Stripe Dashboard.
// Free tier has no Stripe price (no subscription needed).
// Enterprise tier uses custom pricing (contact sales).
export const STRIPE_PRICE_IDS: Partial<
  Record<SubscriptionTier, Record<BillingCycle, string>>
> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || "",
  },
  growth: {
    monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_GROWTH_ANNUAL || "",
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || "",
  },
};

// Reverse lookup: Stripe Price ID -> { tier, billingCycle }
export function tierFromPriceId(
  priceId: string
): { tier: SubscriptionTier; billingCycle: BillingCycle } | null {
  for (const [tier, cycles] of Object.entries(STRIPE_PRICE_IDS)) {
    if (!cycles) continue;
    for (const [cycle, id] of Object.entries(cycles)) {
      if (id && id === priceId) {
        return {
          tier: tier as SubscriptionTier,
          billingCycle: cycle as BillingCycle,
        };
      }
    }
  }
  return null;
}

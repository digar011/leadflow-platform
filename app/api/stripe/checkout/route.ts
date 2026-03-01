import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_PRICE_IDS } from "@/lib/stripe/config";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";
import type { SubscriptionTier, BillingCycle } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 2. Parse and validate
    const { tier, billingCycle } = (await request.json()) as {
      tier: SubscriptionTier;
      billingCycle: BillingCycle;
    };

    if (tier === "free" || tier === "enterprise") {
      return ApiErrors.badRequest("Cannot checkout for free or enterprise tier");
    }

    const priceId = STRIPE_PRICE_IDS[tier]?.[billingCycle];
    if (!priceId) {
      return ApiErrors.badRequest("Invalid plan selection");
    }

    // 3. Get or create Stripe Customer
    const serviceSupabase = await createServiceSupabaseClient();
    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile?.email || user.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Store customer ID (service role bypasses protect_profile_columns)
      await serviceSupabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // 4. Create Checkout Session
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?status=success`,
      cancel_url: `${appUrl}/pricing?status=canceled`,
      metadata: {
        supabase_user_id: user.id,
        tier,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier,
          billingCycle,
        },
      },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    return handleApiError(error, { route: "/api/stripe/checkout" });
  }
}

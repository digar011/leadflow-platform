import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { tierFromPriceId } from "@/lib/stripe/config";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/utils/logger";
import { ApiErrors } from "@/lib/utils/api-errors";
import type Stripe from "stripe";
import type { Database } from "@/lib/types/database";

const log = createLogger({ route: "/api/webhooks/stripe" });

// Lazy Supabase service client for webhook processing
function getSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type SupabaseAdmin = ReturnType<typeof getSupabase>;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return ApiErrors.badRequest("Missing signature");
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    log.error("Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
    return ApiErrors.badRequest("Invalid signature");
  }

  const supabase = getSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(
          event.data.object as Stripe.Checkout.Session,
          stripe,
          supabase
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;
      default:
        log.info("Unhandled Stripe event", { eventType: event.type });
    }
  } catch (error) {
    log.error("Webhook processing failed", { eventType: event.type, error: error instanceof Error ? error.message : String(error) });
    return ApiErrors.internalError("Webhook processing failed");
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: SupabaseAdmin
) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId || session.mode !== "subscription") return;

  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price.id;
  if (!priceId) {
    log.error("No price ID found on subscription items");
    return;
  }

  const tierInfo = tierFromPriceId(priceId);
  if (!tierInfo) {
    log.error("Unknown price ID from checkout", { priceId });
    return;
  }

  const periodEnd = firstItem?.current_period_end;

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      subscription_tier: tierInfo.tier,
      subscription_billing_cycle: tierInfo.billingCycle,
      subscription_status: subscription.status,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price.id;
  const tierInfo = priceId ? tierFromPriceId(priceId) : null;

  const periodEnd = firstItem?.current_period_end;
  const updates: Record<string, unknown> = {
    subscription_status: subscription.status,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
  };

  if (tierInfo) {
    updates.subscription_tier = tierInfo.tier;
    updates.subscription_billing_cycle = tierInfo.billingCycle;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic updates object from Stripe webhook
  await (supabase.from("profiles") as any).update(updates).eq("id", userId);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_billing_cycle: "monthly",
      subscription_status: "canceled",
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .eq("id", userId);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: SupabaseAdmin
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

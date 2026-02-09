import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { tierFromPriceId } from "@/lib/stripe/config";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Lazy Supabase service client for webhook processing
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
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
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>
) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId || session.mode !== "subscription") return;

  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  const tierInfo = tierFromPriceId(priceId);
  if (!tierInfo) {
    console.error(`Unknown price ID from checkout: ${priceId}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      subscription_tier: tierInfo.tier,
      subscription_billing_cycle: tierInfo.billingCycle,
      subscription_status: subscription.status,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient>
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const tierInfo = tierFromPriceId(priceId);

  const updates: Record<string, unknown> = {
    subscription_status: subscription.status,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  };

  if (tierInfo) {
    updates.subscription_tier = tierInfo.tier;
    updates.subscription_billing_cycle = tierInfo.billingCycle;
  }

  await supabase.from("profiles").update(updates).eq("id", userId);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient>
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
  supabase: ReturnType<typeof createClient>
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

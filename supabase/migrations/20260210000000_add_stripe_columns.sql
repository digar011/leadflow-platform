-- Migration: Add Stripe subscription tracking columns to profiles
-- Date: 2026-02-10

-- Stripe customer identifier (unique per user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Stripe subscription identifier (unique per user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;

-- Subscription lifecycle status synced from Stripe webhooks
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT
  CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete'))
  DEFAULT NULL;

-- When the current billing period ends (from Stripe)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ DEFAULT NULL;

-- Indexes for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- =============================================================================
-- Update protect_profile_columns() to also guard the new Stripe fields.
-- Users must not be able to set their own stripe_customer_id, subscription_status, etc.
-- Only service_role (server-side webhook handler) can modify these.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role to modify anything (admin / webhook operations)
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Existing protections
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    NEW.role := OLD.role;
  END IF;

  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;

  IF OLD.subscription_billing_cycle IS DISTINCT FROM NEW.subscription_billing_cycle THEN
    NEW.subscription_billing_cycle := OLD.subscription_billing_cycle;
  END IF;

  -- Stripe field protections
  IF OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id THEN
    NEW.stripe_customer_id := OLD.stripe_customer_id;
  END IF;

  IF OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id THEN
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  END IF;

  IF OLD.subscription_status IS DISTINCT FROM NEW.subscription_status THEN
    NEW.subscription_status := OLD.subscription_status;
  END IF;

  IF OLD.current_period_end IS DISTINCT FROM NEW.current_period_end THEN
    NEW.current_period_end := OLD.current_period_end;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

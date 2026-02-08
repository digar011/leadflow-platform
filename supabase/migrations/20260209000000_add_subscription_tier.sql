-- Add subscription tier and billing cycle columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT
  CHECK (subscription_tier IN ('free', 'starter', 'growth', 'business', 'enterprise'))
  DEFAULT 'free';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_billing_cycle TEXT
  CHECK (subscription_billing_cycle IN ('monthly', 'annual'))
  DEFAULT 'monthly';

-- Index for efficient tier-based queries and admin filtering
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

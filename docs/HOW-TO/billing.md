# Billing & Subscription Guide

This guide covers everything about LeadFlow's pricing tiers, subscription management, and feature gating.

## Table of Contents
- [Pricing Tiers Overview](#pricing-tiers-overview)
- [Feature Comparison](#feature-comparison)
- [Viewing the Pricing Page](#viewing-the-pricing-page)
- [Billing Settings](#billing-settings)
- [Understanding Usage Limits](#understanding-usage-limits)
- [Upgrade Prompts](#upgrade-prompts)
- [Admin: Managing User Tiers](#admin-managing-user-tiers)
- [Database Details](#database-details)
- [Developer Reference](#developer-reference)
- [Troubleshooting](#troubleshooting)

---

## Pricing Tiers Overview

LeadFlow offers five subscription tiers:

| Tier | Monthly | Annual (per month) | Target Audience |
|------|---------|-------------------|-----------------|
| **Free** | $0 | $0 | Getting started |
| **Starter** | $49 | $39 | Small teams |
| **Growth** | $129 | $109 | Growing businesses |
| **Business** | $299 | $249 | Scaling organizations |
| **Enterprise** | Custom | Custom | Large teams |

All new users start on the **Free** tier by default.

---

## Feature Comparison

### Resource Limits

| Resource | Free | Starter | Growth | Business | Enterprise |
|----------|------|---------|--------|----------|------------|
| Leads | 50 | 500 | 5,000 | 25,000 | Unlimited |
| Users | 1 | 3 | 10 | 25 | Unlimited |
| Campaigns | 1 | 5 | 25 | Unlimited | Unlimited |
| Automation Rules | 0 | 3 | 20 | Unlimited | Unlimited |
| Saved Reports | 0 | 5 | Unlimited | Unlimited | Unlimited |

### Feature Access

| Feature | Free | Starter | Growth | Business | Enterprise |
|---------|------|---------|--------|----------|------------|
| CSV Export | -- | -- | Yes | Yes | Yes |
| Report Scheduling | -- | -- | -- | Yes | Yes |
| API Access | -- | -- | Yes | Yes | Yes |
| Webhooks | -- | -- | Yes | Yes | Yes |
| Scoped API Keys | -- | -- | -- | Yes | Yes |
| Dedicated API | -- | -- | -- | -- | Yes |
| Admin Panel | -- | -- | -- | Yes | Yes |
| Audit Logs | -- | -- | -- | Yes | Yes |
| Audit Log Export | -- | -- | -- | -- | Yes |
| Team Roles (RBAC) | -- | Yes | Yes | Yes | Yes |
| Custom Reports | -- | -- | -- | -- | Yes |
| BI Integration | -- | -- | -- | -- | Yes |
| SLA Support | -- | -- | -- | -- | Yes |

---

## Viewing the Pricing Page

1. Navigate to `/pricing` -- this is a **public page** (no login required).
2. The page displays all five tiers as cards.
3. Use the **Monthly / Annual** toggle at the top to switch billing cycles.
4. The **Growth** tier is highlighted as "Most Popular".
5. Each card shows:
   - Plan name and tagline
   - Price (per month)
   - Key features with check/cross indicators
   - Call-to-action button
6. Below the cards, a **Feature Comparison** table provides a detailed side-by-side breakdown.

---

## Billing Settings

Access your billing settings at **Settings > Billing & Plan** (`/settings/billing`).

### What You'll See

1. **Current Plan Card**
   - Your active tier name and badge
   - Billing cycle (monthly or annual)
   - Current price

2. **Usage Summary**
   - Progress bars for each tracked resource:
     - **Leads**: Current count vs. plan limit
     - **Campaigns**: Current count vs. plan limit
     - **Automation Rules**: Current count vs. plan limit
     - **Saved Reports**: Current count vs. plan limit
   - Color coding:
     - **Gold/default**: Under 80% usage
     - **Amber**: 80--99% usage (near limit)
     - **Red**: 100% usage (at limit)

3. **Change Plan Button**
   - Links to the `/pricing` page to compare plans

---

## Understanding Usage Limits

### Usage Bars

Resource pages (Leads, Campaigns, Automation) display a **UsageLimitBar** at the top showing your current usage relative to your plan limit.

- **Normal** (< 80%): Gold progress bar
- **Near Limit** (80--99%): Amber progress bar with warning text
- **At Limit** (100%): Red progress bar with an **Upgrade** button

### Enforcement

When you try to create a resource beyond your plan limit:

1. The create mutation calls `checkResourceLimit()` before proceeding.
2. If the limit is reached, a `LimitReachedError` is thrown.
3. The **Upgrade Modal** appears, showing:
   - Your current plan
   - The minimum plan required for more resources
   - Buttons to view all plans or go to billing settings

### Sidebar Navigation

Features unavailable on your tier are hidden from the sidebar. For example:
- **Free** tier: Automation, certain report features are hidden
- **Starter** tier: Campaigns visible (limit of 5), automation visible (limit of 3)
- **Growth** and above: All features visible

---

## Upgrade Prompts

The **Upgrade Modal** appears in three scenarios:

1. **Resource limit reached**: When you try to create a lead, campaign, automation rule, or report beyond your plan's limit.
2. **Feature not available**: When you try to access a feature not included in your tier (e.g., API access on Free tier).
3. **Manual trigger**: When you click an upgrade button on a usage bar.

The modal shows:
- A lock icon and explanation
- Your current plan badge and price
- The required plan badge and price
- Three action buttons: "Maybe Later", "View All Plans", and "Upgrade"

---

## Admin: Managing User Tiers

Admins can change any user's subscription tier from the Admin Panel.

### Steps

1. Navigate to **Admin > User Management** (`/admin/users`).
2. Find the user in the table.
3. Use the **Plan** dropdown column to select a new tier.
4. The change is saved immediately via the `useUpdateUserTier()` mutation.
5. The user's feature access and resource limits update on their next page load.

### Direct Database Update

Alternatively, update tiers via SQL:

```sql
-- Upgrade a user to Growth tier with annual billing
UPDATE public.profiles
SET subscription_tier = 'growth',
    subscription_billing_cycle = 'annual'
WHERE email = 'user@example.com';
```

Valid values for `subscription_tier`: `free`, `starter`, `growth`, `business`, `enterprise`
Valid values for `subscription_billing_cycle`: `monthly`, `annual`

---

## Database Details

### Migration

The subscription system requires the migration `20260209000000_add_subscription_tier.sql`, which adds:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT
  CHECK (subscription_tier IN ('free','starter','growth','business','enterprise'))
  DEFAULT 'free';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_billing_cycle TEXT
  CHECK (subscription_billing_cycle IN ('monthly','annual'))
  DEFAULT 'monthly';

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
```

### Graceful Degradation

If the migration has not been applied:
- The `useSubscription` hook defaults to `free` tier
- The `checkResourceLimit()` function defaults to `free` tier limits
- No errors are thrown -- the app functions normally with Free-tier restrictions
- Apply the migration at any time to unlock full tier management

---

## Developer Reference

### Key Files

| File | Purpose |
|------|---------|
| `lib/utils/subscription.ts` | Plan definitions, limits, feature keys, helper functions |
| `lib/hooks/useSubscription.ts` | Hook: `can()`, `limit()`, `nearLimit()`, `atLimit()` |
| `lib/hooks/useGatedMutation.ts` | `checkResourceLimit()` pre-flight check |
| `components/subscription/UpgradeModal.tsx` | Modal shown on limit/feature gate |
| `components/subscription/UsageLimitBar.tsx` | Progress bar with usage stats |
| `components/subscription/FeatureGate.tsx` | Wrapper for tier-gated UI sections |
| `app/pricing/page.tsx` | Public pricing page |
| `app/(dashboard)/settings/billing/page.tsx` | Billing settings page |

### Adding a New Gated Feature

1. Add the feature key to the `FeatureKey` type in `lib/utils/subscription.ts`.
2. Add the limit value for each tier in `PLAN_DEFINITIONS`.
3. Add a row to `PLAN_FEATURE_ROWS` for the pricing comparison table.
4. Use `useSubscription().can('yourFeature')` in components to check access.
5. Wrap UI sections with `<FeatureGate feature="yourFeature">`.

### Adding a Resource Limit Check

In your create mutation hook, add before the Supabase insert:

```typescript
await checkResourceLimit("your_table_name", "yourFeatureKey");
```

This will throw a `LimitReachedError` if the user has reached their plan limit for that resource.

---

## Troubleshooting

### All users show as "Free" tier

**Cause**: The subscription migration has not been applied.

**Fix**: Run `20260209000000_add_subscription_tier.sql` in the Supabase SQL Editor or via `npx supabase db push`.

### Usage bar shows 0 / Unlimited

**Cause**: The user is on a tier with unlimited access for that resource (Business or Enterprise).

**This is expected behavior** -- no limit bar warning will appear.

### Upgrade modal crashes or shows "undefined"

**Cause**: The `featureLabel` prop was not provided and the fallback text is being used.

**Fix**: This was resolved -- the modal now shows "This feature requires [Plan Name]" when no label is provided.

### Sidebar shows/hides wrong items after tier change

**Cause**: The subscription data is cached for 5 minutes by React Query.

**Fix**: Refresh the page or wait for the cache to expire. The sidebar will update to reflect the new tier's feature access.

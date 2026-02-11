# Goldyon Setup Guide

This guide will walk you through setting up Goldyon for local development.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Supabase account** (free tier works)

## 1. Install Dependencies

```bash
npm install
```

## 2. Supabase Setup

1. Create an account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings > API** to get your credentials

## 3. Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Goldyon
N8N_WEBHOOK_SECRET=your-webhook-secret
```

## 4. Database Setup

Run the migration files in `supabase/migrations/` in order using the Supabase SQL Editor:

1. `0001_profiles.sql` through `0011_api_keys.sql` -- core schema
2. `20260209000000_add_subscription_tier.sql` -- adds subscription tier and billing cycle columns to profiles

Alternatively, run the combined file `supabase/combined_migrations.sql` for everything at once.

> **Note**: If you skip the subscription migration, the app still works but all users will default to the Free tier with limited access to features.

## 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Run Tests

```bash
npx playwright install
npm run test:e2e
```

## First Admin User

After registering, make yourself admin and optionally set a subscription tier:

```sql
-- Grant admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Optional: set subscription tier (free, starter, growth, business, enterprise)
UPDATE public.profiles
SET subscription_tier = 'business',
    subscription_billing_cycle = 'monthly'
WHERE email = 'your-email@example.com';
```

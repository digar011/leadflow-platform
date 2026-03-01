# ONBOARDING.md -- Goldyon / LeadFlow Platform

> Step-by-step guide for new developers joining the Goldyon CRM project.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Account Access](#account-access)
- [Local Environment Setup](#local-environment-setup)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [Architecture Overview](#architecture-overview)
- [Key Files Reference](#key-files-reference)
- [Role Hierarchy System](#role-hierarchy-system)
- [Subscription Tier System](#subscription-tier-system)
- [Common Gotchas](#common-gotchas)
- [Who to Contact](#who-to-contact)

---

## Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **Git** (for cloning the repo)
- **Docker Desktop** (only if running Supabase locally)
- A code editor (VS Code recommended)
- A **Supabase** account (free tier works for development)

---

## Account Access

You will need access to:

| Service         | Purpose                                | Who to ask     |
|-----------------|----------------------------------------|----------------|
| GitHub          | Repository access                      | Diego          |
| Supabase        | Database and auth (project dashboard)  | Diego          |
| Vercel          | Deployment dashboard                   | Diego          |
| Stripe (test)   | Payment testing (test mode keys)       | Diego          |

The GitHub repository is at: https://github.com/digar011/goldyon-platform.git

---

## Local Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/digar011/goldyon-platform.git
cd goldyon-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

---

## Supabase Setup

You have two options for the database:

### Option A: Use the Hosted Supabase Project (Recommended for Quick Start)

1. Get the Supabase URL and keys from Diego or from the Supabase dashboard.
2. The project URL is: `https://kitimzmjjuvznfiyjiuw.supabase.co`
3. Go to **Settings > API** in the Supabase dashboard to find the `anon key` and `service_role key`.

### Option B: Run Supabase Locally (Requires Docker)

```bash
# Start local Supabase services
npx supabase start

# The CLI will print the local URL and keys -- use these in .env.local
# API URL:     http://127.0.0.1:54321
# Anon key:    <printed>
# Service key: <printed>
# Studio URL:  http://127.0.0.1:54323
```

---

## Environment Variables

1. Copy the example file:

```bash
cp .env.example .env.local
```

2. Fill in the required values:

```env
# REQUIRED -- get these from Supabase dashboard or from npx supabase start
NEXT_PUBLIC_SUPABASE_URL=https://kitimzmjjuvznfiyjiuw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# REQUIRED -- app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Goldyon

# OPTIONAL -- webhook secret for n8n integration
N8N_WEBHOOK_SECRET=<any-secret-string>

# OPTIONAL -- Stripe (only needed if working on billing features)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OPTIONAL -- Resend (only needed if working on email features)
RESEND_API_KEY=re_...
```

> **Important:** Never commit `.env.local`. It is already in `.gitignore`.

---

## Database Migrations

The project has 26 migration files in `supabase/migrations/`. They must be applied in order.

### If Using Hosted Supabase

1. Open the **SQL Editor** in the Supabase dashboard.
2. Run `supabase/combined_migrations.sql` (contains all migrations in one file).
3. Alternatively, run each file in `supabase/migrations/` in alphabetical order.

### If Using Local Supabase

```bash
npx supabase db push
```

### Creating a Test User

After migrations are applied, create test accounts:

```bash
node scripts/create-test-users.mjs
```

This creates:
- `test@example.com` / `TestPassword123!` -- role: `user`, tier: `starter`
- `admin@example.com` / `AdminPassword123!` -- role: `org_admin`, tier: `enterprise`

### Making Yourself an Admin

The `protect_profile_columns()` trigger prevents users from changing their own role. You must run this SQL directly in the Supabase SQL Editor:

```sql
-- Grant super_admin role (full platform access)
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';

-- Set enterprise tier (access to all features)
UPDATE public.profiles
SET subscription_tier = 'enterprise',
    subscription_billing_cycle = 'monthly'
WHERE email = 'your-email@example.com';
```

---

## Running the App

```bash
npm run dev
```

Open http://localhost:3000. The app redirects to `/login` if not authenticated, or `/dashboard` if authenticated.

### Available Scripts

| Script          | Command                | Description                     |
|-----------------|------------------------|---------------------------------|
| `npm run dev`   | `next dev`             | Start development server        |
| `npm run build` | `next build`           | Create production build         |
| `npm start`     | `next start`           | Start production server         |
| `npm run lint`  | `next lint`            | Run ESLint                      |
| `npm run test:e2e`     | `playwright test`      | Run Playwright E2E tests |
| `npm run test:e2e:ui`  | `playwright test --ui` | Run Playwright with UI   |

---

## Running Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run with the interactive Playwright UI
npm run test:e2e:ui

# Run a specific test file
npx playwright test tests/e2e/leads.spec.ts
```

The E2E test suite has 23 spec files covering auth, leads, contacts, activities, campaigns, automation, reports, admin, settings, security, dashboard, CSV import/export, follow-ups, duplicate detection, mobile responsiveness, stage transitions, email capture, webhooks, and Stripe checkout.

There are also standalone test utilities in the `tests/` directory:
- `e2e-full-test.mjs` -- comprehensive test script (132/132 passing)
- `cleanup-e2e-data.mjs` -- cleans up test data from Supabase
- `setup-admin-test.mjs` -- sets up an admin test user
- `verify-admin-test-user.mjs` -- verifies admin test user exists

> **Note:** `tests/test-admin-rls.mjs` and `tests/update-tier.mjs` are gitignored because they contain hardcoded `service_role` keys. NEVER commit these files.

### Unit Tests

There are currently NO unit tests. Adding Jest and unit test coverage is a priority task. See `TODO.md`.

### Linting and Type Checking

```bash
# ESLint (extends next/core-web-vitals + next/typescript)
npm run lint

# TypeScript type checking (strict mode enabled)
npx tsc --noEmit
```

---

## Architecture Overview

### Next.js App Router

The project uses Next.js 14 with the App Router. Pages are organized into route groups:

- `(auth)/` -- Login, register, forgot-password. Uses a centered layout with branding.
- `(dashboard)/` -- All authenticated CRM pages. Uses a layout with sidebar + header.
- `admin/` -- Admin-only pages with a role check in the layout.
- `pricing/` -- Public pricing page (no auth required).
- `api/` -- Server-side API routes for admin, automation, email, leads, stripe, and webhooks.

### Supabase and Row Level Security (RLS)

Every database table has RLS enabled. Policies enforce:
- **Users** can only read/write their own data (scoped by `auth.uid()`).
- **Super admins** have full read/write access to all tables.
- **Org admins** have access scoped to their `organization_id`.
- The `protect_profile_columns()` trigger prevents users from modifying their own `role`, `subscription_tier`, or `subscription_billing_cycle` columns.

**Key RLS rule:** RLS policies must NOT reference `auth.users` -- regular users cannot query that table. Use `auth.jwt()` or query the `profiles` table instead.

### Data Fetching with TanStack React Query

All client-side data operations go through custom hooks in `lib/hooks/`:
- `useLeads.ts` -- Lead CRUD, stats, filters, with subscription limit checks
- `useContacts.ts` -- Contact CRUD
- `useActivities.ts` -- Activities, customer journey
- `useCampaigns.ts` -- Campaign CRUD, stats, with limit checks
- `useAutomation.ts` -- Automation rules, logs, stats, with limit checks
- `useReports.ts` -- Reports CRUD, generation, CSV export, with limit checks
- `useAnalytics.ts` -- Dashboard stats, trends, funnel, heatmap
- `useAdmin.ts` -- Users, system settings, audit logs, tier management
- `useSubscription.ts` -- Subscription tier, `can()`, `limit()`, `nearLimit()`

Supabase Realtime subscriptions automatically invalidate React Query cache on DB changes for leads, contacts, and activities.

### Authentication Flow

1. User signs up or logs in via Supabase Auth (email/password).
2. A database trigger auto-creates a row in the `profiles` table.
3. The Next.js middleware (`middleware.ts`) refreshes the session on every request.
4. Protected routes check for authentication in the `(dashboard)/layout.tsx`.
5. Admin routes additionally check the user's role via the `profiles` table.

### Role Hierarchy

See the [Role Hierarchy System](#role-hierarchy-system) section below for details.

### Subscription and Feature Gating

See the [Subscription Tier System](#subscription-tier-system) section below for details.

---

## Key Files Reference

### Role and Permission System
| File | Purpose |
|------|---------|
| `lib/contexts/ViewModeContext.tsx` | Role detection, view mode state, toggle logic |
| `lib/types/database.ts` | `UserRole` type: `super_admin \| org_admin \| admin \| manager \| user` |
| `lib/utils/permissions.ts` | `DEFAULT_PERMISSIONS` per role, `hasPermission()` helper |
| `middleware.ts` | Admin route guard (accepts super_admin/org_admin/admin) |
| `app/admin/layout.tsx` | Client-side admin access check |
| `app/api/admin/users/route.ts` | Admin API with role/tier/permissions management |
| `components/layout/Header.tsx` | View mode toggle UI |

### Subscription System
| File | Purpose |
|------|---------|
| `lib/utils/subscription.ts` | Plan definitions, limits, feature keys |
| `lib/hooks/useSubscription.ts` | `can()`, `limit()`, `atLimit()` helpers |
| `lib/hooks/useGatedMutation.ts` | `checkResourceLimit()` pre-flight for creates |
| `components/subscription/FeatureGate.tsx` | Wraps tier-restricted UI |
| `components/subscription/UsageLimitBar.tsx` | Usage progress bar |
| `components/subscription/UpgradeModal.tsx` | Upgrade prompt modal |

### Database and Auth
| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser Supabase client (singleton) |
| `lib/supabase/server.ts` | Server Supabase client + service role client |
| `lib/supabase/middleware.ts` | Session refresh middleware helper |
| `lib/types/database.ts` | Auto-generated Supabase types with Relationships |

### Core UI
| File | Purpose |
|------|---------|
| `components/ui/` | Base primitives: Button, Input, Card, Badge, Modal, Select |
| `components/layout/Sidebar.tsx` | Main sidebar navigation with feature gating |
| `components/layout/Header.tsx` | Top header with search, view toggle, user menu |
| `components/layout/DashboardShell.tsx` | Dashboard wrapper layout |

---

## Role Hierarchy System

The platform uses a 5-tier role hierarchy:

| Role | Access Level | View Toggle |
|------|-------------|-------------|
| `super_admin` | Full platform access (Goldyon/Codexium team) | 3-way: super admin -> org admin -> user |
| `org_admin` | Organization-scoped admin (business/enterprise customers) | 2-way: admin <-> user |
| `admin` | Legacy role, treated as `org_admin` via backward compatibility | 2-way: admin <-> user |
| `manager` | Mid-level -- can create/edit most resources, no delete | N/A |
| `user` | Standard -- can view and create only | N/A |

**View Mode Toggle:** Admins can "see the app as" lower-privilege roles to test the experience. The toggle appears in the Header component. Purple dot = super admin mode, gold switch = org admin mode.

**Safety Fallback:** The `SUPER_ADMIN_EMAILS` array in `ViewModeContext.tsx` hardcodes `diego.j.garnica@gmail.com` so this user always gets `super_admin` even if the database role is incorrect.

---

## Subscription Tier System

Five pricing tiers control feature access:

| Tier | Price | Leads | Campaigns | Automation | Reports |
|------|-------|-------|-----------|------------|---------|
| Free | $0 | 25 | 0 | 0 | 0 |
| Starter | $49/mo | 500 | 5 | 3 | 5 |
| Growth | $129/mo | 5,000 | 25 | 20 | Unlimited |
| Business | $299/mo | 25,000 | Unlimited | Unlimited | Unlimited |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Unlimited |

Feature gating is enforced through:
1. `useSubscription` hook -- provides `can(feature)`, `limit(feature)`, `atLimit()` helpers
2. `checkResourceLimit()` -- pre-flight check in create mutations, throws `LimitReachedError`
3. `FeatureGate` component -- wraps UI and shows locked state if feature unavailable
4. `UsageLimitBar` component -- visual progress bar (amber at 80%, red at 100%)
5. Sidebar gating -- nav items with `requiredFeature` are hidden for insufficient tiers

---

## Common Gotchas

1. **RLS and `auth.users`**: RLS policies must NOT reference `auth.users` -- regular users cannot query it. Use `auth.jwt()` only.

2. **`analytics_snapshots` unique constraint**: Has `UNIQUE(snapshot_date)`. Tests must delete existing rows before inserting for the same date.

3. **Supabase join inference**: The `Relationships` array in the `Database` type definition (`lib/types/database.ts`) is required for Supabase to infer join types. Without it, results are `never[]`.

4. **Windows/Bash `!` escaping**: The `!` character in passwords causes JSON parsing issues in bash. Always write `.mjs` script files for testing instead of using inline `node -e` commands.

5. **Test utility secrets**: `tests/test-admin-rls.mjs` and `tests/update-tier.mjs` contain hardcoded `service_role` keys and are gitignored. NEVER create or commit files containing secrets.

6. **ESLint during builds**: `next.config.mjs` has `ignoreDuringBuilds: true` for ESLint. `ignoreBuildErrors` for TypeScript was removed in PR #53 -- clean builds are enforced.

7. **Self-role modification blocked**: The `protect_profile_columns()` database trigger prevents users from modifying their own `role`, `subscription_tier`, or `subscription_billing_cycle` columns. Use the service role key or run SQL directly.

8. **Old Codexium tables**: Tables named `contacts_website_legacy` and `landing_pages_website_legacy` exist in the database from a previous Codexium website project. Ignore them.

---

## Who to Contact

| Topic | Contact |
|-------|---------|
| Project lead, access requests, architecture decisions | Diego (diego.j.garnica@gmail.com) |
| Supabase, database, migrations | Diego |
| Stripe, billing, payments | Diego |
| Design, UI/UX | Diego |

---

*See also: `CLAUDE.md` for project-specific development rules, `PRODUCT.md` for feature specs, `TODO.md` for the task queue, `CHANGELOG.md` for change history.*

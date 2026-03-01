# CLAUDE.md -- Goldyon / LeadFlow Platform

> **Project:** Goldyon -- Lead Intelligence & CRM Platform
> **Client:** Internal (Codexium / Goldyon)
> **Started:** 2026-02-04
> **Status:** Active

---

## Project Overview

Goldyon is a full-stack lead intelligence and customer relationship management platform built for local business lead generation. It provides a unified workspace to manage leads, track customer journeys, run marketing campaigns, automate workflows, and analyze sales performance -- all through a modern dark-themed interface with a gold accent design language.

---

## Stack (this project)

| Layer         | Technology                                                      |
|---------------|-----------------------------------------------------------------|
| Frontend      | Next.js 14 (App Router, RSC), React 18, TypeScript 5            |
| Styling       | TailwindCSS 3.4 with custom dark theme and gold accents          |
| Database      | PostgreSQL via Supabase (Row Level Security enabled)             |
| Auth          | Supabase Auth (email/password) with profiles table auto-trigger  |
| Data Fetching | TanStack React Query 5                                           |
| Hosting       | Vercel                                                           |
| Payments      | Stripe (checkout, portal, webhooks)                              |
| Email         | Resend (transactional email)                                     |
| Validation    | Zod 4 (forms), DOMPurify (HTML sanitization)                     |
| Charts        | Recharts 3                                                       |
| Animations    | Framer Motion 12                                                 |
| Unit Testing  | Jest 30 + ts-jest + @testing-library/jest-dom                    |
| E2E Testing   | Playwright                                                       |
| CI/CD         | GitHub Actions (lint, typecheck, unit tests, build, Lighthouse)  |
| Monitoring    | Sentry (@sentry/nextjs v10)                                      |

---

## Project Structure

```
goldyon-platform/
|-- app/                          # Next.js App Router pages
|   |-- (auth)/                   # Auth routes (login, register, forgot-password)
|   |-- (dashboard)/              # Main app routes (requires authentication)
|   |   |-- dashboard/page.tsx    # Analytics dashboard
|   |   |-- leads/                # Lead management (list, new, kanban, [id])
|   |   |-- contacts/page.tsx     # Global contacts directory
|   |   |-- activities/page.tsx   # Activity feed
|   |   |-- campaigns/            # Campaign management
|   |   |-- automation/page.tsx   # Automation rules
|   |   |-- reports/page.tsx      # Reports
|   |   +-- settings/             # User settings (profile, team, billing, webhooks, api-keys, notifications)
|   |-- pricing/                  # Public pricing page (no auth required)
|   |-- admin/                    # Admin panel (role-restricted)
|   |   |-- users/page.tsx        # User management
|   |   |-- settings/page.tsx     # System settings
|   |   +-- audit/page.tsx        # Audit logs
|   +-- api/                      # API routes
|       |-- admin/                # Admin seed, user management
|       |-- automation/execute/   # Automation execution
|       |-- email/                # Send, welcome email
|       |-- integrations/slack/   # Slack send, test
|       |-- leads/                # Export, import, check-duplicates
|       |-- stripe/               # Checkout, portal
|       +-- webhooks/             # Stripe, email-inbound, n8n
|
|-- components/                   # Reusable UI and feature components
|   |-- ui/                       # Base primitives (Button, Input, Card, Badge, Modal, Select)
|   |-- layout/                   # Sidebar, Header, DashboardShell
|   |-- leads/                    # LeadForm, LeadTable, LeadFilters, KanbanBoard, etc.
|   |-- contacts/                 # ContactForm
|   |-- campaigns/                # CampaignForm, CampaignCard
|   |-- dashboard/                # KPICard, Charts, DateRangeSelector, QuickActionsPanel
|   +-- subscription/             # UpgradeModal, UsageLimitBar, FeatureGate
|
|-- lib/                          # Shared libraries
|   |-- supabase/                 # Client (browser), server, middleware configs
|   |-- hooks/                    # React Query hooks (useLeads, useContacts, useActivities, etc.)
|   |-- types/database.ts         # Full Supabase database types (auto-generated)
|   |-- utils/                    # Constants, formatters, validation (Zod), security, subscription
|   +-- contexts/ViewModeContext.tsx  # Role detection, view mode state, toggle logic
|
|-- supabase/                     # Supabase config and migrations
|   |-- config.toml               # Local Supabase project configuration
|   |-- migrations/               # 26 ordered SQL migration files
|   +-- combined_migrations.sql   # All migrations in one file
|
|-- tests/                        # Test files
|   |-- e2e/                      # 23 Playwright spec files
|   +-- e2e-full-test.mjs         # Comprehensive E2E test (132/132 passing)
|
|-- docs/                         # Extended documentation
+-- Root config files             # package.json, tsconfig.json, tailwind.config.ts, etc.
```

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/digar011/goldyon-platform.git
cd goldyon-platform

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in Supabase URL, anon key, and service role key from your Supabase dashboard

# 4. Run database migrations
# Option A: Using Supabase CLI (requires Docker)
npx supabase start
npx supabase db push

# Option B: Hosted Supabase
# Run migration files in order in the SQL Editor, or use combined_migrations.sql

# 5. Start development server
npm run dev
# Opens at http://localhost:3000
```

---

## Environment Variables

| Variable                            | Description                              | Required |
|-------------------------------------|------------------------------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase project URL                     | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anonymous (public) key          | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`         | Supabase service role key (server-only)  | Yes      |
| `NEXT_PUBLIC_APP_URL`               | App base URL (e.g., http://localhost:3000)| Yes      |
| `NEXT_PUBLIC_APP_NAME`              | App display name (default: Goldyon)      | No       |
| `N8N_WEBHOOK_SECRET`                | n8n webhook signature secret             | No       |
| `WEBHOOK_ALLOWED_IPS`               | Comma-separated allowed IPs for webhooks | No       |
| `STRIPE_SECRET_KEY`                 | Stripe secret key                        | No       |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key                   | No       |
| `STRIPE_WEBHOOK_SECRET`             | Stripe webhook signature secret          | No       |
| `STRIPE_PRICE_STARTER_MONTHLY`      | Stripe Price ID for Starter monthly      | No       |
| `STRIPE_PRICE_STARTER_ANNUAL`       | Stripe Price ID for Starter annual       | No       |
| `STRIPE_PRICE_GROWTH_MONTHLY`       | Stripe Price ID for Growth monthly       | No       |
| `STRIPE_PRICE_GROWTH_ANNUAL`        | Stripe Price ID for Growth annual        | No       |
| `STRIPE_PRICE_BUSINESS_MONTHLY`     | Stripe Price ID for Business monthly     | No       |
| `STRIPE_PRICE_BUSINESS_ANNUAL`      | Stripe Price ID for Business annual      | No       |
| `RESEND_API_KEY`                    | Resend API key for email sending         | No       |
| `EMAIL_FROM`                        | From address for emails                  | No       |
| `GOOGLE_CLIENT_ID`                  | Google integration (optional)            | No       |
| `GOOGLE_CLIENT_SECRET`              | Google integration (optional)            | No       |

---

## Active Task Queue

> See `TODO.md` for the full task queue. Quick summary:

**All tasks completed as of 2026-03-01.** No items currently in queue.

---

## Running Tests

```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:unit           # Run with coverage report
npm run test:watch          # Watch mode

# E2E tests (install Playwright browsers first: npx playwright install)
npm run test:e2e            # Headless
npm run test:e2e:ui         # Interactive UI

# Linting and type checking
npm run lint                # ESLint
npx tsc --noEmit            # TypeScript strict mode

# Quality tools
npm run validate-env        # Validate .env.example
npm run audit-deps          # Dependency security audit
npm run lighthouse          # Lighthouse audit (requires local server)
```

---

## Deployment

**Production:** Deployed to Vercel. Push to `master` triggers auto-deploy.
**Staging:** Push to `staging` branch triggers staging deployment workflow (see `.github/workflows/staging-deploy.yml`). Requires GitHub Secrets for Vercel and staging Supabase.
**Rollback:** Revert to previous Vercel deployment via the Vercel dashboard, or reset the staging branch.

---

## Project-Specific Rules

- **Role system has 5 tiers**: `super_admin > org_admin > admin (legacy) > manager > user`. Always update ALL layers when modifying roles: DB types, ViewModeContext, permissions.ts, middleware.ts, admin/layout.tsx, API routes, and UI components.
- **RLS policies must NOT reference `auth.users` table** -- regular users cannot query it. Use `auth.jwt()` or query `profiles` table instead.
- **`SUPER_ADMIN_EMAILS` safety fallback** in `ViewModeContext.tsx` hardcodes `diego.j.garnica@gmail.com` -- this user always gets `super_admin` even if the DB role is wrong.
- **Test utility files with service_role keys** (`tests/test-admin-rls.mjs`, `tests/update-tier.mjs`) are gitignored. NEVER commit files containing hardcoded secrets.
- **`analytics_snapshots` has `UNIQUE(snapshot_date)`** -- tests must delete before re-inserting for same date.
- **Supabase join type inference** requires `Relationships` in the Database type definition -- without it, results are `never[]`.
- **Windows/Bash**: `!` in passwords causes JSON parsing issues in bash. Use Node.js `.mjs` script files for testing instead of inline CLI commands.
- **ESLint strict mode** is enforced via `@typescript-eslint/eslint-plugin`. TypeScript `ignoreBuildErrors` was removed (PR #53).
- **Dark theme with gold accents** is the design language. All UI components follow this pattern.
- **Subscription tiers gate features** -- always check `useSubscription` hook and `FeatureGate` component when adding new features.

---

## Important Links

| Resource              | URL                                                 |
|-----------------------|-----------------------------------------------------|
| GitHub Repo           | https://github.com/digar011/goldyon-platform.git    |
| Supabase Dashboard    | https://kitimzmjjuvznfiyjiuw.supabase.co            |
| Production URL        | (Vercel -- deployed from master)                    |
| Staging URL           | (Vercel preview -- deployed from staging branch)    |

---

*This file supplements the global `~/.claude/CLAUDE.md`. Global standards always apply unless overridden here.*

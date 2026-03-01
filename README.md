# Goldyon -- Lead Intelligence & CRM Platform

Goldyon is a full-stack lead intelligence and customer relationship management platform built for local business lead generation. It provides a unified workspace to manage leads, track customer journeys, run marketing campaigns, automate workflows, and analyze sales performance -- all through a modern dark-themed interface with a gold accent design language.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Development Server](#running-the-development-server)
- [Database Schema](#database-schema)
- [Authentication and Authorization](#authentication-and-authorization)
- [Subscription and Pricing Tiers](#subscription-and-pricing-tiers)
- [Testing](#testing)
- [Scripts Reference](#scripts-reference)
- [License](#license)

---

## Tech Stack

| Layer            | Technology                                                  |
| ---------------- | ----------------------------------------------------------- |
| Framework        | **Next.js 14** (App Router, Server Components, RSC)         |
| Language         | **TypeScript 5**                                            |
| Database / Auth  | **Supabase** (PostgreSQL, Auth, Row Level Security, SSR)    |
| Styling          | **TailwindCSS 3.4** with custom dark theme and gold accents |
| Data Fetching    | **TanStack React Query 5** (client-side caching, mutations) |
| Form Validation  | **Zod 4**                                                   |
| Charts           | **Recharts 3**                                              |
| Animations       | **Framer Motion 12**                                        |
| Icons            | **Lucide React**                                            |
| Date Utilities   | **date-fns 4**                                              |
| Sanitization     | **isomorphic-dompurify**                                    |
| E2E Testing      | **Playwright**                                              |
| Package Manager  | npm                                                         |

---

## Key Features

### Lead Management
- Full CRUD for business leads with 40+ fields (contact info, address, social media, Google Business Profile, website analysis scores, deal information).
- Pipeline status tracking: New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, Do Not Contact.
- Lead temperature classification: Cold, Warm, Hot.
- Lead scoring (0--100) with engagement score visualization.
- Kanban board view for visual pipeline management.
- List view with sortable columns, pagination (10/25/50/100 per page), and full-text search.
- Advanced filters by status, temperature, source, industry, city, and tags.
- Bulk selection and export capability.

### Contacts
- Contacts tied to leads (businesses) with first/last name, title, email, phone, and LinkedIn URL.
- Primary contact designation per lead.
- Global contacts directory with alphabetical grouping and search.
- Add, edit, and delete contacts from the lead detail page.

### Activities and Customer Journey
- Comprehensive activity logging: emails (sent/received/opened/clicked), calls (outbound/inbound/voicemail), SMS, meetings, mailers, social interactions, landing page visits, notes, status changes, and task completions.
- Activity feed page with date-grouped timeline and type-based filtering.
- Per-lead customer journey timeline showing all touchpoints and interactions.
- Quick actions on lead detail pages to log calls, emails, meetings, and notes.

### Dashboard and Analytics
- KPI cards: Total Leads, New This Week, Pipeline Value, Conversion Rate, Deals Won, Revenue Won, Activities Today, Average Deal Size.
- Interactive charts: Leads Trend (30 days), Revenue Trend (6 months), Pipeline Funnel, Source Distribution (pie chart), Activity Heatmap (12 weeks).
- Recent activity feed widget.
- Quick actions panel for common tasks.
- Configurable date range selector with presets (Today, Last 7 Days, Last 30 Days, This Month, This Quarter, and more).

### Campaigns
- Campaign types: Email, Cold Call, Direct Mail, Social Media, Multi-Channel.
- Campaign lifecycle: Draft, Active, Paused, Completed.
- Campaign creation form with name, type, status, description, start/end dates, budget, and target count.
- Campaign stats overview: total campaigns, active, completed, total spent.
- Search and filter campaigns by status and type.
- Campaign detail and edit pages.

### Automation
- Rule-based automation engine.
- Triggers: Lead Created, Lead Updated, Status Changed, Score Threshold Reached, Inactivity Period, Date-Based, Form Submission.
- Actions: Send Email Notification, Create Task, Assign to User, Update Status, Update Lead Score, Add to Campaign, Send Webhook, Add Tag.
- Toggle rules active/inactive, view execution history and success rates.
- Recent automation activity log with per-rule execution tracking.
- Auto-triggers on lead creation and status changes (fire-and-forget).

### Real-Time Updates
- Supabase Realtime subscriptions for live data sync across browser tabs.
- Automatic React Query cache invalidation on database changes.
- Enabled for leads, contacts, and activities.

### Integrations
- **Stripe**: Checkout sessions, customer portal, webhook handling for subscription management.
- **Resend**: Transactional email sending with HTML templates.
- **Webhooks**: Outbound webhook automation action with HTTPS enforcement and 10s timeout.

### Reports
- Report types: Leads, Activities, Campaigns, Pipeline, Team Performance, Custom.
- Quick report cards for one-click generation.
- Saved reports with optional scheduling (Daily, Weekly, Monthly, Manual).
- CSV export support.
- Report run history with timestamps.

### Subscription and Monetization
- Five pricing tiers: Free, Starter ($49/mo), Growth ($129/mo), Business ($299/mo), Enterprise (custom).
- Monthly and annual billing cycles (annual saves ~20%).
- Feature gating: sidebar navigation, create mutations, and UI components respect the user's subscription tier.
- Usage limit bars on leads, campaigns, and automation pages showing current usage vs. plan limits (amber at 80%, red at 100%).
- Upgrade modal prompts when users hit a feature or resource limit.
- Public pricing page (`/pricing`) with tier comparison cards and feature matrix.
- Billing settings page (`/settings/billing`) showing current plan, usage summary, and change-plan CTA.
- `FeatureGate` component for wrapping tier-restricted UI sections.
- Admin tier management: admins can change any user's subscription tier from the admin users page.

### Admin Panel (admin-only access)
- **User Management**: View all users, search by name/email, change roles (Admin, Manager, User), change subscription tier, activate/deactivate accounts. Stats for total users, active users, admins, and recent signups.
- **System Settings**: Grouped by category (Branding, General, Features, Limits, Security). Toggle switches for boolean settings, text inputs for string/JSON values, inline save with confirmation.
- **Audit Logs**: Complete action log with search, filters (action type, resource type), expandable details showing old/new values and metadata, pagination, and stats (total logs, today's count, unique action types).

### Settings (per-user)
- Profile management.
- Team member management.
- Billing & Plan management with usage overview.
- Webhook configuration (inbound/outbound with event subscriptions, retry settings, IP allowlists).
- API key management (scoped keys with expiration, integration type selection: Supabase, Email Service, Phone/SMS, Webhook, CRM Sync, Custom).
- Notification preferences.

### Dashboard Quick Actions
- Self-contained quick action panel on the dashboard for logging calls, emails, meetings, and notes without navigating away.
- Each action opens a modal with context-specific fields (e.g., call outcome selector, meeting date/time picker).
- Activities are logged directly via the `useCreateActivity` hook.

### Authentication
- Email/password sign-in and registration via Supabase Auth.
- Forgot password flow.
- Session management with middleware-based refresh.
- Role-based access control (admin, manager, user).
- Protected routes with server-side auth checks.

### Security
- Row Level Security (RLS) on all database tables.
- Input validation with Zod schemas on all forms.
- HTML sanitization with DOMPurify.
- Rate limiting on API endpoints, auth, webhooks, and exports.
- CSRF protection.

---

## Project Structure

```
goldyon-platform/
|-- app/                          # Next.js App Router pages
|   |-- (auth)/                   # Auth routes (login, register, forgot-password)
|   |   |-- layout.tsx            # Centered auth layout with branding
|   |   |-- login/page.tsx
|   |   |-- register/page.tsx
|   |   +-- forgot-password/page.tsx
|   |-- (dashboard)/              # Main app routes (requires authentication)
|   |   |-- layout.tsx            # Dashboard shell with sidebar + header
|   |   |-- dashboard/page.tsx    # Analytics dashboard
|   |   |-- leads/                # Lead management
|   |   |   |-- page.tsx          # Lead list with filters + usage bar
|   |   |   |-- new/page.tsx      # Create lead form
|   |   |   |-- kanban/page.tsx   # Kanban board view
|   |   |   +-- [id]/             # Lead detail, edit, contacts
|   |   |-- contacts/page.tsx     # Global contacts directory
|   |   |-- activities/page.tsx   # Activity feed
|   |   |-- campaigns/            # Campaign management (+ usage bar)
|   |   |-- automation/page.tsx   # Automation rules (+ usage bar)
|   |   |-- reports/page.tsx      # Reports
|   |   +-- settings/             # User settings
|   |       |-- layout.tsx        # Settings sidebar navigation
|   |       |-- profile/page.tsx
|   |       |-- team/page.tsx
|   |       |-- billing/page.tsx  # Subscription plan & usage overview
|   |       |-- webhooks/page.tsx
|   |       |-- api-keys/page.tsx
|   |       +-- notifications/page.tsx
|   |-- pricing/                  # Public pricing page (no auth required)
|   |   |-- layout.tsx            # Minimal layout (logo + sign-in link)
|   |   +-- page.tsx              # 5-tier pricing cards + comparison table
|   |-- admin/                    # Admin panel (role-restricted)
|   |   |-- layout.tsx            # Admin layout with role check
|   |   |-- users/page.tsx        # User management
|   |   |-- settings/page.tsx     # System settings
|   |   +-- audit/page.tsx        # Audit logs
|   |-- layout.tsx                # Root layout (fonts, providers)
|   |-- page.tsx                  # Root redirect (auth check)
|   |-- providers.tsx             # React Query + ViewMode providers
|   +-- globals.css               # Global styles and Tailwind imports
|
|-- components/                   # Reusable UI and feature components
|   |-- ui/                       # Base UI primitives
|   |   |-- Button.tsx
|   |   |-- Input.tsx
|   |   |-- Card.tsx
|   |   |-- Badge.tsx
|   |   |-- Modal.tsx
|   |   +-- Select.tsx
|   |-- layout/                   # Sidebar, Header, DashboardShell
|   |-- leads/                    # LeadForm, LeadTable, LeadFilters,
|   |                             # KanbanBoard, JourneyTimeline,
|   |                             # EngagementScore, ContactsList, QuickActions
|   |-- contacts/                 # ContactForm
|   |-- campaigns/                # CampaignForm, CampaignCard
|   |-- dashboard/                # KPICard, Charts, DateRangeSelector,
|   |                             # RecentActivityFeed, QuickActionsPanel
|   +-- subscription/             # Monetization components
|       |-- index.ts              # Barrel export
|       |-- UpgradeModal.tsx      # Upgrade prompt when limit/feature gate hit
|       |-- UsageLimitBar.tsx     # Progress bar (usage vs plan limit)
|       +-- FeatureGate.tsx       # Wrapper: renders children or locked state
|
|-- lib/                          # Shared libraries
|   |-- supabase/                 # Supabase client configs
|   |   |-- client.ts             # Browser client (singleton)
|   |   |-- server.ts             # Server client + service role client
|   |   +-- middleware.ts         # Session refresh middleware
|   |-- hooks/                    # React Query hooks
|   |   |-- useLeads.ts           # Lead CRUD, stats, filters (+ limit check)
|   |   |-- useContacts.ts        # Contact CRUD
|   |   |-- useActivities.ts      # Activities, customer journey
|   |   |-- useCampaigns.ts       # Campaign CRUD, stats (+ limit check)
|   |   |-- useAutomation.ts      # Automation rules, logs, stats (+ limit check)
|   |   |-- useReports.ts         # Reports CRUD, generation, CSV (+ limit check)
|   |   |-- useAnalytics.ts       # Dashboard stats, trends, funnel, heatmap
|   |   |-- useAdmin.ts           # Users, system settings, audit logs, tier mgmt
|   |   |-- useWebhooks.ts        # Webhook config management
|   |   |-- useApiKeys.ts         # API key management
|   |   |-- useSubscription.ts    # Subscription tier, can(), limit(), nearLimit()
|   |   +-- useGatedMutation.ts   # checkResourceLimit() pre-flight helper
|   |-- types/
|   |   +-- database.ts           # Full Supabase database types
|   |-- utils/
|   |   |-- constants.ts          # Statuses, types, sources, rate limits
|   |   |-- formatters.ts         # Currency, number, phone, date formatting
|   |   |-- validation.ts         # Zod schemas for forms
|   |   |-- security.ts           # Security utilities
|   |   |-- subscription.ts       # Plan definitions, limits, feature keys, helpers
|   |   +-- index.ts              # cn() utility (clsx + tailwind-merge)
|   +-- contexts/
|       +-- ViewModeContext.tsx    # Admin view mode context
|
|-- supabase/                     # Supabase local development config
|   |-- config.toml               # Local Supabase project configuration
|   |-- migrations/               # Ordered SQL migration files
|   |   |-- 0001_profiles.sql
|   |   |-- 0002_businesses.sql
|   |   |-- 0003_contacts.sql
|   |   |-- 0004_activities.sql
|   |   |-- 0005_touchpoints.sql
|   |   |-- 0006_campaigns.sql
|   |   |-- 0007_automation_rules.sql
|   |   |-- 0008_reports.sql
|   |   |-- 0009_audit_logs.sql
|   |   |-- 0010_webhooks.sql
|   |   |-- 0011_api_keys.sql
|   |   +-- 20260209000000_add_subscription_tier.sql
|   |-- combined_migrations.sql   # All migrations in one file
|   +-- create_test_user.sql      # Helper to create a test user
|
|-- tailwind.config.ts            # TailwindCSS config with custom theme
|-- next.config.mjs               # Next.js configuration
|-- tsconfig.json                 # TypeScript configuration
+-- package.json                  # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- A **Supabase** project (cloud-hosted or local via Supabase CLI)
- (Optional) **Supabase CLI** for local development -- install with `npm install -g supabase`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd goldyon-platform

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable                          | Description                         | Required |
| --------------------------------- | ----------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL                | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anonymous (public) key     | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service role key (server)  | Yes      |
| `STRIPE_SECRET_KEY`               | Stripe secret key for payments      | No       |
| `STRIPE_WEBHOOK_SECRET`           | Stripe webhook signature secret     | No       |
| `RESEND_API_KEY`                  | Resend API key for email sending    | No       |
| `STRIPE_PRICE_STARTER_MONTHLY`    | Stripe Price ID for Starter monthly | No       |
| `STRIPE_PRICE_STARTER_ANNUAL`     | Stripe Price ID for Starter annual  | No       |
| `STRIPE_PRICE_GROWTH_MONTHLY`     | Stripe Price ID for Growth monthly  | No       |
| `STRIPE_PRICE_GROWTH_ANNUAL`      | Stripe Price ID for Growth annual   | No       |
| `STRIPE_PRICE_BUSINESS_MONTHLY`   | Stripe Price ID for Business monthly| No       |
| `STRIPE_PRICE_BUSINESS_ANNUAL`    | Stripe Price ID for Business annual | No       |

> **Note:** The app validates environment variables at startup. Missing required vars will throw an error. Missing optional vars will log warnings but the app will still run with those features disabled.

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

You can find these values in your Supabase project dashboard under **Settings > API**.

For **local Supabase development**, the defaults are printed when you run `npx supabase start`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<printed-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<printed-service-role-key>
```

### Database Setup

**Option A: Using Supabase CLI (recommended for local development)**

```bash
# Start local Supabase services (requires Docker)
npx supabase start

# Apply all migrations automatically
npx supabase db push

# (Optional) Create a test user for development
# Open the SQL Editor in Supabase Studio at http://127.0.0.1:54323
# and run the contents of supabase/create_test_user.sql
```

**Option B: Using a hosted Supabase project**

1. Open the SQL Editor in your Supabase Dashboard.
2. Run the migration files in order from `supabase/migrations/` (0001 through 0011, plus the subscription tier migration), or run the single combined file `supabase/combined_migrations.sql`.
3. Optionally run `supabase/create_test_user.sql` to create a test account.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/login` if not authenticated, or to `/dashboard` if authenticated.

### Building for Production

```bash
npm run build
npm start
```

---

## Database Schema

The application uses the following tables, all with Row Level Security (RLS) enabled:

| Table                  | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `profiles`             | User profiles extending `auth.users` with role, name, avatar, subscription tier, and billing cycle. Auto-created on signup via trigger. |
| `businesses`           | Core leads table with 40+ fields: business info, address, social media, Google Business Profile data, website scores, lead scoring, deal info, tags, and custom fields. Full-text search index included. |
| `contacts`             | People associated with a business lead (name, title, email, phone, LinkedIn, primary flag). |
| `activities`           | Activity logs: emails, calls, SMS, meetings, notes, status changes, and more. |
| `touchpoints`          | Customer journey touchpoints for attribution (website visits, email opens, form submissions, etc.). |
| `campaigns`            | Marketing campaigns with type, status, dates, budget, and targeting criteria. |
| `automation_rules`     | Trigger/action rule definitions with execution tracking. |
| `reports`              | Saved report configurations with scheduling and recipient lists. |
| `audit_logs`           | System audit trail recording all create/update/delete actions with old/new values. |
| `webhook_configs`      | Inbound and outbound webhook configurations with retry and IP allowlist settings. |
| `api_keys`             | Scoped API key storage with hashed keys and expiration dates. |
| `system_settings`      | Global platform settings stored as key-value pairs, grouped by category. |
| `analytics_snapshots`  | Daily metrics rollups for historical analytics. |
| `landing_pages`        | Landing page tracking with visit and conversion counts. |

---

## Authentication and Authorization

Goldyon uses Supabase Auth with email/password authentication. Five user roles are supported in a hierarchy:

| Role          | Access                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `super_admin` | Full platform access (Goldyon/Codexium team). 3-way view toggle: super admin -> org admin -> user. Purple dot indicator. |
| `org_admin`   | Organization-scoped admin (business/enterprise customers). 2-way toggle: admin <-> user. Gold switch indicator. |
| `admin`       | Legacy role, treated as `org_admin` via backward compatibility in ViewModeContext.               |
| `manager`     | Mid-level access to all CRM features                                                            |
| `user`        | Standard access to all CRM features                                                             |

**Key role system details:**
- `ViewModeContext` (`lib/contexts/ViewModeContext.tsx`) manages role detection, view mode state, and toggle logic
- Safety fallback: `SUPER_ADMIN_EMAILS` array ensures the primary admin always gets `super_admin` even if the DB role is wrong
- Protected columns trigger prevents users from self-assigning admin roles or modifying subscription tiers
- Admin RLS policies check the `profiles.role` column (not client-controlled JWT metadata)

How authentication is enforced:

- **Server-side**: The `(dashboard)/layout.tsx` checks for an authenticated user via `supabase.auth.getUser()` and redirects to `/login` if none is found.
- **Admin panel**: The `admin/layout.tsx` performs a client-side role check, querying the `profiles` table, and redirects non-admins to `/dashboard`. Accepts `super_admin`, `org_admin`, and `admin` roles.
- **Middleware**: `middleware.ts` refreshes sessions on every request, enforces CSRF protection, applies security headers (HSTS, CSP), and guards admin routes.
- **Database**: Row Level Security policies on every table restrict data access based on the authenticated user's identity and role. Super admin policies allow full access; org admin policies are scoped by organization_id.

---

## Subscription and Pricing Tiers

Goldyon uses a five-tier subscription model. Each user's tier is stored in the `profiles` table (`subscription_tier` column) and defaults to `free`.

| Feature | Free | Starter | Growth | Business | Enterprise |
| --- | --- | --- | --- | --- | --- |
| **Monthly Price** | $0 | $49 | $129 | $299 | Custom |
| **Annual Price** | $0 | $39/mo | $109/mo | $249/mo | Contract |
| **Leads** | 25 | 500 | 5,000 | 25,000 | Unlimited |
| **Users** | 1 | 3 | 10 | 25 | Unlimited |
| **Campaigns** | -- | 5 | 25 | Unlimited | Unlimited |
| **Automation Rules** | -- | 3 | 20 | Unlimited | Unlimited |
| **Pipeline View** | -- | Yes | Yes | Yes | Yes |
| **Saved Reports** | -- | 5 | Unlimited | Unlimited | Unlimited |
| **CSV Export** | -- | -- | Yes | Yes | Yes |
| **Report Scheduling** | -- | -- | -- | Yes | Yes |
| **API Access** | -- | -- | Yes | Yes | Yes |
| **Webhooks** | -- | -- | Yes | Yes | Yes |
| **Scoped API Keys** | -- | -- | -- | Yes | Yes |
| **Admin Panel** | -- | -- | -- | Yes | Yes |
| **Audit Logs** | -- | -- | -- | Yes | Yes |
| **Team Roles (RBAC)** | -- | Yes | Yes | Yes | Yes |

### How Feature Gating Works

- **`useSubscription` hook**: Provides `can(feature)`, `limit(feature)`, `nearLimit(usage, feature)`, and `atLimit(usage, feature)` helpers.
- **`checkResourceLimit(table, feature)`**: Pre-flight check used inside create mutations (`useCreateLead`, `useCreateCampaign`, etc.). Throws a `LimitReachedError` when the user's resource count reaches the plan limit.
- **`FeatureGate` component**: Wraps UI sections and renders a locked state with the required plan name if the feature is not available on the user's tier.
- **`UsageLimitBar` component**: Shows a progress bar with current usage vs. plan limit. Turns amber at 80% usage and red at 100%. Displays an upgrade button when near or at limit.
- **`UpgradeModal` component**: Shown when a user hits a limit or tries to access a gated feature. Displays the current plan vs. required plan with upgrade CTAs.
- **Sidebar gating**: Navigation items have an optional `requiredFeature` property. Items are hidden if the user's tier doesn't include the feature.

---

## Testing

Playwright is used for end-to-end testing.

```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run with the interactive Playwright UI
npm run test:e2e:ui
```

---

## Scripts Reference

| Script          | Command                  | Description                     |
| --------------- | ------------------------ | ------------------------------- |
| `dev`           | `next dev`               | Start development server        |
| `build`         | `next build`             | Create production build         |
| `start`         | `next start`             | Start production server         |
| `lint`          | `next lint`              | Run ESLint                      |
| `test:e2e`      | `playwright test`        | Run Playwright E2E tests        |
| `test:e2e:ui`   | `playwright test --ui`   | Run Playwright with UI          |

---

## Documentation

- [Changelog](docs/CHANGELOG.md) -- Full chronological history of all changes
- [Changes Summary](docs/CHANGES-SUMMARY.md) -- Categorized list of what each change fixes, improves, or introduces
- [Production Readiness Audit](docs/PRODUCTION-READINESS.md) -- Comprehensive audit for production deployment
- [Security Audit](docs/SECURITY-AUDIT.md) -- Security vulnerability assessment (17 findings, critical ones fixed)
- [Security Policy](docs/SECURITY.md) -- Security policy and reporting procedures
- [Setup Guide](docs/SETUP.md) -- Detailed setup instructions
- [HOW-TO Guides](docs/HOW-TO/) -- User-facing guides (admin, billing, leads, webhooks)

---

## License

This project is proprietary software. All rights reserved.

# LeadFlow CRM - Changelog

## Sprint 3: Automation Expansion, Realtime, Free Tier & UI Polish

### Automation Engine Expansion

**Auto-trigger on lead status change**
- `useUpdateLead()` now fires `"lead_updated"` automation trigger on every update
- When `status` field changes, also fires `"status_changed"` trigger with `newStatus` in payload
- Uses fire-and-forget pattern (non-blocking POST to `/api/automation/execute`)
- File: `lib/hooks/useLeads.ts`

**4 new automation actions**
All actions log to the `activities` table for audit trail.

| Action | Description | Config Fields |
|--------|-------------|---------------|
| `create_task` | Inserts into `scheduled_tasks` with configurable due date | `task_type`, `due_days`, `description` |
| `update_status` | Changes lead status programmatically | `new_status` |
| `assign_user` | Assigns lead to a team member | `assign_to` (user UUID) |
| `send_webhook` | POSTs trigger data to an external HTTPS URL | `url`, `headers` (optional) |

Security: `send_webhook` enforces HTTPS-only URLs (SSRF prevention) and uses a 10-second timeout.

File: `lib/automation/engine.ts`

### Supabase Realtime Subscriptions

**New hook: `useRealtimeSubscription`**
- Generic hook that subscribes to `postgres_changes` on any table
- On any INSERT/UPDATE/DELETE, invalidates specified React Query keys
- Cleans up channel on component unmount

**Wired into existing hooks:**
| Hook | Table | Invalidated Keys |
|------|-------|-----------------|
| `useLeads()` | `businesses` | `["leads"]` |
| `useContacts()` | `contacts` | `["contacts", businessId]`, `["contacts"]` |
| `useActivities()` | `activities` | `["activities"]` |

Files: `lib/hooks/useRealtime.ts` (new), `lib/hooks/useLeads.ts`, `lib/hooks/useContacts.ts`, `lib/hooks/useActivities.ts`

### Environment Variable Validation

**New utility: `validateEnv()`**
- Called at app startup (server-side, in root `layout.tsx`)
- **Required** (throws on missing): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Recommended** (warns): `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, 6x `STRIPE_PRICE_*`

File: `lib/utils/env.ts` (new)

### Free Tier Tightening

Goal: Make free tier useful for evaluation but insufficient for a solo consultant to avoid upgrading.

| Feature | Before | After |
|---------|--------|-------|
| Lead limit | 50 | **25** |
| Campaigns | 1 | **0** |
| Pipeline/Kanban view | Available | **Locked (Starter+)** |

**New feature key: `pipelineView`**
- Added to `FeatureKey` union type
- `false` for free tier, `true` for starter and above
- Leads page: kanban toggle shows disabled button with tooltip for free users
- Kanban page: redirects free users to `/leads` list view

Files: `lib/utils/subscription.ts`, `app/(dashboard)/leads/page.tsx`, `app/(dashboard)/leads/kanban/page.tsx`

### UI Fixes

**Quick Actions tile alignment**
- Grid changed from responsive `grid-cols-2 sm:grid-cols-3 gap-2` to fixed `grid-cols-3 gap-3`
- Tiles now use `aspect-square` for uniform sizing
- Icon size increased from `h-5 w-5` to `h-6 w-6`

File: `components/dashboard/QuickActionsPanel.tsx`

**Sidebar cleanup**
- Removed duplicate "Analytics" nav item (no dedicated `/analytics` route existed)
- Reordered: Dashboard > Leads > Contacts > Activities > Campaigns > Automation > Reports

File: `components/layout/Sidebar.tsx`

### E2E Tests

**New test suites:**
- `tests/e2e/automation-engine.spec.ts` — Automation page, rule creation, trigger types, action types, rule management, automation triggers on lead create/status change
- `tests/e2e/stripe-checkout.spec.ts` — Pricing page, billing page, free tier limits (25 leads, disabled pipeline, hidden campaigns), upgrade prompts

---

## Sprint 2: Stripe, Email & Automation Foundation

### Stripe Integration
- Checkout session creation (`/api/stripe/checkout`)
- Customer portal (`/api/stripe/portal`)
- Webhook handler (`/api/webhooks/stripe`) for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Pricing page with 5-tier plan cards
- Billing settings page with current plan and usage overview

### Resend Email Integration
- Email sending API (`/api/email/send`)
- Welcome email template with HTML rendering
- Lazy initialization pattern for Resend SDK

### Automation Engine (Foundation)
- Rule-based engine with trigger/action pattern
- `send_email` action using Resend
- Automation execution API (`/api/automation/execute`)
- Automation logs table with success/failure tracking
- `useCreateLead` fires `"lead_created"` trigger on success

### Subscription System
- 5-tier model: Free, Starter, Growth, Business, Enterprise
- `useSubscription` hook with `can()`, `limit()`, `atLimit()` helpers
- `checkResourceLimit()` pre-flight for mutations
- `UsageLimitBar`, `UpgradeModal`, `FeatureGate` components
- Sidebar navigation gating via `requiredFeature`
- Admin tier management

### API Keys & Integrations
- API key management page with CRUD
- Integration type selection (Supabase, Email, Phone/SMS, Webhook, CRM Sync, Custom)
- External key storage for third-party service credentials
- Scoped permissions (read/write per resource)

---

## Sprint 1: Core CRM Platform

### Authentication
- Email/password sign-in and registration via Supabase Auth
- Forgot password flow
- Session middleware with automatic refresh
- Role-based access (admin, manager, user)

### Lead Management
- Full CRUD with 40+ fields
- Pipeline statuses: New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, DNC
- Temperature: Cold, Warm, Hot
- Lead scoring (0-100)
- Kanban board and list views
- Filters, search, sorting, pagination

### Contacts
- Contacts linked to businesses
- Primary contact designation
- Global directory with search

### Activities & Customer Journey
- Activity logging (emails, calls, meetings, notes, etc.)
- Timeline view per lead
- Touchpoint tracking

### Dashboard
- KPI cards, interactive charts
- Recent activity feed
- Quick actions panel

### Campaigns
- Campaign types: Email, Cold Call, Direct Mail, Social Media, Multi-Channel
- Campaign lifecycle management

### Reports
- Report types with scheduling
- CSV export
- Saved reports

### Admin Panel
- User management with role/tier controls
- System settings
- Audit logs

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Server-side operations (automation, webhooks) |
| `STRIPE_SECRET_KEY` | Recommended | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Recommended | Stripe webhook signature verification |
| `RESEND_API_KEY` | Recommended | Email sending via Resend |
| `STRIPE_PRICE_STARTER_MONTHLY` | Recommended | Stripe Price ID |
| `STRIPE_PRICE_STARTER_ANNUAL` | Recommended | Stripe Price ID |
| `STRIPE_PRICE_GROWTH_MONTHLY` | Recommended | Stripe Price ID |
| `STRIPE_PRICE_GROWTH_ANNUAL` | Recommended | Stripe Price ID |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Recommended | Stripe Price ID |
| `STRIPE_PRICE_BUSINESS_ANNUAL` | Recommended | Stripe Price ID |

## Automation Actions Reference

| Action | Trigger Types | Config |
|--------|--------------|--------|
| `send_email` | Any | `to`, `template`, `subject`, `html`, `company_name`, `sender_name` |
| `create_task` | Any | `task_type`, `due_days`, `description` |
| `update_status` | Any | `new_status` (LeadStatus value) |
| `assign_user` | Any | `assign_to` (user UUID) |
| `send_webhook` | Any | `url` (HTTPS only), `headers` (optional) |

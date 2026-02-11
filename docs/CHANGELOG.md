# Goldyon CRM - Changelog

## Sprint 5: CSV Import/Export + Email Auto-Capture

### CSV Import/Export
Users can now import and export leads as CSV files, removing the biggest adoption blocker.

- **Export API**: `GET /api/leads/export` — server-side CSV generation with filter pass-through, rate limited (5/min)
- **Import API**: `POST /api/leads/import` — batch insert with Zod validation, duplicate detection (skip/overwrite/create), auto-contact creation, automation triggers
- **ExportButton component**: Feature-gated (Growth+), downloads filtered leads as CSV
- **ImportModal component**: 4-step wizard (Upload → Map Columns → Preview → Import) with drag/drop, auto column mapping, progress bar, error reporting
- **Field definitions**: `lib/utils/csvFields.ts` — shared export/import field mappings with auto-detection
- **Subscription gating**: `csvImport` feature key added (same tiers as `csvExport`: Growth+)
- **Leads page**: Import button + Export button replace old nonfunctional Export button
- **Dependency**: `papaparse` for client-side CSV parsing

### Email Auto-Capture (BCC Forwarding)
Simplified email logging — no OAuth required. Each user gets a unique forwarding address to BCC/forward emails to.

- **DB migration**: `supabase/migrations/20260209300000_email_capture.sql` — `captured_emails` table + `email_forwarding_address` column on profiles
- **Email matching**: `lib/utils/emailCapture.ts` — deterministic forwarding address generation, email-to-lead matching via businesses.email and contacts.email, direction classification
- **Inbound webhook**: `POST /api/webhooks/email-inbound` — receives parsed emails from Resend inbound, matches to leads, creates `email_received`/`email_sent` activities, deduplicates by Message-ID
- **Settings UI**: `EmailCaptureSettings` component with copy-to-clipboard forwarding address, 3-step "How it works" guide, Gmail/Outlook setup instructions, recent captured emails list
- **CSRF exclusion**: `/api/webhooks/email-inbound` added to middleware skip list
- **Types**: `captured_emails` table types + `email_forwarding_address` on profiles

### E2E Tests
2 new Playwright test suites:

| Test Suite | File | Test Cases |
|------------|------|------------|
| CSV Import/Export | `tests/e2e/csv-import-export.spec.ts` | Export button visible, import modal opens, file upload, column auto-mapping |
| Email Capture | `tests/e2e/email-capture.spec.ts` | Settings visible, forwarding address shown, setup guides collapsible |

### Files Summary

**New files (11):**
- `lib/utils/csvFields.ts`
- `app/api/leads/export/route.ts`
- `app/api/leads/import/route.ts`
- `components/leads/ExportButton.tsx`
- `components/leads/ImportModal.tsx`
- `supabase/migrations/20260209300000_email_capture.sql`
- `lib/utils/emailCapture.ts`
- `app/api/webhooks/email-inbound/route.ts`
- `components/settings/EmailCaptureSettings.tsx`
- `tests/e2e/csv-import-export.spec.ts`
- `tests/e2e/email-capture.spec.ts`

**Modified files (5):**
- `app/(dashboard)/leads/page.tsx` — Import/Export buttons, ImportModal integration
- `lib/utils/subscription.ts` — `csvImport` feature key added to all tiers
- `lib/types/database.ts` — `captured_emails` table + `email_forwarding_address` on profiles
- `app/(dashboard)/settings/webhooks/page.tsx` — EmailCaptureSettings section
- `middleware.ts` — CSRF exclusion for email-inbound webhook

---

## Sprint 4: CRM Pain Point Fixes — Follow-ups, Mobile, Dedup, Guided Workflow

### Follow-up System (Fixed)
The `next_follow_up` field existed in the lead form UI but was never persisted to the database. Now fully functional end-to-end.

- **DB migration**: `supabase/migrations/20260209200000_add_next_follow_up.sql` — adds `next_follow_up DATE` column with partial index
- **TypeScript types**: `next_follow_up: string | null` added to businesses Row/Insert/Update
- **Zod validation**: `next_follow_up` added to `businessSchema`
- **LeadForm**: `next_follow_up` now included in submit data (was missing before)
- **Lead detail**: Follow-up date shown in Key Dates card, overdue dates highlighted in red with "(overdue)" label
- **Quick action**: New "Set Follow-up" button (green CalendarClock icon) with date picker modal

### Mobile Responsive Layout
The app was completely unusable on mobile devices (fixed 256px sidebar, no hamburger menu). Now fully responsive.

- **DashboardShell**: `pl-64` changed to `md:pl-64`, padding `p-6` to `p-4 md:p-6`
- **Sidebar**: Hidden on mobile (`max-md:-translate-x-full`), slides in with backdrop overlay when hamburger is tapped, auto-closes on navigation
- **Header**: Hamburger menu button (`md:hidden`) added before search bar, search bar made responsive (`w-full sm:w-64 md:w-80`)

### Dashboard Follow-up Widgets
New proactive dashboard alerts that surface overdue, due-today, and stale leads.

- **`useFollowUpStats()` hook**: Queries overdue follow-ups, due-today, and stale leads (7+ days inactive)
- **`FollowUpWidgets` component**: Red overdue alert banner with lead links, "Due Today" and "Stale (7+ days)" KPI cards
- Integrated at top of dashboard page, above existing KPI cards

### Duplicate Detection
Prevents bad data by warning users when creating a lead that may already exist.

- **API route**: `POST /api/leads/check-duplicates` — accepts `business_name`, `email`, `phone` and returns top 5 matches via `ilike` name search and exact email/phone digit matching
- **`useDuplicateCheck` hook**: TanStack Query wrapper, fires when `business_name.length >= 3` in create mode, 10s stale time
- **`DuplicateWarning` component**: Orange warning box with matching leads listed (name, email, status badge, link to detail)
- **LeadForm integration**: Warning shown between Basic Information and Address cards (create mode only). Non-blocking — users can still submit

### Next-Best-Action Suggestions
Turns the CRM from a data entry tool into a guided workflow assistant.

- **`lib/utils/nextBestAction.ts`**: Pure function that maps `(status, temperature, activity recency, follow-up, contact info, deal value)` to max 3 prioritized action suggestions
- **`NextBestAction` component**: "Suggested Next Steps" card with Lightbulb icon in lead detail right sidebar
- Status-specific suggestions: new → "Make introduction call/email", contacted + stale → "Send follow-up", qualified → "Schedule meeting", proposal → "Follow up on proposal", negotiation → "Address objections"
- Cross-cutting: "Set follow-up date" if none set, urgent warning for hot leads idle 2+ days

### Stage Transition Guidance
Prevents accidental status jumps and captures win/loss reasons.

- **`lib/utils/stageTransitions.ts`**: Transition map defining `suggested`, `allowed`, and `requiresReason` per status
- **`StatusTransition` component**: Suggested transitions as prominent gold-bordered buttons, "More options" toggle for non-suggested statuses (dimmed)
- Won/Lost opens a reason modal (textarea) — reason is logged as a `status_change` activity with metadata
- Integrated below status badges in lead detail header

### Zapier & Make Integration
No-code integration guide for connecting Goldyon to 5,000+ apps.

- **`ZapierMakeGuide` component**: Connection instructions, supported events grid, platform-specific setup guides (Zapier/Make), one-click webhook creation with pre-filled defaults
- **Webhook settings integration**: "Create Webhook for Zapier/Make" button pre-fills the existing webhook modal with platform name and all 6 events selected
- Supported events: `lead.created`, `lead.updated`, `lead.deleted`, `contact.created`, `activity.logged`, `lead.status_changed`

### E2E Tests
5 new Playwright test suites covering all new features:

| Test Suite | File | Test Cases |
|------------|------|------------|
| Follow-ups | `tests/e2e/follow-ups.spec.ts` | Form persistence, overdue styling, dashboard widgets |
| Mobile Responsive | `tests/e2e/mobile-responsive.spec.ts` | Sidebar hidden/shown, hamburger, backdrop, auto-close |
| Duplicate Detection | `tests/e2e/duplicate-detection.spec.ts` | No warning for unique, warning for matches, link to detail |
| Next Best Action | `tests/e2e/next-best-action.spec.ts` | Status-specific suggestions, contextual actions |
| Stage Transitions | `tests/e2e/stage-transitions.spec.ts` | Suggested buttons, more options, reason modal |

### Files Summary

**New files (16):**
- `supabase/migrations/20260209200000_add_next_follow_up.sql`
- `components/dashboard/FollowUpWidgets.tsx`
- `app/api/leads/check-duplicates/route.ts`
- `lib/hooks/useDuplicateCheck.ts`
- `components/leads/DuplicateWarning.tsx`
- `lib/utils/nextBestAction.ts`
- `components/leads/NextBestAction.tsx`
- `lib/utils/stageTransitions.ts`
- `components/leads/StatusTransition.tsx`
- `components/settings/ZapierMakeGuide.tsx`
- `tests/e2e/follow-ups.spec.ts`
- `tests/e2e/mobile-responsive.spec.ts`
- `tests/e2e/duplicate-detection.spec.ts`
- `tests/e2e/next-best-action.spec.ts`
- `tests/e2e/stage-transitions.spec.ts`

**Modified files (11):**
- `lib/types/database.ts` — `next_follow_up` added to businesses
- `lib/utils/validation.ts` — `next_follow_up` added to businessSchema
- `components/leads/LeadForm.tsx` — `next_follow_up` in submit data, duplicate check integration
- `components/leads/QuickActions.tsx` — "Set Follow-up" action type
- `app/(dashboard)/leads/[id]/page.tsx` — Follow-up in Key Dates, NextBestAction, StatusTransition
- `components/layout/DashboardShell.tsx` — Mobile responsive padding + sidebar state
- `components/layout/Sidebar.tsx` — Mobile overlay mode with backdrop
- `components/layout/Header.tsx` — Hamburger menu button
- `lib/hooks/useAnalytics.ts` — `useFollowUpStats()` hook
- `app/(dashboard)/dashboard/page.tsx` — FollowUpWidgets integration
- `app/(dashboard)/settings/webhooks/page.tsx` — ZapierMakeGuide integration

---

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

# PRODUCT.md -- Goldyon / LeadFlow Platform

> **Product:** Goldyon -- Lead Intelligence & CRM
> **Type:** SaaS Platform
> **Target Market:** Local business lead generation, sales teams, marketing agencies
> **Status:** Active Development

---

## Table of Contents

- [Product Overview](#product-overview)
- [Features](#features)
  - [Lead Management](#lead-management)
  - [Contacts](#contacts)
  - [Activities and Customer Journey](#activities-and-customer-journey)
  - [Dashboard and Analytics](#dashboard-and-analytics)
  - [Campaigns](#campaigns)
  - [Automation Engine](#automation-engine)
  - [Reports](#reports)
  - [CSV Import and Export](#csv-import-and-export)
  - [Email Auto-Capture](#email-auto-capture)
  - [Follow-up System](#follow-up-system)
  - [Duplicate Detection](#duplicate-detection)
  - [Next-Best-Action Suggestions](#next-best-action-suggestions)
  - [Stage Transition Guidance](#stage-transition-guidance)
  - [Real-Time Updates](#real-time-updates)
  - [Subscription and Monetization](#subscription-and-monetization)
  - [Admin Panel](#admin-panel)
  - [Settings](#settings)
  - [Integrations](#integrations)
  - [Security](#security)
- [User Roles and Permissions](#user-roles-and-permissions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Subscription Tiers and Pricing](#subscription-tiers-and-pricing)
- [Known Limitations](#known-limitations)

---

## Product Overview

Goldyon is a full-stack lead intelligence and customer relationship management platform built for local business lead generation. It provides a unified workspace to manage leads, track customer journeys, run marketing campaigns, automate workflows, and analyze sales performance.

**Key Value Propositions:**
- Comprehensive lead management with 40+ fields per lead and pipeline visualization
- Rule-based automation engine for lead routing, notifications, and status updates
- Five-tier subscription model with feature gating and usage limits
- Role-based access control with admin view mode switching
- Real-time data synchronization across browser tabs
- CSV import/export for bulk lead operations
- Email auto-capture via BCC forwarding

**Design Language:** Dark theme with gold accents. All UI follows this visual identity.

---

## Features

### Lead Management

Full CRUD operations for business leads with extensive data fields.

**Lead Fields (40+):**
- Business info: name, email, phone, website, industry
- Address: street, city, state, ZIP
- Social media: Facebook, Instagram, LinkedIn, Twitter URLs
- Google Business Profile: rating, review count, GBP URL
- Website analysis: mobile score, SEO score, speed score, has SSL, has analytics
- Lead details: status, temperature, source, tags, description
- Deal info: deal value, expected close date, next follow-up
- Scoring: lead score (0-100), engagement score
- Custom fields: JSON object for extensibility

**Pipeline Statuses:** New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, Do Not Contact

**Temperature:** Cold, Warm, Hot

**Views:**
- **List View**: Sortable columns, pagination (10/25/50/100 per page), full-text search, advanced filters (status, temperature, source, industry, city, tags), bulk selection
- **Kanban Board**: Visual pipeline with cards organized by status

**Sources:** Google Maps, Yelp, LinkedIn, Referral, Cold Outreach, Website Form, Social Media, Trade Show, Partner, Other

---

### Contacts

People associated with business leads.

- First name, last name, title, email, phone, LinkedIn URL
- Primary contact designation per lead (one primary per business, enforced by DB constraint)
- Global contacts directory with alphabetical grouping and search
- Add, edit, and delete contacts from the lead detail page

---

### Activities and Customer Journey

Comprehensive activity logging and timeline tracking.

**Activity Types:**
- Email: Sent, Received, Opened, Clicked
- Call: Outbound, Inbound, Voicemail
- SMS: Sent, Received
- Meeting: Scheduled, Completed
- Mailer Sent
- Social: DM, Comment
- Landing Page: Visit, Conversion
- Note
- Status Change
- Task Completed

**Features:**
- Activity feed page with date-grouped timeline and type-based filtering
- Per-lead customer journey timeline showing all touchpoints
- Quick actions on lead detail pages to log calls, emails, meetings, and notes
- Dashboard quick actions panel for logging activities without navigating away

---

### Dashboard and Analytics

**KPI Cards:**
- Total Leads, New This Week, Pipeline Value, Conversion Rate
- Deals Won, Revenue Won, Activities Today, Average Deal Size

**Charts:**
- Leads Trend (30 days line chart)
- Revenue Trend (6 months bar chart)
- Pipeline Funnel (horizontal funnel)
- Source Distribution (pie chart)
- Activity Heatmap (12 weeks grid)

**Widgets:**
- Recent activity feed
- Quick actions panel (log call, email, meeting, note)
- Follow-up alerts (overdue, due today, stale leads)
- Configurable date range selector with presets

---

### Campaigns

Marketing campaign management with lifecycle tracking.

**Campaign Types:** Email, Cold Call, Direct Mail, Social Media, Multi-Channel

**Lifecycle:** Draft, Active, Paused, Completed

**Fields:** Name, type, status, description, start/end dates, budget, target count

**Features:**
- Campaign creation and editing forms
- Campaign stats overview (total, active, completed, total spent)
- Search and filter by status and type
- Card grid layout for campaign list
- Subscription-gated (Starter+ for access, varying limits by tier)

---

### Automation Engine

Rule-based automation for lead workflows.

**Triggers:**
- Lead Created
- Lead Updated
- Status Changed
- Score Threshold Reached
- Inactivity Period
- Date-Based
- Form Submission

**Actions:**
- Send Email Notification (via Resend)
- Create Task
- Assign to User
- Update Status
- Update Lead Score
- Add to Campaign
- Send Webhook (HTTPS-only, 10s timeout, SSRF prevention)
- Add Tag

**Features:**
- Toggle rules active/inactive
- Execution history with success/failure tracking
- Priority-based rule ordering
- Auto-triggers on lead creation (`lead_created`) and status changes (`status_changed`)
- Recent automation activity log

---

### Reports

**Report Types:** Leads, Activities, Campaigns, Pipeline, Team Performance, Custom

**Features:**
- Quick report cards for one-click generation
- Saved reports with optional scheduling (Daily, Weekly, Monthly, Manual)
- CSV export support
- Report run history with timestamps
- Configurable filters, columns, and recipients

---

### CSV Import and Export

**Export (`GET /api/leads/export`):**
- Server-side CSV generation with filter pass-through
- Rate limited (5 requests per minute)
- Feature-gated: Growth tier and above

**Import (`POST /api/leads/import`):**
- 4-step wizard UI: Upload, Map Columns, Preview, Import
- Drag and drop file upload
- Auto column mapping with manual override
- Zod validation on each row
- Duplicate detection with skip/overwrite/create options
- Auto-contact creation from CSV contact fields
- Automation triggers fire on imported leads
- Uses PapaParse for client-side CSV parsing

---

### Email Auto-Capture

BCC-based email capture for automatic activity logging.

- Each user gets a unique forwarding address
- Database: `captured_emails` table + `email_forwarding_address` column on profiles
- Matches emails to leads via `businesses.email` and `contacts.email`
- Inbound webhook: `POST /api/webhooks/email-inbound` (Resend integration)
- Settings UI with copy-to-clipboard forwarding address
- Gmail and Outlook setup guides
- Deduplication by Message-ID

---

### Follow-up System

- `next_follow_up` date field on leads, persisted to database
- Overdue follow-ups highlighted in red with "(overdue)" label
- Quick action: "Set Follow-up" button with date picker modal
- Dashboard widgets: overdue alert banner, "Due Today" and "Stale (7+ days)" KPI cards
- `useFollowUpStats()` hook for follow-up analytics

---

### Duplicate Detection

- API: `POST /api/leads/check-duplicates`
- Fuzzy name matching + exact email/phone matching
- Orange warning shown in create form when duplicates found (non-blocking)
- Links to existing lead detail pages

---

### Next-Best-Action Suggestions

- Pure function mapping lead state to max 3 prioritized action suggestions
- Status-specific suggestions (e.g., new lead -> "Make introduction call/email")
- Cross-cutting: "Set follow-up date" if none set, urgent warning for hot leads idle 2+ days

---

### Stage Transition Guidance

- Transition map defining suggested/allowed/requiresReason per status
- Suggested transitions shown as prominent buttons
- "More options" toggle for all allowed transitions
- Won/Lost opens a reason modal, reason logged as activity

---

### Real-Time Updates

- Supabase Realtime subscriptions for `postgres_changes`
- Generic `useRealtimeSubscription` hook
- Automatic React Query cache invalidation on DB changes
- Enabled for leads, contacts, and activities

---

### Subscription and Monetization

**Five Pricing Tiers:** Free, Starter ($49/mo), Growth ($129/mo), Business ($299/mo), Enterprise (custom)

- Monthly and annual billing cycles (annual saves ~20%)
- Feature gating via `FeatureGate` component, `useSubscription` hook, and sidebar `requiredFeature`
- Usage limit bars (amber at 80%, red at 100%) with upgrade CTAs
- Upgrade modal when users hit a limit
- Public pricing page (`/pricing`) with tier comparison cards and feature matrix
- Billing settings page (`/settings/billing`) with current plan and usage summary
- Admin tier management: admins can change any user's tier

**Stripe Integration:**
- Checkout session creation (`POST /api/stripe/checkout`)
- Customer portal (`POST /api/stripe/portal`)
- Webhook handler (`POST /api/webhooks/stripe`) for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

### Admin Panel

Accessible only to `super_admin`, `org_admin`, and `admin` roles.

**User Management (`/admin/users`):**
- View all users with search by name/email
- Change roles: super_admin, org_admin, admin, manager, user
- Change subscription tier: free, starter, growth, business, enterprise
- Activate/deactivate accounts
- Stats: total users, active users, admins, recent signups

**System Settings (`/admin/settings`):**
- Grouped by category: Branding, General, Features, Limits, Security
- Toggle switches for boolean settings, text inputs for string/JSON values
- Inline save with confirmation

**Audit Logs (`/admin/audit`):**
- Complete action log with search and filters (action type, resource type)
- Expandable details showing old/new values and metadata
- Pagination (25 per page)
- Stats: total logs, today's count, unique action types

---

### Settings

Per-user configuration pages at `/settings/`:

- **Profile** (`/settings/profile`) -- Name, email, avatar, password
- **Team** (`/settings/team`) -- View and manage team members, invitations
- **Billing & Plan** (`/settings/billing`) -- Current plan, usage bars, change plan CTA
- **Webhooks** (`/settings/webhooks`) -- Inbound/outbound webhook configs with events, retry, IP allowlists
- **API Keys** (`/settings/api-keys`) -- Scoped API key management with integration types (Supabase, Email, Phone/SMS, Webhook, CRM Sync, Custom), expiration, enable/disable/revoke
- **Notifications** (`/settings/notifications`) -- Event notification preferences
- **FAQ** (`/settings/faq`) -- Common questions about platform features

---

### Integrations

| Integration | Type | Details |
|-------------|------|---------|
| Stripe | Payment | Checkout sessions, customer portal, webhook handling |
| Resend | Email | Transactional email with HTML templates, email auto-capture |
| Slack | Notifications | Webhook-based CRM event notifications |
| n8n | Automation | Inbound webhook for workflow automation |
| Zapier/Make | Automation | Guide with one-click webhook creation |

---

### Security

- **Row Level Security (RLS)** on all database tables
- **Input validation** with Zod schemas on all forms
- **HTML sanitization** with DOMPurify
- **Rate limiting** on API endpoints, auth, webhooks, and exports (persistent via Supabase + LRU cache)
- **CSRF protection** in middleware (Origin/Referer validation)
- **Security headers**: HSTS, CSP, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Protected columns trigger** prevents self-role-escalation and self-tier-modification
- **Webhook SSRF prevention**: outbound webhooks enforce HTTPS-only URLs
- **Session management**: middleware-based session refresh

---

## User Roles and Permissions

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | Highest | Goldyon/Codexium team. Full platform access. 3-way view toggle. |
| `org_admin` | High | Business/enterprise customer admin. Scoped to their organization. 2-way toggle. |
| `admin` | High | Legacy role. Treated as `org_admin` via backward compatibility. |
| `manager` | Mid | Can view, create, and edit most resources. Cannot delete. |
| `user` | Standard | Can view and create. Limited editing. |

### Permission Matrix

| Permission | super_admin | org_admin | admin | manager | user |
|------------|:-----------:|:---------:|:-----:|:-------:|:----:|
| leads.view | Yes | Yes | Yes | Yes | Yes |
| leads.create | Yes | Yes | Yes | Yes | Yes |
| leads.edit | Yes | Yes | Yes | Yes | No |
| leads.delete | Yes | Yes | Yes | No | No |
| contacts.view | Yes | Yes | Yes | Yes | Yes |
| contacts.create | Yes | Yes | Yes | Yes | Yes |
| contacts.edit | Yes | Yes | Yes | Yes | No |
| contacts.delete | Yes | Yes | Yes | No | No |
| activities.view | Yes | Yes | Yes | Yes | Yes |
| activities.create | Yes | Yes | Yes | Yes | Yes |
| campaigns.view | Yes | Yes | Yes | Yes | Yes |
| campaigns.create | Yes | Yes | Yes | Yes | No |
| campaigns.edit | Yes | Yes | Yes | Yes | No |
| campaigns.delete | Yes | Yes | Yes | No | No |
| reports.view | Yes | Yes | Yes | Yes | Yes |
| reports.create | Yes | Yes | Yes | Yes | No |
| automation.view | Yes | Yes | Yes | Yes | Yes |
| automation.create | Yes | Yes | Yes | Yes | No |
| automation.edit | Yes | Yes | Yes | Yes | No |
| automation.delete | Yes | Yes | Yes | No | No |
| settings.view | Yes | Yes | Yes | Yes | Yes |
| settings.edit | Yes | Yes | Yes | No | No |
| Admin Panel | Yes | Yes | Yes | No | No |

### View Mode System

Admins can switch their view to see the app as a lower-privilege role:

- **Super Admin**: 3-way toggle -- super admin view (purple dot) -> org admin view -> user view
- **Org Admin / Admin**: 2-way toggle -- admin view (gold switch) <-> user view
- Managed by `ViewModeContext` (`lib/contexts/ViewModeContext.tsx`)
- Exports: `isSuperAdmin`, `isOrgAdmin`, `isAnyAdmin`, `isSuperAdminView`, `isOrgAdminView`, `isAdminView`, `viewMode`, `toggleViewMode`

---

## API Endpoints

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users with search/filter | Admin role |
| PATCH | `/api/admin/users` | Update user role, tier, or status | Admin role |
| POST | `/api/admin/seed` | Seed test data | Admin role |

### Leads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/leads/export` | Export leads as CSV (rate limited: 5/min) | Authenticated (Growth+) |
| POST | `/api/leads/import` | Import leads from CSV | Authenticated (Growth+) |
| POST | `/api/leads/check-duplicates` | Check for duplicate leads | Authenticated |

### Automation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/automation/execute` | Execute automation rules | Authenticated |

### Email

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/email/send` | Send transactional email via Resend | Authenticated |
| POST | `/api/email/welcome` | Send welcome email | Authenticated |

### Stripe (Payments)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/stripe/checkout` | Create Stripe checkout session | Authenticated |
| POST | `/api/stripe/portal` | Create Stripe customer portal session | Authenticated |

### Webhooks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/webhooks/stripe` | Stripe webhook handler | Stripe signature |
| POST | `/api/webhooks/email-inbound` | Inbound email capture webhook | Resend signature |
| POST | `/api/webhooks/n8n` | n8n automation webhook | Webhook secret |

### Integrations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/integrations/slack/send` | Send Slack notification | Authenticated |
| POST | `/api/integrations/slack/test` | Test Slack webhook connection | Authenticated |

> **Note:** Most data operations (leads CRUD, contacts CRUD, activities, campaigns, automation rules, reports, etc.) are performed directly through the Supabase client SDK, not through API routes. The API routes listed above handle operations that require server-side logic (exports, imports, external integrations, webhooks).

---

## Database Schema

26 migration files applied. Key tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles extending `auth.users`. Role, name, avatar, subscription tier, billing cycle. Auto-created on signup via trigger. |
| `businesses` | Core leads table with 40+ fields. Full-text search index. |
| `contacts` | People associated with business leads. Primary contact constraint. |
| `activities` | Activity logs for all interaction types. |
| `touchpoints` | Customer journey touchpoints for attribution. |
| `campaigns` | Marketing campaigns with type, status, budget. |
| `automation_rules` | Trigger/action rule definitions with execution tracking. |
| `reports` | Saved report configurations with scheduling. |
| `audit_logs` | System audit trail with old/new values. |
| `webhook_configs` | Inbound/outbound webhook configurations. |
| `api_keys` | Scoped API key storage with hashed keys. |
| `system_settings` | Global platform settings (key-value, grouped). |
| `analytics_snapshots` | Daily metrics rollups (unique per date). |
| `landing_pages` | Landing page tracking with visit/conversion counts. |
| `captured_emails` | Auto-captured emails via BCC forwarding. |
| `support_tickets` | Support ticket tracking. |

---

## Subscription Tiers and Pricing

| Feature | Free | Starter ($49/mo) | Growth ($129/mo) | Business ($299/mo) | Enterprise |
|---------|------|-------------------|-------------------|---------------------|------------|
| Leads | 25 | 500 | 5,000 | 25,000 | Unlimited |
| Users | 1 | 3 | 10 | 25 | Unlimited |
| Campaigns | -- | 5 | 25 | Unlimited | Unlimited |
| Automation Rules | -- | 3 | 20 | Unlimited | Unlimited |
| Pipeline View | -- | Yes | Yes | Yes | Yes |
| Saved Reports | -- | 5 | Unlimited | Unlimited | Unlimited |
| CSV Export | -- | -- | Yes | Yes | Yes |
| CSV Import | -- | -- | Yes | Yes | Yes |
| Report Scheduling | -- | -- | -- | Yes | Yes |
| API Access | -- | -- | Yes | Yes | Yes |
| Webhooks | -- | -- | Yes | Yes | Yes |
| Scoped API Keys | -- | -- | -- | Yes | Yes |
| Admin Panel | -- | -- | -- | Yes | Yes |
| Audit Logs | -- | -- | -- | Yes | Yes |
| Team Roles (RBAC) | -- | Yes | Yes | Yes | Yes |

Annual billing saves approximately 20% ($39/mo Starter, $109/mo Growth, $249/mo Business).

---

## Known Limitations

1. **No unit tests** -- only E2E tests exist (Playwright). Jest setup is needed.
2. **No CI/CD pipeline** -- GitHub Actions not configured yet.
3. **ESLint is minimal** -- only extends `next/core-web-vitals` and `next/typescript`. Stricter rules needed.
4. **ESLint ignored during builds** -- `next.config.mjs` has `ignoreDuringBuilds: true`.
5. **No staging environment** -- production is deployed directly from main.
6. **Single admin contact** -- Diego handles all infrastructure and access.
7. **Role hierarchy branch not merged** -- feature/role-hierarchy-and-test-fixes is 3 commits ahead of main.
8. **Legacy `admin` role** -- kept for backward compatibility, treated as `org_admin`.
9. **No error tracking service** -- Sentry or equivalent not configured.
10. **No structured logging** -- console-based logging only.

---

*See also: `CLAUDE.md` for development rules, `ONBOARDING.md` for setup guide, `TODO.md` for task queue, `CHANGELOG.md` for change history, `HOWTO.md` for user-facing guides.*

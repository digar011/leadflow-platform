# Goldyon CRM - Changelog

All notable changes to the Goldyon CRM platform are documented here, organized chronologically from most recent to earliest.

---

## [2026-02-10] Role Hierarchy & Test Stability (feature/role-hierarchy-and-test-fixes)

### Role Hierarchy System
- Added `super_admin` and `org_admin` roles alongside existing `admin`, `manager`, `user`
- `super_admin` (Goldyon/Codexium team) gets full platform access with 3-way view toggle (super admin -> org admin -> user)
- `org_admin` (business/enterprise customer admin) scoped to their organization with 2-way toggle (admin <-> user)
- Legacy `admin` role treated as `org_admin` via backward compatibility in ViewModeContext
- Safety fallback: `SUPER_ADMIN_EMAILS` array hardcodes primary admin email -- always gets super_admin even if DB role is wrong
- Purple dot indicator for super admin view mode, gold switch for org admin
- Sidebar shows admin navigation items in admin view modes
- DB migration: `20260210204145_role_hierarchy.sql` with RLS policies for new roles

### Security Hardening
- Removed test utility files containing hardcoded service_role keys from git tracking
- Added test utility files to `.gitignore` to prevent accidental commits of secrets

### E2E Test Stability
- Refined E2E test selectors for more reliable element targeting
- Increased timeouts for operations that depend on network/DB latency
- Improved test stability across all Playwright specs

### Files Changed
- `lib/contexts/ViewModeContext.tsx` -- Role detection, view mode state, toggle logic
- `lib/types/database.ts` -- `UserRole` type updated
- `lib/utils/permissions.ts` -- `DEFAULT_PERMISSIONS` per role
- `middleware.ts` -- Admin route guard updated for new roles
- `app/admin/layout.tsx` -- Client-side admin access check
- `app/api/admin/users/route.ts` -- Admin API with role management
- `components/layout/Header.tsx` -- View mode toggle UI
- `supabase/migrations/20260210204145_role_hierarchy.sql` -- DB migration

---

## [2026-02-10] TypeScript Cleanup (PR #53)

- Resolved all TypeScript compilation errors across the codebase
- Removed `ignoreBuildErrors: true` from `next.config.mjs`
- Clean builds now enforced -- no more suppressed type errors

---

## [2026-02-10] Slack Integration

- Added Slack integration for CRM notifications
- Configurable webhook-based notifications for lead events

---

## [2026-02-10] Rebranding & FAQ (PR #52)

### Rebranding
- Rebranded all references from "LeadFlow" to "Goldyon" across all files
- Updated logos, titles, meta tags, and documentation

### FAQ Page
- Added FAQ page to user settings (`/settings/faq`)
- Common questions about platform features, billing, and integrations

---

## [2026-02-09] Field Name Fixes (PR #51)

- Corrected field name mismatches between frontend and database in campaigns and contacts
- Added null safety checks to prevent runtime crashes on optional fields

---

## [2026-02-09] Admin Mode & Campaign UI Fixes (PR #50)

- Fixed admin mode data refresh -- switching view modes now properly reloads data
- Fixed campaign title truncation in card layouts
- Added proper plan gating for campaign features

---

## [2026-02-09] CSP & UI Fixes (PR #43)

- Allowed `unsafe-eval` in CSP for development mode only (required by Next.js hot reload)
- Fixed UI element clipping issues in dropdowns and modals

---

## [2026-02-09] Persistent Rate Limiting & Hardened CSP (PR #42)

- Implemented persistent rate limiting via Supabase `check_rate_limit()` RPC function
- In-memory LRU cache as first layer, Supabase as persistent fallback
- Hardened Content Security Policy with proper directives

---

## [2026-02-09] CSP Consolidation (PR #41)

- Removed `unsafe-eval` from production CSP
- Consolidated rate limiting logic into a single utility

---

## [2026-02-09] UI Bugs & Enhancements (PR #40)

- Resolved multiple UI bugs referenced in issues #28-#38
- Various visual and interaction enhancements across the platform

---

## [2026-02-09] Dashboard Chart Fixes (PR #39)

- Fixed Recharts console warnings for deprecated props
- Fixed fractional Y-axis tick values (now integers only)
- Fixed missing KPI comparison percentages
- Fixed date filter toggle not persisting selection

---

## [2026-02-09] Sidebar Navigation Fix (PR #27)

- Made Campaigns and Reports visible in sidebar for all subscription tiers
- Previously hidden for some tiers due to incorrect feature gating

---

## [2026-02-09] Security & Webhook Fixes (PR #22)

- Added 10-second fetch timeout to outbound webhook delivery (prevents hanging)
- Reject email webhook requests when signature secret is not configured
- Required authentication on welcome email endpoint (was public)
- Middleware security: fixed n8n bypass, CSRF fallback handling, API route auth enforcement

---

## [2026-02-09] Database Security & Validation (PR #11)

### Security Headers
- Added HSTS (Strict-Transport-Security) with 1-year max-age
- Added Content-Security-Policy headers to middleware

### Database Hardening
- Regenerated `database.ts` types from actual DB schema with proper `Relationships`
- Added DB validation constraints: email format validation, non-negative deal_value, single primary contact per business
- Scoped RLS SELECT policies to user ownership on businesses and campaigns
- Super admin RLS policies for profiles table (can view/update all)
- Org admin RLS policies scoped by organization_id

### Documentation
- Documented `APP_URL` configuration requirement
- Annotated `ignoreBuildErrors` as temporary (later removed in PR #53)

---

## [2026-02-09] Sprint 5: CSV Import/Export + Email Auto-Capture

### CSV Import/Export
- Export API: `GET /api/leads/export` -- server-side CSV generation with filter pass-through, rate limited (5/min)
- Import API: `POST /api/leads/import` -- batch insert with Zod validation, duplicate detection (skip/overwrite/create), auto-contact creation, automation triggers
- ExportButton component: Feature-gated (Growth+), downloads filtered leads as CSV
- ImportModal component: 4-step wizard (Upload -> Map Columns -> Preview -> Import) with drag/drop, auto column mapping, progress bar
- Field definitions: `lib/utils/csvFields.ts` -- shared export/import field mappings
- Subscription gating: `csvImport` feature key (Growth+)
- Dependency: `papaparse` for client-side CSV parsing

### Email Auto-Capture (BCC Forwarding)
- Each user gets a unique forwarding address to BCC/forward emails
- DB migration: `captured_emails` table + `email_forwarding_address` column on profiles
- Email matching via businesses.email and contacts.email
- Inbound webhook: `POST /api/webhooks/email-inbound` with Resend integration
- Settings UI with copy-to-clipboard forwarding address, Gmail/Outlook setup guides
- Deduplication by Message-ID

---

## [2026-02-09] Sprint 4: Follow-ups, Mobile, Dedup, Guided Workflow, Zapier/Make

### Follow-up System
- `next_follow_up` field now persisted to database (was display-only before)
- DB migration: `next_follow_up DATE` column with partial index
- Overdue follow-ups highlighted in red with "(overdue)" label
- Quick action: "Set Follow-up" button with date picker modal

### Mobile Responsive Layout
- Sidebar hidden on mobile with hamburger menu toggle
- Slide-in sidebar with backdrop overlay, auto-closes on navigation
- Responsive padding and search bar widths

### Dashboard Follow-up Widgets
- `useFollowUpStats()` hook for overdue, due-today, and stale leads (7+ days inactive)
- Red overdue alert banner with lead links
- "Due Today" and "Stale (7+ days)" KPI cards on dashboard

### Duplicate Detection
- API: `POST /api/leads/check-duplicates` -- fuzzy name + exact email/phone matching
- Orange warning shown in create form when duplicates found (non-blocking)
- Links to existing lead detail pages

### Next-Best-Action Suggestions
- Pure function mapping lead state to max 3 prioritized action suggestions
- Status-specific suggestions (e.g., new -> "Make introduction call/email")
- Cross-cutting: "Set follow-up date" if none set, urgent warning for hot leads idle 2+ days

### Stage Transition Guidance
- Transition map defining suggested/allowed/requiresReason per status
- Suggested transitions as prominent buttons, "More options" toggle
- Won/Lost opens a reason modal, reason logged as activity

### Zapier & Make Integration Guide
- Connection instructions, supported events grid
- One-click webhook creation with pre-filled defaults

---

## [2026-02-09] Sprint 3: Automation Expansion, Realtime, Free Tier & UI Polish

### Automation Engine Expansion
- Auto-trigger on lead status change (fires `"status_changed"` trigger)
- 4 new actions: `create_task`, `update_status`, `assign_user`, `send_webhook`
- `send_webhook` enforces HTTPS-only URLs (SSRF prevention) with 10s timeout

### Supabase Realtime Subscriptions
- Generic `useRealtimeSubscription` hook for postgres_changes
- Wired into leads, contacts, and activities hooks
- Auto-invalidates React Query cache on DB changes

### Environment Variable Validation
- `validateEnv()` called at startup
- Required vars throw on missing, recommended vars warn

### Free Tier Tightening
- Lead limit reduced from 50 to 25
- Campaigns reduced from 1 to 0 for free tier
- Pipeline/Kanban view locked to Starter+

### UI Fixes
- Quick actions tile alignment and sizing
- Removed duplicate "Analytics" sidebar nav item

---

## [2026-02-09] Sprint 2: Stripe, Email & Automation Foundation

### Stripe Integration
- Checkout session creation, customer portal, webhook handler
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Pricing page with 5-tier plan cards
- Billing settings with current plan and usage overview

### Resend Email Integration
- Email sending API (`/api/email/send`)
- Welcome email template with HTML rendering
- Lazy initialization pattern for Resend SDK

### Automation Engine (Foundation)
- Rule-based engine with trigger/action pattern
- `send_email` action using Resend
- Execution API, logs table, success/failure tracking
- `useCreateLead` fires `"lead_created"` trigger on success

### Subscription System
- 5-tier model: Free, Starter, Growth, Business, Enterprise
- `useSubscription` hook with `can()`, `limit()`, `atLimit()` helpers
- `UsageLimitBar`, `UpgradeModal`, `FeatureGate` components
- Admin tier management

### API Keys & Integrations
- API key management with CRUD
- Integration type selection, scoped permissions
- External key storage for third-party credentials

---

## [2026-02-09] Bug Fixes & Stability

- 10 bug fixes: dashboard loading, activity errors, row navigation, date/score consistency
- In-app seed data button for quick test data population
- Moved `@types/papaparse` to devDependencies

---

## [2026-02-08] Monetization System & Security Audit

- Implemented monetization system with Stripe integration
- Conducted first security audit identifying 17 vulnerabilities (2 Critical, 5 High)
- Fixed critical privilege escalation chain (signup metadata + profile self-modification)
- Documentation update with security findings

---

## [2026-02-07] Lead Creation & Stability Fixes

- Fixed lead creation flow and Supabase type issues
- Added initial documentation (README, SETUP, CHANGELOG)
- Resolved runtime errors and improved stability across the app

---

## [2026-02-04] Phase 5: Admin Panel, Integrations & Polish

- Admin panel with user management, system settings, audit logs
- Role-based access control for admin routes
- Platform polish and integration groundwork

---

## [2026-02-04] Phase 4: Campaigns, Reports & Workflow Automation

- Campaign management with types, lifecycle, and stats
- Report types with scheduling and CSV export
- Workflow automation foundation

---

## [2026-02-04] Phase 3: Dashboard with Unified Analytics

- KPI cards: Total Leads, New This Week, Pipeline Value, Conversion Rate, etc.
- Interactive charts: Leads Trend, Revenue Trend, Pipeline Funnel, Source Distribution
- Activity heatmap and date range selector

---

## [2026-02-04] Phase 2: Core CRM with 360-Degree Customer View

- Full lead CRUD with 40+ fields
- Contacts linked to businesses with primary designation
- Activity logging and customer journey timeline
- Global contacts directory

---

## [2026-02-04] Phase 1: Foundation - Auth, Layout, Theme

- Email/password authentication via Supabase Auth
- Dark theme with gold accent design language
- Dashboard shell with sidebar and header
- Database migrations and Playwright test setup

---

## [2026-02-04] Initial Commit

- Project scaffolded with Create Next App (Next.js 14)
- TypeScript, TailwindCSS, ESLint configured

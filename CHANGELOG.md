# CHANGELOG -- Goldyon / LeadFlow Platform

All notable changes to the Goldyon CRM platform are documented here, organized chronologically from most recent to earliest. This follows the [Keep a Changelog](https://keepachangelog.com/) convention.

---

## [2026-03-01] - Security, CI/CD, Landing Page & Performance (PRs #99-#102)

### Added
- **Public landing page** (PR #100): Replaced login redirect at `/` with full marketing landing page featuring hero section, 6-feature grid (Lead Management, Pipeline Tracking, Campaign Automation, Advanced Analytics, Team Collaboration, Integrations), CTA sections, and footer. Full SEO metadata (title, description, keywords, Open Graph, Twitter Card, canonical URL). **Why:** `app/page.tsx` just redirected to `/login` with no SEO value. **Outcome:** Indexed, branded landing page with clear conversion path.
- **E2E tests in CI pipeline** (PR #101): Added Playwright E2E test job to `.github/workflows/ci.yml` that runs after build. Downloads build artifact, installs Chromium, starts Next.js server, runs tests. `continue-on-error: true` until CI Supabase project is configured. Uploads Playwright report and test results as artifacts (14-day retention). **Why:** 21 Playwright specs existed but never ran in CI. **Outcome:** E2E tests run on every PR.
- **Vercel CI gating** (PR #101): Added `"github": { "silent": true }` to `vercel.json`. **Why:** Vercel auto-deploy could run before CI finishes. **Outcome:** Vercel deployments don't bypass CI checks.
- **Database search indexes** (PR #102): Migration `20260301000003_add_search_indexes.sql` adds trigram indexes (`gin_trgm_ops`) on `business_name`, `email`, `city` for ILIKE search queries; B-tree indexes on `status`, `assigned_to`, `created_at`; composite index on `(assigned_to, status)` for dashboard queries. Enables `pg_trgm` extension. **Why:** Search and filter queries on businesses table had no index support. **Outcome:** Fast search and filter performance.
- **Expanded unit test coverage** (PR #100): Added 101 new tests across 4 new test suites (`constants.test.ts`, `env.test.ts`, `logger.test.ts`, `security.test.ts`). Total: 13 suites, 289 tests. Coverage: 90.81% statements. **Why:** Previous coverage only measured `lib/utils/**/*.ts` with 76.68%. **Outcome:** Exceeded 80% target with comprehensive coverage of constants, environment validation, structured logger, and security utilities.

### Fixed
- **CSRF bypass on API routes** (PR #99, audit finding C7): Middleware now validates Origin/Referer headers for POST/PUT/DELETE/PATCH requests to `/api/` routes. GET/HEAD/OPTIONS are exempt (safe methods). Webhook routes exempt (use signature verification). Non-browser clients allowed. **Why:** `middleware.ts:30-32` skipped Origin validation for all `/api/` routes. **Outcome:** Cross-site request forgery prevented on API mutations.
- **Unauthenticated Slack send route** (PR #99, audit finding M3): Added `supabase.auth.getUser()` check to `app/api/integrations/slack/send/route.ts`. **Why:** Route had no auth check — anyone could trigger Slack messages. **Outcome:** 401 returned for unauthenticated requests.
- **Unsanitized HTML in email send** (PR #99, audit finding C6): Added `sanitizeHtml()` call in `app/api/email/send/route.ts` before passing HTML to Resend. **Why:** User-provided HTML passed directly to email API enables XSS/email injection. **Outcome:** HTML sanitized with DOMPurify allowlist.
- **Test files with hardcoded secrets** (PR #99, audit finding C2): Added 5 test utility files with hardcoded Supabase service_role keys to `.gitignore` and removed from tracking. **Why:** Hardcoded secrets in tracked files are a security risk. **Outcome:** Secrets no longer in version control.
- **Staging deploy URL wiring** (PR #101): Fixed `deploy-staging` job to properly expose deployment URL via `outputs`. Health check now uses the actual deployment URL with fallback. **Why:** Smoke test couldn't find the deployed URL. **Outcome:** Staging smoke tests hit the correct URL.

### Changed
- **Optimized `useLeadStats` hook** (PR #102): Replaced 3 sequential full-table queries with parallel `head: true` count queries per status + `Promise.all`. Separate total count query instead of client-side sum. Pipeline value query unchanged (needs actual values). **Why:** `useLeadStats` fetched ALL businesses to count client-side. **Outcome:** Parallel lightweight queries instead of 3 sequential full-table scans.

---

## [2026-03-01] - Security, UX & Performance Batch (PRs #91, #92, #94, #98)

### Added
- **Standardized API error responses** (PR #91): Created `lib/utils/api-errors.ts` with `ApiErrors` helper methods (badRequest, unauthorized, forbidden, notFound, validationError, rateLimited, internalError, serviceUnavailable) and `handleApiError` catch-all. Updated all 15 API routes. 17 unit tests added. **Why:** API routes returned inconsistent error formats. **Outcome:** Consistent `{ success: false, error: { code, message } }` across all endpoints.
- **Cookie consent banner** (PR #91): GDPR/ePrivacy-compliant CookieConsent component with accept/reject, localStorage persistence, privacy policy link.
- **Dashboard loading skeletons** (PR #91): 7 loading.tsx states for leads, contacts, activities, campaigns, reports, automation, settings.
- **Dynamic OG image** (PR #91): Next.js ImageResponse at opengraph-image.tsx with Goldyon branding.
- **Twitter Card metadata** (PR #91): summary_large_image card in root layout.
- **RESEND_WEBHOOK_SECRET** added to .env.example.
- **Node.js engines field** (PR #91): Added `"engines": { "node": ">=20.0.0" }` to package.json. **Why:** Enforce minimum Node.js version. **Outcome:** `npm install` warns on incompatible Node versions.
- **Webhook maxDuration** (PR #98): Set `export const maxDuration = 30` on Stripe, email-inbound, and n8n webhook routes. **Why:** Vercel default 10s timeout is too short for webhook processing. **Outcome:** Webhook functions get 30s execution time.
- **Stale repo dirs cleanup** (PR #92): Removed 12 stale repo directory names from `tsconfig.json` exclude, added to `.gitignore`. **Why:** Leftover cloned repos polluted tsconfig and could be accidentally committed. **Outcome:** Clean tsconfig excludes; stale dirs gitignored.

### Fixed
- **API error details leak** (PR #91): admin/seed, slack/send, slack/test, and leads/import routes no longer expose raw error messages. Uses `handleApiError` which logs real errors but returns safe generic response.
- **Resend client silent failure** (PR #94): `getResend()` now throws explicit error when `RESEND_API_KEY` is missing instead of returning null silently. Unit tests added.
- **Sentry in error boundaries** (PR #91): error.tsx and dashboard error.tsx now use Sentry.captureException.
- **CSP connect-src** (PR #91): Added `https://*.ingest.sentry.io` to `connect-src` in `lib/utils/security.ts` to match middleware.ts CSP. **Why:** Sentry error reporting was blocked by inconsistent CSP directives. **Outcome:** CSP is consistent between middleware and security utility.
- **HSTS in vercel.json** (PR #91): Added `Strict-Transport-Security: max-age=31536000; includeSubDomains` header. **Why:** Middleware HSTS doesn't cover static files served by Vercel CDN. **Outcome:** HSTS on all responses including static assets.
- **.gitignore** (PR #91): Now covers plain .env files.

### Changed
- **Logo images optimized** (PR #91): WebP conversion (1.3MB->25KB, 1.8MB->115KB). All references updated.

---

## [2026-03-01] - Custom 404 Page (PR #90)

### Added
- **Custom not-found.tsx page** (PR #90): Server component at `app/not-found.tsx` with dark theme, gold "404" heading, descriptive message, and navigation links (Go home, Sign in). `noindex`/`nofollow` robots meta. **Why:** Default Next.js 404 breaks the dark theme and branding. **Outcome:** Branded 404 page matching the app's design language.

---

## [2026-03-01] - RLS, DB Constraints & Webhook Fixes (PR #89)

### Fixed
- **RLS policies missing org_admin/super_admin roles** (migration `20260301000001`): SELECT and ALL policies on `businesses`, `campaigns`, and `campaign_members` only checked `role IN ('admin', 'manager')`. Updated to include `super_admin`, `org_admin`, and `admin`. **Why:** Org admins and super admins couldn't see all records despite having admin privileges. **Outcome:** All admin roles now have proper RLS access.
- **Manager role rejected by DB constraint** (migration `20260301000002`): TypeScript `UserRole` type includes `manager` but the DB CHECK constraint only allowed `('super_admin', 'org_admin', 'admin', 'user')`. Added `manager` to the constraint. **Why:** Assigning `manager` role would fail at the database level. **Outcome:** All five role tiers are accepted by the database.
- **n8n webhook module-level Supabase init crash** (`app/api/webhooks/n8n/route.ts`): Supabase client was created at module import time, crashing if env vars were missing. Replaced with lazy-initialized `getSupabase()` pattern using `createClient<Database>()` for full type safety. **Why:** Module-level init fails during build/test when env vars aren't set. **Outcome:** Client created on first use only, with typed queries.
- **n8n webhook type-unsafe inserts**: `processWebhookEvent` used `user_id` on `businesses` (doesn't exist — should be `assigned_to`), `user_id` on `contacts` (doesn't exist), and untyped spread operators bypassing TypeScript checks. Rewrote all insert/update calls with explicitly typed field mappings. **Why:** Pre-existing bugs hidden by untyped `createClient()` that would cause runtime failures. **Outcome:** Type-safe inserts matching actual DB schema.
- **n8n webhook allowlist field name mismatches**: `ALLOWED_LEAD_FIELDS` referenced `website`, `industry`, `temperature`, `description` but actual DB columns are `website_url`, `industry_category`, `lead_temperature`, `notes`. **Why:** Webhook payloads with these fields were silently dropped. **Outcome:** Field allowlist matches actual database column names.
- **n8n webhook contact.create missing business_id validation**: Contacts require `business_id` but the handler only validated `first_name`/`last_name`. Added `business_id` as a required field check. **Why:** Insert would fail at DB level without a clear error. **Outcome:** Explicit validation error before DB call.
- **n8n webhook activity.log missing business_id validation**: Activities require `business_id` and `activity_type` but only `activity_type` was validated. **Why:** Same as above. **Outcome:** Both required fields validated upfront.

---

## [2026-03-01] - Legal Pages & Password Reset (PRs #87-#88)

### Added
- **Reset password page** (PR #87): Client component at `/reset-password` using `supabase.auth.updateUser()`. Password validation (min 8 chars, match confirmation), success state with redirect to login. Matches auth page design pattern. **Why:** Forgot-password flow sent users to `/reset-password` which didn't exist. **Outcome:** Complete password reset flow.
- **Terms of Service page** (PR #88): Server component at `/terms` covering acceptance, accounts, acceptable use, IP, payments, liability, termination, governing law. **Why:** Register page linked to dead `/terms` route; legally required for SaaS. **Outcome:** Accessible legal terms page.
- **Privacy Policy page** (PR #88): Server component at `/privacy` covering data collection, usage, third-party sharing (Supabase, Stripe, Resend, Sentry), GDPR/CCPA rights, data retention, contact info. **Why:** Register page linked to dead `/privacy` route; legally required under GDPR/CCPA. **Outcome:** Accessible privacy policy page.

---

## [2026-03-01] - Infrastructure, DevOps & Quality Sprint (PRs #72-#85)

### Added
- **Stricter ESLint config** (PR #72): Added `@typescript-eslint/eslint-plugin` with strict rules (`no-explicit-any`, `no-unused-vars`, `consistent-type-imports`, `no-console` warn). Fixed lint errors across ~48 files. **Why:** Enforce code quality at the linter level. **Outcome:** Stricter type safety and cleaner codebase.
- **Jest unit testing** (PR #74): Configured Jest + ts-jest + @testing-library/jest-dom with 7 test suites and 166 tests covering formatters, validation schemas, subscription logic, stage transitions, permissions, CSV fields, and next-best-action suggestions. 76.68% code coverage. **Why:** No unit tests existed, only Playwright E2E. **Outcome:** Comprehensive unit test coverage with `npm test` / `npm run test:watch`.
- **Environment validation script** (PR #75): Standalone `scripts/validate-env.mjs` that parses `.env.example`, validates `.env.local`, categorizes variables (required/recommended/optional), detects placeholders. Supports `--strict` mode. **Why:** Catch misconfiguration before runtime. **Outcome:** `npm run validate-env` for pre-startup checks.
- **React Error Boundaries** (PR #76): `ErrorBoundary` class component with page/feature level variants, retry button, optional `onError` callback. Root `error.tsx` and dashboard `error.tsx` pages. `DashboardShell` wraps children with page-level boundary. **Why:** Uncaught React errors crashed entire app. **Outcome:** Graceful error handling with recovery.
- **Structured logging** (PR #77): JSON-formatted `logger` with `createLogger()` factory for route-scoped child loggers. Applied to leads export, import, and Stripe webhook routes. Debug suppressed in production. **Why:** `console.log` is unstructured and hard to parse in production. **Outcome:** Machine-parseable logs with context (requestId, userId, etc.).
- **SEO meta tags, sitemap, robots** (PR #79): Dynamic `sitemap.ts` (public pages), `robots.ts` (allow public, block dashboard/admin/api), Open Graph tags on pricing page, `noindex`/`nofollow` on auth pages. **Why:** Improve search engine visibility for public pages. **Outcome:** Proper SEO infrastructure.
- **Sentry error tracking** (PR #80): `@sentry/nextjs` v10 with client/server/edge runtime init, session replay (10% baseline, 100% on error), browser tracing (20% sample), `global-error.tsx` root boundary. CSP updated for Sentry ingest domain. Disabled in development. **Why:** Production error visibility. **Outcome:** Real-time error monitoring with replay.
- **Monthly dependency audit** (PR #81): GitHub Actions workflow runs on the 1st of each month, auto-creates GitHub Issues with vulnerability counts and remediation steps. Local `npm run audit-deps` script with colored terminal output. **Why:** CLAUDE.md mandates regular dependency audits. **Outcome:** Automated security monitoring.
- **CI/CD pipeline** (PR #78): GitHub Actions workflow with 4 jobs (lint, typecheck, unit-tests, build). Build depends on lint + typecheck. Coverage artifacts uploaded. Runs on PRs and pushes to master. **Why:** No CI/CD existed. **Outcome:** Automated quality gates on every PR.
- **Vercel staging environment** (PR #84): `vercel.json` with security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy). GitHub Actions `staging-deploy.yml` triggered on pushes to `staging` branch with lint/test gate, Vercel deploy, and smoke test. Comprehensive staging docs in ONBOARDING.md. **Why:** No staging environment for pre-production testing. **Outcome:** Automated staging deployment pipeline with rollback documentation.
- **Lighthouse CI audit** (PR #85): GitHub Actions `lighthouse.yml` runs on PRs targeting master. Audits 5 public pages (/, /pricing, /login, /register, /forgot-password) with 3 runs each. `lighthouserc.json` desktop preset with score thresholds (Performance >= 80, Accessibility >= 90, Best Practices >= 90, SEO >= 90). `scripts/lighthouse-summary.mjs` outputs colored terminal table or CI markdown summary. **Why:** CLAUDE.md mandates Lighthouse audits on client-facing pages. **Outcome:** Automated performance and accessibility monitoring via `npm run lighthouse`.

### Changed
- **Pinned dependency versions** (PR #73): Removed all `^` and `~` prefixes from 31 dependencies in `package.json`, pinned to exact versions from `package-lock.json`. **Why:** CLAUDE.md mandates exact version pinning for production. **Outcome:** Reproducible builds with no surprise updates.

---

## [2026-02-10] - Role Hierarchy & TypeScript Cleanup (PRs #52-#53)

### Added
- Role hierarchy system with `super_admin` and `org_admin` roles alongside existing `admin`, `manager`, `user`. Super admins get full platform access with 3-way view toggle; org admins are scoped to their organization with 2-way toggle. Legacy `admin` role treated as `org_admin` via backward compatibility. **Why:** Enable multi-tenant admin management with proper access scoping. **Outcome:** Complete role system with DB migration, RLS policies, permissions, middleware guards, and UI components.
- Safety fallback: `SUPER_ADMIN_EMAILS` array hardcodes primary admin email so super_admin access is always preserved even if DB role is incorrect. **Why:** Prevent lockout scenarios. **Outcome:** Primary admin always has full access.
- DB migration `20260210204145_role_hierarchy.sql` with RLS policies for new roles. **Why:** Database-level enforcement of role hierarchy. **Outcome:** RLS properly scopes data access by role.

### Changed
- Updated `ViewModeContext.tsx`, `permissions.ts`, `middleware.ts`, `admin/layout.tsx`, and `app/api/admin/users/route.ts` for the new role hierarchy. **Why:** All layers must enforce the role system consistently. **Outcome:** Role hierarchy enforced across DB, middleware, API, and UI.

### Fixed
- Resolved all TypeScript compilation errors across the codebase. **Why:** Clean builds are essential for code quality and catching bugs early. **Outcome:** `npx tsc --noEmit` passes with zero errors.
- Removed test utility files containing hardcoded `service_role` keys from git tracking and added to `.gitignore`. **Why:** Security -- service role keys should never be in version control. **Outcome:** Secrets are no longer tracked by git.

### Removed
- Removed `ignoreBuildErrors: true` from `next.config.mjs`. **Why:** TypeScript errors should block builds, not be silently ignored. **Outcome:** Production builds now fail on type errors, enforcing type safety.

---

## [2026-02-10] - Slack Integration

### Added
- Slack integration for CRM notifications via configurable webhook. **Why:** Enable real-time team notifications for lead events. **Outcome:** API routes at `/api/integrations/slack/send` and `/api/integrations/slack/test`.

---

## [2026-02-10] - Rebranding & FAQ (PR #52)

### Changed
- Rebranded all references from "LeadFlow" to "Goldyon" across all files including logos, titles, meta tags, and documentation. **Why:** Official brand name change. **Outcome:** Consistent Goldyon branding throughout the platform.

### Added
- FAQ page at `/settings/faq` with common questions about platform features, billing, and integrations. **Why:** Reduce support burden by providing self-service answers. **Outcome:** Users can find answers without contacting support.

---

## [2026-02-09] - Field Name Fixes (PR #51)

### Fixed
- Corrected field name mismatches between frontend and database in campaigns and contacts. **Why:** Mismatched field names caused silent data loss. **Outcome:** All form data correctly maps to database columns.
- Added null safety checks to prevent runtime crashes on optional fields. **Why:** Optional fields could cause undefined errors. **Outcome:** No more runtime crashes from missing optional data.

---

## [2026-02-09] - Admin Mode & Campaign UI Fixes (PR #50)

### Fixed
- Admin mode data refresh -- switching view modes now properly reloads data. **Why:** Stale data was shown after toggling view mode. **Outcome:** Data refreshes automatically on view mode change.
- Campaign title truncation in card layouts. **Why:** Long titles broke the card layout. **Outcome:** Titles truncate gracefully with ellipsis.
- Added proper plan gating for campaign features. **Why:** Campaign actions were accessible regardless of subscription tier. **Outcome:** Feature access respects subscription limits.

---

## [2026-02-09] - CSP & UI Fixes (PR #43)

### Fixed
- Allowed `unsafe-eval` in CSP for development mode only (required by Next.js hot reload). **Why:** CSP was blocking Next.js Fast Refresh in development. **Outcome:** Hot reload works in dev, `unsafe-eval` excluded in production.
- Fixed UI element clipping issues in dropdowns and modals. **Why:** Overflow hidden was cutting off dropdown menus. **Outcome:** All interactive elements render fully.

---

## [2026-02-09] - Persistent Rate Limiting & Hardened CSP (PR #42)

### Added
- Persistent rate limiting via Supabase `check_rate_limit()` RPC function with in-memory LRU cache as first layer. **Why:** In-memory rate limiting resets on server restart; persistent layer survives deploys. **Outcome:** Reliable rate limiting across server restarts and deployments.

### Changed
- Hardened Content Security Policy with proper directives for Stripe, Supabase, and data URIs. **Why:** Overly permissive CSP weakens XSS protection. **Outcome:** CSP is strict in production, slightly relaxed for development.

---

## [2026-02-09] - CSP Consolidation (PR #41)

### Removed
- Removed `unsafe-eval` from production CSP. **Why:** `unsafe-eval` defeats the purpose of CSP. **Outcome:** Stricter XSS protection in production.

### Changed
- Consolidated rate limiting logic into a single utility. **Why:** Rate limiting code was duplicated across endpoints. **Outcome:** Single source of truth for rate limit configuration.

---

## [2026-02-09] - UI Bugs & Enhancements (PR #40)

### Fixed
- Resolved multiple UI bugs referenced in issues #28-#38. **Why:** Various visual and interaction issues reported by users. **Outcome:** Smoother user experience across the platform.

---

## [2026-02-09] - Dashboard Chart Fixes (PR #39)

### Fixed
- Recharts console warnings for deprecated props. **Why:** Deprecated Recharts API usage generated console noise. **Outcome:** Clean console output.
- Fractional Y-axis tick values now display as integers only. **Why:** Fractional values like "2.5 leads" are nonsensical. **Outcome:** Clean integer tick marks.
- Missing KPI comparison percentages. **Why:** Calculation returned NaN when previous period had zero values. **Outcome:** Proper percentage display with zero-division handling.
- Date filter toggle not persisting selection. **Why:** State was reset on re-render. **Outcome:** Selected date range persists correctly.

---

## [2026-02-09] - Sidebar Navigation Fix (PR #27)

### Fixed
- Made Campaigns and Reports visible in sidebar for all subscription tiers. **Why:** Incorrect feature gating hid navigation items for valid tiers. **Outcome:** All users can see (and access based on tier) Campaigns and Reports.

---

## [2026-02-09] - Security & Webhook Fixes (PR #22)

### Fixed
- Added 10-second fetch timeout to outbound webhook delivery. **Why:** Hanging webhooks blocked the event loop. **Outcome:** Webhooks fail fast with timeout error.
- Reject email webhook requests when signature secret is not configured. **Why:** Unsigned webhooks are a security risk. **Outcome:** Webhook must have proper signature verification.
- Required authentication on welcome email endpoint (was public). **Why:** Unauthenticated endpoint could be abused for email spam. **Outcome:** Only authenticated users can trigger welcome emails.
- Middleware security: fixed n8n bypass, CSRF fallback handling, API route auth enforcement. **Why:** Multiple middleware bypasses discovered in security audit. **Outcome:** All routes properly enforce security policies.

---

## [2026-02-09] - Database Security & Validation (PR #11)

### Added
- HSTS header (Strict-Transport-Security) with 1-year max-age. **Why:** Enforce HTTPS connections. **Outcome:** Browsers will always use HTTPS after first visit.
- Content-Security-Policy headers to middleware. **Why:** XSS protection. **Outcome:** CSP prevents unauthorized script execution.
- DB validation constraints: email format validation, non-negative deal_value, single primary contact per business. **Why:** Data integrity at the database level. **Outcome:** Invalid data is rejected by PostgreSQL constraints.
- Super admin RLS policies for profiles table (can view/update all). **Why:** Super admins need to manage all users. **Outcome:** Full profile access for super admins.
- Org admin RLS policies scoped by organization_id. **Why:** Org admins should only see their organization's data. **Outcome:** Multi-tenant data isolation.

### Changed
- Regenerated `database.ts` types from actual DB schema with proper `Relationships`. **Why:** Join type inference was returning `never[]` without Relationships. **Outcome:** Supabase joins infer correct types.
- Scoped RLS SELECT policies to user ownership on businesses and campaigns. **Why:** Users could see other users' data. **Outcome:** Data access restricted to own records (except admins).

---

## [2026-02-09] - Sprint 5: CSV Import/Export + Email Auto-Capture

### Added
- Export API (`GET /api/leads/export`) -- server-side CSV generation with filter pass-through, rate limited 5/min. **Why:** Users need to export lead data for external analysis. **Outcome:** Feature-gated CSV export for Growth+ tiers.
- Import API (`POST /api/leads/import`) -- batch insert with Zod validation, duplicate detection (skip/overwrite/create), auto-contact creation, automation triggers. **Why:** Bulk lead import saves manual data entry. **Outcome:** 4-step import wizard with drag/drop, auto column mapping, progress bar.
- Email auto-capture via BCC forwarding -- unique forwarding address per user, `captured_emails` table, email matching via businesses/contacts email, Resend inbound webhook, deduplication by Message-ID. **Why:** Automatically log email interactions without manual activity creation. **Outcome:** Settings UI with Gmail/Outlook setup guides.
- `papaparse` dependency for client-side CSV parsing. **Why:** Needed for CSV import preview and column mapping. **Outcome:** Fast client-side CSV processing.

---

## [2026-02-09] - Sprint 4: Follow-ups, Mobile, Dedup, Guided Workflow, Zapier/Make

### Added
- Follow-up system: `next_follow_up` date field persisted to database with partial index, overdue highlighting, quick action set follow-up, dashboard widgets (overdue alerts, due today, stale leads). **Why:** Sales reps need follow-up tracking and reminders. **Outcome:** Visual follow-up management integrated into leads and dashboard.
- Mobile responsive layout: hidden sidebar with hamburger toggle, slide-in overlay, responsive padding. **Why:** Platform needs to work on mobile devices. **Outcome:** Usable on phones and tablets.
- Duplicate detection API (`POST /api/leads/check-duplicates`) with fuzzy name + exact email/phone matching. **Why:** Prevent duplicate lead entries. **Outcome:** Non-blocking warning in create form with links to existing leads.
- Next-best-action suggestions: status-specific action recommendations (max 3), cross-cutting suggestions for follow-ups and idle hot leads. **Why:** Guide users toward optimal sales actions. **Outcome:** Contextual suggestions on lead detail pages.
- Stage transition guidance: transition map with suggested/allowed/requiresReason statuses, reason modal for Won/Lost. **Why:** Standardize pipeline progression. **Outcome:** Guided transitions with audit trail.
- Zapier & Make integration guide with one-click webhook creation. **Why:** Enable third-party automation platform connections. **Outcome:** Documentation and UI for webhook setup.

---

## [2026-02-09] - Sprint 3: Automation Expansion, Realtime, Free Tier & UI Polish

### Added
- 4 new automation actions: `create_task`, `update_status`, `assign_user`, `send_webhook`. **Why:** Expand automation capabilities beyond email notifications. **Outcome:** Versatile automation engine supporting common CRM workflows.
- Auto-trigger on lead status change (fires `status_changed` trigger). **Why:** Status changes are key moments for automated follow-up. **Outcome:** Automation runs automatically on pipeline progression.
- Supabase Realtime subscriptions with `useRealtimeSubscription` hook. **Why:** Multi-tab and multi-user data consistency. **Outcome:** Live data sync for leads, contacts, and activities.
- Environment variable validation at startup (`validateEnv()`). **Why:** Fail fast on misconfiguration. **Outcome:** Clear error messages for missing required env vars.
- `send_webhook` action with HTTPS-only enforcement and 10s timeout. **Why:** Outbound webhook integration for n8n/Zapier/Make. **Outcome:** SSRF-safe webhook delivery.

### Changed
- Free tier: lead limit reduced from 50 to 25, campaigns reduced from 1 to 0. **Why:** Encourage upgrades to paid tiers. **Outcome:** Free tier is a trial experience.
- Fixed quick actions tile alignment and removed duplicate "Analytics" sidebar nav item. **Why:** UI polish. **Outcome:** Cleaner dashboard layout.

---

## [2026-02-09] - Sprint 2: Stripe, Email & Automation Foundation

### Added
- Stripe integration: checkout session creation, customer portal, webhook handler for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. **Why:** Enable paid subscriptions. **Outcome:** Full payment lifecycle from checkout to cancellation.
- Resend email integration: email sending API (`/api/email/send`), welcome email template. **Why:** Transactional email capability. **Outcome:** HTML email sending with lazy SDK initialization.
- Automation engine foundation: rule-based engine with trigger/action pattern, `send_email` action, execution API, logs table, success/failure tracking. **Why:** Automate repetitive CRM tasks. **Outcome:** `useCreateLead` fires `lead_created` trigger on success.
- 5-tier subscription system: `useSubscription` hook with `can()`, `limit()`, `atLimit()` helpers; `UsageLimitBar`, `UpgradeModal`, `FeatureGate` components; admin tier management. **Why:** Monetization and feature differentiation. **Outcome:** Complete feature gating system.
- Pricing page (`/pricing`) with 5-tier plan cards and feature comparison table. **Why:** Public-facing sales page. **Outcome:** Monthly/annual toggle with pricing details.
- Billing settings page (`/settings/billing`) with current plan and usage overview. **Why:** Users need to see their subscription status. **Outcome:** Usage bars and plan change CTA.
- API key management with CRUD, scoped permissions, integration types. **Why:** Enable API access for integrations. **Outcome:** Full API key lifecycle management.

---

## [2026-02-09] - Bug Fixes & Stability

### Fixed
- 10 bug fixes: dashboard loading, activity errors, row navigation, date/score consistency. **Why:** Various runtime and UX issues reported. **Outcome:** Stable core functionality.

### Added
- In-app seed data button for quick test data population. **Why:** Simplify testing setup. **Outcome:** One-click test data generation.

### Changed
- Moved `@types/papaparse` to devDependencies. **Why:** Type packages belong in devDependencies. **Outcome:** Cleaner production dependency tree.

---

## [2026-02-08] - Monetization System & Security Audit

### Added
- Monetization system with Stripe integration. **Why:** Revenue generation capability. **Outcome:** Subscription management infrastructure.
- Security audit identifying 17 vulnerabilities (2 Critical, 5 High). **Why:** Pre-launch security review. **Outcome:** Critical findings documented and prioritized.

### Fixed
- Critical privilege escalation chain: signup metadata injection + profile self-modification allowed users to grant themselves admin roles. **Why:** Critical security vulnerability. **Outcome:** Protected columns trigger blocks self-role-escalation.

---

## [2026-02-07] - Lead Creation & Stability Fixes

### Fixed
- Lead creation flow and Supabase type issues. **Why:** Lead creation was broken due to type mismatches. **Outcome:** Working lead CRUD.
- Runtime errors and stability improvements. **Why:** Various startup and runtime crashes. **Outcome:** Stable application boot and operation.

### Added
- Initial documentation: README, SETUP, CHANGELOG. **Why:** Developer onboarding. **Outcome:** Basic project documentation.

---

## [2026-02-04] - Phase 5: Admin Panel, Integrations & Polish

### Added
- Admin panel with user management, system settings, and audit logs. **Why:** Platform administration capability. **Outcome:** Admin pages at `/admin/users`, `/admin/settings`, `/admin/audit`.
- Role-based access control for admin routes. **Why:** Restrict admin functions to authorized users. **Outcome:** Middleware and layout guards enforce admin access.

---

## [2026-02-04] - Phase 4: Campaigns, Reports & Workflow Automation

### Added
- Campaign management: types (Email, Cold Call, Direct Mail, Social Media, Multi-Channel), lifecycle (Draft, Active, Paused, Completed), creation form, stats overview. **Why:** Marketing campaign tracking. **Outcome:** Full campaign CRUD.
- Reports: types (Leads, Activities, Campaigns, Pipeline, Team Performance, Custom), scheduling, CSV export. **Why:** Data analysis and reporting. **Outcome:** Saved reports with scheduling.
- Workflow automation foundation. **Why:** Automate CRM processes. **Outcome:** Rule-based automation engine.

---

## [2026-02-04] - Phase 3: Dashboard with Unified Analytics

### Added
- KPI cards: Total Leads, New This Week, Pipeline Value, Conversion Rate, Deals Won, Revenue Won, Activities Today, Average Deal Size. **Why:** At-a-glance business metrics. **Outcome:** Interactive dashboard with key performance indicators.
- Charts: Leads Trend (30 days), Revenue Trend (6 months), Pipeline Funnel, Source Distribution (pie chart), Activity Heatmap (12 weeks). **Why:** Visual data analysis. **Outcome:** Interactive Recharts visualizations.
- Date range selector with presets and quick actions panel. **Why:** Flexible data filtering and fast actions. **Outcome:** Configurable dashboard experience.

---

## [2026-02-04] - Phase 2: Core CRM with 360-Degree Customer View

### Added
- Full lead CRUD with 40+ fields: business info, address, social media, Google Business Profile, website scores, deal info, tags, custom fields. **Why:** Comprehensive lead data management. **Outcome:** List view with filters, sorting, pagination, and full-text search.
- Contacts linked to businesses with primary contact designation. **Why:** Track people associated with each lead. **Outcome:** Contact CRUD with primary flag.
- Activity logging and customer journey timeline. **Why:** Track all interactions with leads. **Outcome:** 20+ activity types with timeline visualization.
- Global contacts directory with alphabetical grouping. **Why:** Quick contact lookup across all leads. **Outcome:** Searchable contacts page.

---

## [2026-02-04] - Phase 1: Foundation - Auth, Layout, Theme

### Added
- Email/password authentication via Supabase Auth with auto-profile creation trigger. **Why:** User authentication is foundational. **Outcome:** Login, register, forgot-password flows.
- Dark theme with gold accent design language. **Why:** Brand identity and visual distinction. **Outcome:** Custom TailwindCSS theme configuration.
- Dashboard shell with sidebar navigation and header. **Why:** Application layout framework. **Outcome:** Consistent page structure across the app.
- Database migrations (11 core tables) and Playwright E2E test setup. **Why:** Data layer and testing infrastructure. **Outcome:** PostgreSQL schema with RLS and test framework.

---

## [2026-02-04] - Initial Commit

### Added
- Project scaffolded with Create Next App (Next.js 14). **Why:** Project initialization. **Outcome:** TypeScript, TailwindCSS, ESLint configured.

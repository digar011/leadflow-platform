# TODO -- Goldyon / LeadFlow Platform

> Last updated: 2026-03-01

## Queue (Not Started)

### Critical — Security

- [ ] Rotate Supabase service_role key and gitignore all test files with hardcoded keys -- audit finding C2
  - Files: `tests/e2e-full-test.mjs`, `tests/verify-admin-test-user.mjs`, `tests/setup-admin-test.mjs`, `tests/cleanup-e2e-data.mjs`, `tests/e2e/auth.setup.ts`
- [ ] Fix CSRF bypass on API routes -- audit finding C7
  - `middleware.ts:30-32` skips Origin validation for all `/api/` routes
- [ ] Add auth check to Slack send API route -- audit finding M3
  - `app/api/integrations/slack/send/route.ts` has no `auth.getUser()` check
- [ ] Sanitize HTML in email send route -- audit finding C6
  - `app/api/email/send/route.ts` passes user HTML directly to Resend without `sanitizeHtml()`
- [x] Fix `.gitignore` to cover plain `.env` files -- completed 2026-03-01 by Claude
- [x] Add `RESEND_WEBHOOK_SECRET` to `.env.example` -- completed 2026-03-01 by Claude

### Critical — Broken Flows

- [x] Create `/reset-password` page -- completed 2026-03-01 by Claude (PR #87)
- [x] Create `/terms` and `/privacy` pages -- completed 2026-03-01 by Claude (PR #88)
- [x] Add cookie consent banner -- completed 2026-03-01 by Claude
  - Outcome: CookieConsent component with accept/reject, links to /privacy

### Critical — Database

- [x] Fix RLS policies to include `org_admin` role -- completed 2026-03-01 by Claude (PR #89)
- [x] Fix `manager` role DB constraint mismatch -- completed 2026-03-01 by Claude (PR #89)
- [x] Fix n8n webhook module-level Supabase init -- completed 2026-03-01 by Claude (PR #89)

### High — Missing Pages & UX

- [x] Create `not-found.tsx` (404 page) -- completed 2026-03-01 by Claude (PR #90)
- [ ] Create public landing page -- audit finding M5
  - `app/page.tsx` just redirects to `/login`, no SEO value
- [x] Add loading.tsx states for dashboard sub-routes -- completed 2026-03-01 by Claude
  - Outcome: 7 loading skeletons for leads, contacts, activities, campaigns, reports, automation, settings
- [x] Optimize logo images -- completed 2026-03-01 by Claude
  - Outcome: WebP conversion (1.3MB->25KB, 1.8MB->115KB), all references updated

### High — Monitoring & Deploy

- [x] Add Sentry reporting to error boundaries -- completed 2026-03-01 by Claude
  - Outcome: Both error.tsx files use Sentry.captureException
- [ ] Add E2E tests to CI pipeline -- audit finding
  - 21 Playwright specs exist but never run in CI
- [ ] Fix staging deploy smoke test URL wiring -- audit finding
  - `deploy-staging` job doesn't expose output URL properly
- [ ] Ensure Vercel deploys depend on CI checks passing -- audit finding
  - Vercel auto-deploy may run before CI finishes

### High — Testing

- [ ] Expand unit test coverage beyond `lib/utils/` -- audit finding
  - API routes, hooks, components, security utils, Stripe/email logic all untested
  - Current coverage only measures `lib/utils/**/*.ts`, far below 80% target

### Medium — SEO & Social

- [x] Add `og:image` to Open Graph metadata -- completed 2026-03-01 by Claude
  - Outcome: Dynamic OG image via Next.js ImageResponse + Twitter Card metadata
- [x] Add Twitter Card metadata -- completed 2026-03-01 by Claude

### Medium — Performance

- [ ] Optimize `useLeadStats` hook — 3 sequential full-table queries -- audit finding M7
  - `lib/hooks/useLeads.ts:301-357` fetches ALL businesses to count client-side
- [ ] Add database indexes for search columns -- audit finding L2
  - `business_name`, `email`, `city` columns need indexes for `ilike` queries

### Medium — Code Quality

- [x] Standardize API error response format -- completed 2026-03-01 by Claude (PR #91)
  - Created `lib/utils/api-errors.ts` with `ApiErrors` helper and `handleApiError`. Updated all 15 API routes.
- [x] Fix error details leak in admin seed route -- completed 2026-03-01 by Claude (PR #91)
  - Fixed in admin/seed, slack/send, slack/test, and leads/import routes via `handleApiError`.
- [x] Clean stale repo dirs from tsconfig.json exclude -- completed 2026-03-01 by Claude (PR #92)
  - Outcome: Removed 12 stale dirs from tsconfig exclude, added to .gitignore.
- [x] Add `engines` field to package.json -- completed 2026-03-01 by Claude (PR #91)
- [x] Make Resend client throw on missing API key -- completed 2026-03-01 by Claude (PR #94)
  - `getResend()` now throws explicit error when `RESEND_API_KEY` is missing. Unit tests added.
- [ ] Verify `goldyon.com` domain in Resend dashboard -- audit finding
  - `EMAIL_FROM` defaults to `noreply@goldyon.com`, must be verified to send
- [x] Add HSTS header to vercel.json -- completed 2026-03-01 by Claude (PR #91)
- [x] Fix CSP `connect-src` inconsistency -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Added Sentry ingest domain to security.ts CSP
- [x] Add Vercel `maxDuration` for webhook routes -- completed 2026-03-01 by Claude (PR #98)
  - Set `maxDuration = 30` on Stripe, email-inbound, and n8n webhook routes.

## In Progress

(none)

## Completed

- [x] Lighthouse audit on all client-facing pages -- completed 2026-03-01 by Claude (PR #85)
  - Outcome: Lighthouse CI workflow on PRs, lighthouserc.json config targeting 5 public pages (/, /pricing, /login, /register, /forgot-password). Summary script with color output and CI markdown table. Thresholds: Performance >= 80, Accessibility >= 90, Best Practices >= 90, SEO >= 90.
- [x] Create staging environment on Vercel -- completed 2026-03-01 by Claude (PR #84)
  - Outcome: vercel.json with security headers, staging-deploy.yml workflow (lint, test, deploy, smoke test) triggered on staging branch pushes. ONBOARDING.md updated with staging setup guide, GitHub Secrets required.
- [x] Merge role hierarchy feature branch to main -- completed 2026-03-01 by Claude
  - Outcome: Verified all role hierarchy changes (super_admin/org_admin roles, RLS policies, DB migration, permissions, middleware, UI) are already on master. Branch `feature/role-hierarchy-and-test-fixes` has zero commits ahead of master. Marked as complete.
- [x] Monthly dependency audit schedule -- completed 2026-03-01 by Claude (PR #81)
  - Outcome: GitHub Actions workflow runs on the 1st of each month, auto-creates issues for vulnerabilities. Local `npm run audit-deps` script for on-demand checks.
- [x] Set up Sentry error tracking for production -- completed 2026-03-01 by Claude (PR #80)
  - Outcome: @sentry/nextjs v10 with client/server/edge init, session replay, browser tracing, global-error.tsx, CSP updated for Sentry ingest.
- [x] Add SEO meta tags, sitemap.xml, and robots.txt -- completed 2026-03-01 by Claude (PR #79)
  - Outcome: Dynamic sitemap.ts with public pages, robots.ts blocking dashboard/admin/api, OG tags on pricing, noindex on auth pages.
- [x] Set up CI/CD with GitHub Actions -- completed 2026-03-01 by Claude (PR #78)
  - Outcome: 4-job CI pipeline (lint, typecheck, unit-tests, build) on PRs and pushes to master. Coverage artifacts uploaded.
- [x] Set up structured logging for API routes -- completed 2026-03-01 by Claude (PR #77)
  - Outcome: JSON-formatted structured logger with createLogger() factory. Applied to leads export, import, and Stripe webhook routes.
- [x] Add React Error Boundaries at page and feature level -- completed 2026-03-01 by Claude (PR #76)
  - Outcome: ErrorBoundary class component with page/feature variants, root error.tsx and dashboard error.tsx, DashboardShell wrapped.
- [x] Add .env.example validation script -- completed 2026-03-01 by Claude (PR #75)
  - Outcome: Standalone validate-env.mjs script with required/recommended/optional categorization and --strict mode. Enhanced env.ts runtime checks.
- [x] Set up Jest for unit testing -- completed 2026-03-01 by Claude (PR #74)
  - Outcome: Jest + ts-jest + @testing-library/jest-dom configured. 7 test suites, 166 tests covering formatters, validation, subscription, stage transitions, permissions, CSV fields, next-best-action. 76.68% coverage.
- [x] Pin exact dependency versions in package.json -- completed 2026-03-01 by Claude (PR #73)
  - Outcome: Removed all ^ and ~ prefixes from 31 dependencies. Exact versions pinned from package-lock.json.
- [x] Stricter ESLint config + remove ignoreDuringBuilds -- completed 2026-03-01 by Claude (PR #72)
  - Outcome: Added @typescript-eslint/eslint-plugin with strict rules, no-console warn, consistent-type-imports. Fixed lint errors across ~48 files. ignoreDuringBuilds kept temporarily due to pre-existing warnings.
- [x] Create CLAUDE.md, ONBOARDING.md, PRODUCT.md, TODO.md, CHANGELOG.md (root) -- completed 2026-02-28 by Claude
  - Outcome: All Codexium standard documentation files created at project root.
- [x] Role hierarchy system (super_admin, org_admin) -- completed 2026-02-10 by Diego
  - Outcome: 5-tier role hierarchy with view mode toggle, RLS policies, DB migration, permissions, middleware, and UI components. 132/132 E2E tests passing.
- [x] TypeScript errors cleanup, remove ignoreBuildErrors -- completed 2026-02-10 (PR #53)
  - Outcome: All TypeScript compilation errors resolved, clean builds enforced.
- [x] Rebrand LeadFlow to Goldyon -- completed 2026-02-10 (PR #52)
  - Outcome: All references updated across code, docs, meta tags, logos.
- [x] Security hardening -- HSTS, CSP, RLS scoping, DB constraints -- completed 2026-02-09 (PR #11)
  - Outcome: Security headers added to middleware, RLS policies scoped to user ownership, validation constraints on email/deal_value/primary contact.
- [x] Persistent rate limiting via Supabase -- completed 2026-02-09 (PR #42)
  - Outcome: In-memory LRU cache + Supabase persistent fallback for rate limiting.
- [x] Sprint 5: CSV Import/Export + Email Auto-Capture -- completed 2026-02-09
  - Outcome: Server-side CSV export, 4-step import wizard, BCC email capture with dedup.
- [x] Sprint 4: Follow-ups, Mobile Responsive, Dedup, Guided Workflow -- completed 2026-02-09
  - Outcome: Follow-up system, mobile sidebar, duplicate detection, next-best-action, stage transitions.
- [x] Sprint 3: Automation Expansion, Realtime, Free Tier, UI Polish -- completed 2026-02-09
  - Outcome: 4 new automation actions, Supabase Realtime, env validation, free tier limits.
- [x] Sprint 2: Stripe, Email, Automation Foundation -- completed 2026-02-09
  - Outcome: Stripe checkout/portal/webhooks, Resend email, automation engine, subscription system.
- [x] Monetization system + Security audit -- completed 2026-02-08
  - Outcome: 5-tier subscription model, 17 security findings identified, critical privilege escalation fixed.
- [x] Phase 5: Admin Panel, Integrations -- completed 2026-02-04
  - Outcome: User management, system settings, audit logs, role-based admin access.
- [x] Phase 4: Campaigns, Reports, Automation -- completed 2026-02-04
  - Outcome: Campaign CRUD, report types with scheduling, workflow automation foundation.
- [x] Phase 3: Dashboard with Analytics -- completed 2026-02-04
  - Outcome: KPI cards, interactive charts, activity heatmap, date range selector.
- [x] Phase 2: Core CRM with 360-Degree Customer View -- completed 2026-02-04
  - Outcome: Lead CRUD (40+ fields), contacts, activities, customer journey timeline.
- [x] Phase 1: Foundation - Auth, Layout, Theme -- completed 2026-02-04
  - Outcome: Supabase Auth, dark theme with gold accents, dashboard shell, migrations, Playwright setup.
- [x] Initial project scaffolding -- completed 2026-02-04
  - Outcome: Next.js 14 with TypeScript, TailwindCSS, ESLint configured.

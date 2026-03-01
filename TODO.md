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
- [ ] Fix `.gitignore` to cover plain `.env` files -- audit finding C4
- [ ] Add `RESEND_WEBHOOK_SECRET` to `.env.example` -- audit finding C5

### Critical — Broken Flows

- [ ] Create `/reset-password` page -- audit finding
  - Forgot-password flow sends users to `/reset-password` which doesn't exist
- [ ] Create `/terms` and `/privacy` pages -- audit finding
  - Register page links to dead routes, legally required for SaaS (GDPR/CCPA)
- [ ] Add cookie consent banner -- audit finding
  - App uses auth cookies + Sentry session replay, required under GDPR/ePrivacy

### Critical — Database

- [ ] Fix RLS policies to include `org_admin` role -- audit finding C9
  - Migration `20260211000000` only checks `role IN ('admin', 'manager')`, misses `org_admin` and `super_admin`
- [ ] Fix `manager` role DB constraint mismatch -- audit finding C10
  - TypeScript types include `manager` but DB constraint rejects it: `CHECK (role IN ('super_admin', 'org_admin', 'admin', 'user'))`
- [ ] Fix n8n webhook module-level Supabase init -- audit finding C8
  - `app/api/webhooks/n8n/route.ts:6-9` creates client at import time, crashes if env vars missing

### High — Missing Pages & UX

- [ ] Create `not-found.tsx` (404 page) -- audit finding M4
  - Default Next.js 404 breaks dark theme/branding
- [ ] Create public landing page -- audit finding M5
  - `app/page.tsx` just redirects to `/login`, no SEO value
- [ ] Add loading.tsx states for dashboard sub-routes -- audit finding M6
- [ ] Optimize logo images -- audit finding
  - `logo-dark.png` (1.3 MB) and `logo-light.png` (1.8 MB) need compression/WebP conversion

### High — Monitoring & Deploy

- [ ] Add Sentry reporting to error boundaries -- audit finding M10
  - `app/error.tsx` and `app/(dashboard)/error.tsx` only use `console.error`, errors never reach Sentry
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

- [ ] Add `og:image` to Open Graph metadata -- audit finding L3
- [ ] Add Twitter Card metadata -- audit finding L4

### Medium — Performance

- [ ] Optimize `useLeadStats` hook — 3 sequential full-table queries -- audit finding M7
  - `lib/hooks/useLeads.ts:301-357` fetches ALL businesses to count client-side
- [ ] Add database indexes for search columns -- audit finding L2
  - `business_name`, `email`, `city` columns need indexes for `ilike` queries

### Medium — Code Quality

- [ ] Standardize API error response format -- audit finding M1
  - Should follow `{ success: false, error: { code, message, details } }` per CLAUDE.md
- [ ] Fix error details leak in admin seed route -- audit finding M2
  - `app/api/admin/seed/route.ts:40` returns raw DB error messages
- [ ] Clean stale repo dirs from tsconfig.json exclude -- audit finding
  - 12 old repo names listed that shouldn't be in project directory
- [ ] Add `engines` field to package.json -- audit finding
  - Enforce Node.js 20 to match CI
- [ ] Make Resend client throw on missing API key -- audit finding
  - `lib/email/resend.ts` fails silently if `RESEND_API_KEY` is empty
- [ ] Verify `goldyon.com` domain in Resend dashboard -- audit finding
  - `EMAIL_FROM` defaults to `noreply@goldyon.com`, must be verified to send
- [ ] Add HSTS header to vercel.json -- audit finding
  - Only in middleware currently, vercel.json covers static files too
- [ ] Fix CSP `connect-src` inconsistency -- audit finding L1
  - `lib/utils/security.ts:202` misses Sentry ingest domain vs middleware.ts
- [ ] Add Vercel `maxDuration` for webhook routes -- audit finding

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

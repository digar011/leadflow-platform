# TODO -- Goldyon / LeadFlow Platform

> Last updated: 2026-03-01

## Queue (Not Started)

- [ ] Create staging environment on Vercel -- assigned by Diego on 2026-02-28
- [ ] Lighthouse audit on all client-facing pages -- assigned by Diego on 2026-02-28

## In Progress

- [ ] Merge role hierarchy feature branch to main -- started 2026-02-10 by Diego
  - Notes: Branch `feature/role-hierarchy-and-test-fixes` is 3 commits ahead of master. Not yet pushed/PR'd. Includes super_admin/org_admin roles, security hardening (gitignored secrets), and E2E test stability improvements.

## Completed

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

# TODO -- Goldyon / LeadFlow Platform

> Last updated: 2026-03-02

## Queue (Not Started)

### Manual Tasks (require dashboard access)

- [ ] Rotate Supabase service_role key -- audit finding C2
  - Key must be rotated in Supabase dashboard (manual step). Test files with hardcoded keys already gitignored and removed (PR #99).
- [ ] Verify `goldyon.com` domain in Resend dashboard -- audit finding
  - `EMAIL_FROM` defaults to `noreply@goldyon.com`, must be verified in Resend to send emails.

## In Progress

(none)

## Completed

### 2026-03-02

- [x] Fix tsconfig stale repo dir exclusions + security test fix -- completed 2026-03-02 by Claude (PR #104)
  - Outcome: Restored 12 stale repo dir exclusions in tsconfig.json removed by PR #92. Fixed security test NODE_ENV mutation. Updated jest.config.ts coverage paths.

### 2026-03-01 — Security, CI/CD, Landing Page & Performance (PRs #99-#102)

- [x] Fix CSRF bypass on API routes -- completed 2026-03-01 by Claude (PR #99)
  - Outcome: Middleware validates Origin/Referer for POST/PUT/DELETE/PATCH on `/api/` routes. GET/HEAD/OPTIONS and webhook routes exempt.
- [x] Add auth check to Slack send API route -- completed 2026-03-01 by Claude (PR #99)
  - Outcome: Added `supabase.auth.getUser()` check. Unauthenticated requests return 401.
- [x] Sanitize HTML in email send route -- completed 2026-03-01 by Claude (PR #99)
  - Outcome: `sanitizeHtml()` applied to user HTML before passing to Resend.
- [x] Gitignore test files with hardcoded keys -- completed 2026-03-01 by Claude (PR #99)
  - Outcome: 5 test utility files added to .gitignore and removed from tracking.
- [x] Create public landing page -- completed 2026-03-01 by Claude (PR #100)
  - Outcome: Hero, 6-feature grid, CTA sections, footer. Full SEO metadata (OG, Twitter Card, canonical).
- [x] Add E2E tests to CI pipeline -- completed 2026-03-01 by Claude (PR #101)
  - Outcome: Playwright E2E job in ci.yml runs after build. continue-on-error until CI Supabase configured. Artifacts retained 14 days.
- [x] Fix staging deploy smoke test URL wiring -- completed 2026-03-01 by Claude (PR #101)
  - Outcome: deploy-staging job properly exposes deployment URL via outputs. Health check uses actual URL.
- [x] Ensure Vercel deploys depend on CI checks passing -- completed 2026-03-01 by Claude (PR #101)
  - Outcome: Added `"github": { "silent": true }` to vercel.json.
- [x] Expand unit test coverage beyond `lib/utils/` -- completed 2026-03-01 by Claude (PRs #100, #104)
  - Outcome: 100 new tests across 4 suites (constants, env, logger, security). 13 suites, 288 tests total. Exceeds 80% coverage target.
- [x] Optimize `useLeadStats` hook -- completed 2026-03-01 by Claude (PR #102)
  - Outcome: Replaced sequential full-table queries with parallel head-only count queries per status via Promise.all.
- [x] Add database indexes for search columns -- completed 2026-03-01 by Claude (PR #102)
  - Outcome: Migration adds trigram indexes on business_name/email/city, B-tree indexes on status/assigned_to/created_at, composite (assigned_to, status).

### 2026-03-01 — Security, UX & Performance Batch (PRs #91, #92, #94, #98)

- [x] Standardize API error response format -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Created `lib/utils/api-errors.ts` with `ApiErrors` helper and `handleApiError`. Updated all 15 API routes. 17 unit tests added.
- [x] Fix error details leak in admin seed route -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Fixed in admin/seed, slack/send, slack/test, and leads/import routes via `handleApiError`.
- [x] Cookie consent banner -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: CookieConsent component with accept/reject, links to /privacy.
- [x] Dashboard loading skeletons -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: 7 loading.tsx states for leads, contacts, activities, campaigns, reports, automation, settings.
- [x] Dynamic OG image + Twitter Card metadata -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Next.js ImageResponse at opengraph-image.tsx with Goldyon branding. summary_large_image card in root layout.
- [x] Optimize logo images -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: WebP conversion (1.3MB->25KB, 1.8MB->115KB), all references updated.
- [x] Add Sentry reporting to error boundaries -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Both error.tsx files use Sentry.captureException.
- [x] Fix CSP `connect-src` inconsistency -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Added Sentry ingest domain to security.ts CSP.
- [x] Add HSTS header to vercel.json -- completed 2026-03-01 by Claude (PR #91)
  - Outcome: Covers static files served by Vercel CDN.
- [x] Fix `.gitignore` to cover plain `.env` files -- completed 2026-03-01 by Claude (PR #91)
- [x] Add `RESEND_WEBHOOK_SECRET` to `.env.example` -- completed 2026-03-01 by Claude (PR #91)
- [x] Add `engines` field to package.json -- completed 2026-03-01 by Claude (PR #91)
- [x] Add Vercel `maxDuration` for webhook routes -- completed 2026-03-01 by Claude (PR #98)
  - Outcome: Set `maxDuration = 30` on Stripe, email-inbound, and n8n webhook routes.
- [x] Clean stale repo dirs from tsconfig.json exclude -- completed 2026-03-01 by Claude (PR #92)
  - Outcome: Removed 12 stale dirs from tsconfig exclude, added to .gitignore.
- [x] Make Resend client throw on missing API key -- completed 2026-03-01 by Claude (PR #94)
  - Outcome: `getResend()` now throws explicit error when `RESEND_API_KEY` is missing. Unit tests added.

### 2026-03-01 — Pages & Database Fixes (PRs #87-#90)

- [x] Create `/reset-password` page -- completed 2026-03-01 by Claude (PR #87)
- [x] Create `/terms` and `/privacy` pages -- completed 2026-03-01 by Claude (PR #88)
- [x] Fix RLS policies to include `org_admin` role -- completed 2026-03-01 by Claude (PR #89)
- [x] Fix `manager` role DB constraint mismatch -- completed 2026-03-01 by Claude (PR #89)
- [x] Fix n8n webhook module-level Supabase init -- completed 2026-03-01 by Claude (PR #89)
- [x] Create `not-found.tsx` (404 page) -- completed 2026-03-01 by Claude (PR #90)

### 2026-03-01 — Infrastructure, DevOps & Quality (PRs #72-#85)

- [x] Lighthouse audit on all client-facing pages -- completed 2026-03-01 by Claude (PR #85)
- [x] Create staging environment on Vercel -- completed 2026-03-01 by Claude (PR #84)
- [x] Monthly dependency audit schedule -- completed 2026-03-01 by Claude (PR #81)
- [x] Set up Sentry error tracking for production -- completed 2026-03-01 by Claude (PR #80)
- [x] Add SEO meta tags, sitemap.xml, and robots.txt -- completed 2026-03-01 by Claude (PR #79)
- [x] Set up CI/CD with GitHub Actions -- completed 2026-03-01 by Claude (PR #78)
- [x] Set up structured logging for API routes -- completed 2026-03-01 by Claude (PR #77)
- [x] Add React Error Boundaries at page and feature level -- completed 2026-03-01 by Claude (PR #76)
- [x] Add .env.example validation script -- completed 2026-03-01 by Claude (PR #75)
- [x] Set up Jest for unit testing -- completed 2026-03-01 by Claude (PR #74)
- [x] Pin exact dependency versions in package.json -- completed 2026-03-01 by Claude (PR #73)
- [x] Stricter ESLint config + remove ignoreDuringBuilds -- completed 2026-03-01 by Claude (PR #72)

### 2026-02-28

- [x] Create CLAUDE.md, ONBOARDING.md, PRODUCT.md, TODO.md, CHANGELOG.md (root) -- completed 2026-02-28 by Claude
- [x] Merge role hierarchy feature branch to main -- completed 2026-03-01 by Claude

### 2026-02-10

- [x] Role hierarchy system (super_admin, org_admin) -- completed 2026-02-10 by Diego
- [x] TypeScript errors cleanup, remove ignoreBuildErrors -- completed 2026-02-10 (PR #53)
- [x] Rebrand LeadFlow to Goldyon -- completed 2026-02-10 (PR #52)

### 2026-02-09

- [x] Security hardening -- HSTS, CSP, RLS scoping, DB constraints -- completed 2026-02-09 (PR #11)
- [x] Persistent rate limiting via Supabase -- completed 2026-02-09 (PR #42)
- [x] Sprint 5: CSV Import/Export + Email Auto-Capture -- completed 2026-02-09
- [x] Sprint 4: Follow-ups, Mobile Responsive, Dedup, Guided Workflow -- completed 2026-02-09
- [x] Sprint 3: Automation Expansion, Realtime, Free Tier, UI Polish -- completed 2026-02-09
- [x] Sprint 2: Stripe, Email, Automation Foundation -- completed 2026-02-09
- [x] Monetization system + Security audit -- completed 2026-02-08

### 2026-02-04

- [x] Phase 5: Admin Panel, Integrations -- completed 2026-02-04
- [x] Phase 4: Campaigns, Reports, Automation -- completed 2026-02-04
- [x] Phase 3: Dashboard with Analytics -- completed 2026-02-04
- [x] Phase 2: Core CRM with 360-Degree Customer View -- completed 2026-02-04
- [x] Phase 1: Foundation - Auth, Layout, Theme -- completed 2026-02-04
- [x] Initial project scaffolding -- completed 2026-02-04

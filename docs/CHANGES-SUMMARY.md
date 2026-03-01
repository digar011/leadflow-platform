# Goldyon CRM - Changes Summary

Every change made to the project since inception, categorized by what it **fixes**, **improves**, or **introduces**.

---

## New Features

| Change | Date | Purpose |
|--------|------|---------|
| Initial scaffolding with Create Next App | 2026-02-04 | Bootstrap the project with Next.js 14, TypeScript, TailwindCSS |
| Phase 1: Auth, Layout, Theme | 2026-02-04 | Establish authentication (Supabase Auth), dark/gold UI theme, and app shell |
| Phase 2: Core CRM with 360-degree customer view | 2026-02-04 | Build the core CRM: leads CRUD (40+ fields), contacts, activities, customer journey timeline |
| Phase 3: Dashboard with unified analytics | 2026-02-04 | Add KPI cards, interactive charts (Recharts), activity heatmap, date range filtering |
| Phase 4: Campaigns, Reports & Workflow Automation | 2026-02-04 | Enable marketing campaigns, report scheduling/CSV export, automation groundwork |
| Phase 5: Admin Panel, Integrations & Polish | 2026-02-04 | Add admin panel (user mgmt, system settings, audit logs), platform polish |
| Monetization system (Stripe + tiers) | 2026-02-08 | Enable SaaS billing: 5 subscription tiers, Stripe checkout, customer portal, feature gating |
| Stripe checkout + Resend email + automation engine | 2026-02-09 | Payment processing, transactional email, rule-based automation with trigger/action pattern |
| Clickable KPI cards + support ticket system | 2026-02-09 | Make dashboard KPIs interactive, add support ticket submission |
| Automation expansion (4 new actions) | 2026-02-09 | Add create_task, update_status, assign_user, send_webhook automation actions |
| Supabase Realtime subscriptions | 2026-02-09 | Live data sync across browser tabs via postgres_changes events |
| Environment variable validation | 2026-02-09 | Startup validation prevents running with missing configuration |
| In-app seed data button | 2026-02-09 | One-click test data population for development/demos |
| Follow-up system (end-to-end) | 2026-02-09 | Persist next_follow_up to DB, overdue alerts, quick-set action |
| Mobile responsive layout | 2026-02-09 | Hamburger menu, slide-in sidebar, responsive padding -- app usable on phones |
| Dashboard follow-up widgets | 2026-02-09 | Proactive alerts: overdue, due-today, stale leads surfaced on dashboard |
| Duplicate detection | 2026-02-09 | Warn when creating a lead that may already exist (fuzzy name + exact email/phone) |
| Next-best-action suggestions | 2026-02-09 | AI-like guided workflow: status-specific action suggestions per lead |
| Stage transition guidance | 2026-02-09 | Prevent accidental status jumps, capture win/loss reasons |
| Zapier & Make integration guide | 2026-02-09 | No-code integration guide with one-click webhook creation |
| CSV import/export | 2026-02-09 | Import leads from CSV (4-step wizard), export filtered leads as CSV |
| Email auto-capture (BCC forwarding) | 2026-02-09 | Unique forwarding address per user, auto-match emails to leads |
| FAQ page in settings | 2026-02-10 | Common questions about features, billing, integrations |
| Slack integration | 2026-02-10 | Webhook-based Slack notifications for CRM events |
| Super admin / org admin role hierarchy | 2026-02-10 | 3-way view toggle for super admins, 2-way for org admins, scoped access |

---

## Bug Fixes

| Change | Date | What It Fixed |
|--------|------|---------------|
| Lead creation flow fix | 2026-02-07 | Lead creation was failing due to Supabase type mismatches |
| Runtime error resolution | 2026-02-07 | Multiple runtime crashes across the app causing blank pages |
| 10 bug fixes (dashboard, activities, navigation) | 2026-02-09 | Dashboard loading spinner stuck, activity creation errors, table row click navigation broken, date formatting inconsistencies, lead score display issues |
| Sidebar navigation links (PR #27) | 2026-02-09 | Campaigns and Reports hidden for some tiers due to incorrect feature gating |
| Dashboard chart warnings (PR #39) | 2026-02-09 | Recharts deprecation warnings, fractional Y-axis ticks, missing KPI comparisons, date filter not persisting |
| UI bugs batch (PR #40, issues #28-#38) | 2026-02-09 | Multiple visual and interaction bugs across the platform |
| CSP dev mode fix (PR #43) | 2026-02-09 | Next.js hot reload broken in dev because CSP blocked unsafe-eval |
| UI clipping issues (PR #43) | 2026-02-09 | Dropdown menus and modals clipped by parent overflow |
| Field name mismatches (PR #51) | 2026-02-09 | Frontend field names didn't match DB columns in campaigns/contacts |
| Null safety in campaigns/contacts (PR #51) | 2026-02-09 | Runtime crashes when optional fields were null |
| Admin mode data refresh (PR #50) | 2026-02-09 | Switching view modes didn't reload data, showing stale results |
| Campaign title truncation (PR #50) | 2026-02-09 | Long campaign titles overflowed card layouts |
| TypeScript errors cleanup (PR #53) | 2026-02-10 | All TS compilation errors resolved, `ignoreBuildErrors` removed |
| Dashboard follow-up tile alignment | 2026-02-10 | Follow-up tiles not aligned with KPI grid |
| E2E test selector stability | 2026-02-10 | Flaky tests due to ambiguous selectors and short timeouts |

---

## Security Fixes

| Change | Date | What It Fixed | Severity |
|--------|------|---------------|----------|
| Privilege escalation via signup metadata (VULN-01) | 2026-02-08 | Users could self-assign admin role at registration | CRITICAL |
| Profile self-modification of role/tier (VULN-02) | 2026-02-08 | Users could update their own role and subscription tier | CRITICAL |
| Insecure random for API keys (VULN-03) | 2026-02-08 | `Math.random()` replaced with `crypto.getRandomValues()` | HIGH |
| JWT-based admin RLS bypass (VULN-05) | 2026-02-08 | RLS checked client-controlled JWT instead of DB role column | HIGH |
| Unvalidated webhook payload injection (VULN-06) | 2026-02-08 | Raw webhook data spread into DB inserts without validation | HIGH |
| Timing-unsafe comparison (VULN-07) | 2026-02-08 | Password hash compared with `===` instead of timing-safe | HIGH |
| Search input injection (VULN-12) | 2026-02-08 | User search interpolated into PostgREST filter unsanitized | MEDIUM |
| Unauthenticated welcome email endpoint | 2026-02-09 | Welcome email API was publicly accessible | HIGH |
| Middleware CSRF fallback | 2026-02-09 | CSRF check silently skipped when headers missing | MEDIUM |
| n8n webhook bypass | 2026-02-09 | Middleware allowed unauthenticated access to n8n routes | MEDIUM |
| Webhook timeout missing | 2026-02-09 | Outbound webhooks could hang indefinitely | MEDIUM |
| Email webhook without signature check | 2026-02-09 | Email inbound webhook accepted requests without signature | MEDIUM |
| RLS policies scoped to user ownership | 2026-02-09 | Businesses/campaigns SELECT was not user-scoped | HIGH |
| DB constraints (email, deal_value, primary contact) | 2026-02-09 | No server-side validation on email format or numeric fields | MEDIUM |
| HSTS + CSP headers added | 2026-02-09 | No transport security or content policy headers | MEDIUM |
| Persistent rate limiting (Supabase RPC) | 2026-02-09 | In-memory rate limiting ineffective across serverless instances | MEDIUM |
| CSP unsafe-eval removed from production | 2026-02-09 | CSP included unsafe-eval in all environments | MEDIUM |
| Service role keys removed from git | 2026-02-10 | Test files with hardcoded service_role keys were tracked | HIGH |
| Super admin RLS policies | 2026-02-10 | Super admins couldn't view/update all profiles | MEDIUM |
| Protected profile columns trigger | 2026-02-10 | Role hierarchy enforced at DB level via trigger | HIGH |

---

## Improvements & Refactoring

| Change | Date | What It Improved |
|--------|------|------------------|
| Supabase types regeneration | 2026-02-09 | Database types with proper `Relationships` -- joins now infer correctly instead of returning `never[]` |
| `@types/papaparse` to devDependencies | 2026-02-09 | Smaller production bundle, correct dependency classification |
| Quick actions tile sizing | 2026-02-09 | Uniform square tiles with proper grid alignment |
| Sidebar nav cleanup | 2026-02-09 | Removed duplicate "Analytics" item, reordered logically |
| Free tier limits tightened | 2026-02-09 | Reduced from 50 to 25 leads, 1 to 0 campaigns -- pushes conversion |
| Pipeline view gated to Starter+ | 2026-02-09 | Kanban board locked for free tier to increase upgrade motivation |
| LeadFlow -> Goldyon rebranding | 2026-02-10 | Consistent branding across all files, logos, and metadata |
| Plan gating for campaigns | 2026-02-09 | Campaign features properly gated by subscription tier |
| Logo additions to dashboard | 2026-02-10 | Brand logos added to dashboard for professional appearance |

---

## Documentation Changes

| Change | Date | What Was Added |
|--------|------|----------------|
| Initial README + SETUP docs | 2026-02-07 | Project overview, tech stack, getting started guide |
| Security audit report | 2026-02-08 | 17 vulnerabilities documented with severity and remediation status |
| CHANGELOG (sprint-by-sprint) | 2026-02-08 | Feature history organized by sprint |
| APP_URL configuration docs | 2026-02-09 | Documented required environment variable |
| HOW-TO guides (admin, billing, leads, webhooks) | 2026-02-10 | User-facing guides for key workflows |
| SECURITY.md | 2026-02-10 | Security policy and reporting procedures |
| CHANGES-SUMMARY.md | 2026-02-27 | This file -- categorized summary of all project changes |
| PRODUCTION-READINESS.md | 2026-02-27 | Comprehensive audit for production deployment |
| CHANGELOG.md updated | 2026-02-27 | Full chronological changelog covering all commits |

---

## E2E Test Coverage

| Test Suite | Date Added | What It Covers |
|------------|-----------|----------------|
| Auth tests | 2026-02-04 | Login, register, forgot password, 2FA |
| Leads CRUD tests | 2026-02-04 | Create, read, update, delete leads |
| Contacts tests | 2026-02-04 | Contact management |
| Activities tests | 2026-02-04 | Activity logging and timeline |
| Dashboard tests | 2026-02-04 | KPI cards, charts |
| Campaigns tests | 2026-02-04 | Campaign lifecycle |
| Automation tests | 2026-02-09 | Rule creation, trigger types, action types |
| Stripe checkout tests | 2026-02-09 | Pricing page, billing, free tier limits |
| Follow-up tests | 2026-02-09 | Form persistence, overdue styling, widgets |
| Mobile responsive tests | 2026-02-09 | Sidebar toggle, hamburger menu, auto-close |
| Duplicate detection tests | 2026-02-09 | Warning for matches, unique names |
| Next-best-action tests | 2026-02-09 | Status-specific suggestions |
| Stage transition tests | 2026-02-09 | Suggested buttons, reason modal |
| CSV import/export tests | 2026-02-09 | Export button, import modal, column mapping |
| Email capture tests | 2026-02-09 | Forwarding address, setup guides |
| Security tests | 2026-02-09 | CSRF protection, RLS enforcement |
| Admin tests | 2026-02-04 | User management, settings, audit logs |
| Settings tests | 2026-02-04 | Profile, webhooks, API keys |

---

## Database Migrations Timeline

| Migration | Date | Purpose |
|-----------|------|---------|
| 0001_profiles.sql | 2026-02-04 | User profiles with role and auto-creation trigger |
| 0002_businesses.sql | 2026-02-04 | Core leads/businesses table (40+ fields) |
| 0003_contacts.sql | 2026-02-04 | Contacts linked to businesses |
| 0004_activities.sql | 2026-02-04 | Activity logging |
| 0005_touchpoints.sql | 2026-02-04 | Customer journey touchpoints |
| 0006_campaigns.sql | 2026-02-04 | Marketing campaigns |
| 0007_automation_rules.sql | 2026-02-04 | Automation rules engine |
| 0008_reports.sql | 2026-02-04 | Report configurations |
| 0009_audit_logs.sql | 2026-02-04 | Audit trail |
| 0010_webhooks.sql | 2026-02-04 | Webhook configurations |
| 0011_api_keys.sql | 2026-02-04 | API key storage |
| 20260208* security fixes | 2026-02-08 | Privilege escalation patches, protected columns trigger |
| 20260209000000_subscription_tier | 2026-02-09 | Subscription tier + billing cycle on profiles |
| 20260209200000_next_follow_up | 2026-02-09 | Follow-up date column on businesses |
| 20260209300000_email_capture | 2026-02-09 | Captured emails table + forwarding address |
| 20260210204145_role_hierarchy | 2026-02-10 | Super admin / org admin roles + RLS policies |
| Rate limiting RPC | 2026-02-09 | `check_rate_limit()` function for persistent rate limiting |
| Analytics snapshots | 2026-02-09 | Daily metrics rollups with unique date constraint |

---

## Pull Request History

| PR | Title | Date Merged |
|----|-------|-------------|
| #11 | Database security and validation | 2026-02-09 |
| #22 | Security and webhook fixes | 2026-02-09 |
| #27 | Sidebar navigation links | 2026-02-09 |
| #39 | Dashboard chart UI bugs | 2026-02-09 |
| #40 | UI bugs and enhancements (#28-#38) | 2026-02-09 |
| #41 | CSP and rate limiting | 2026-02-09 |
| #42 | Persistent rate limiting and hardened CSP | 2026-02-09 |
| #43 | CSP dev mode and UI fixes | 2026-02-09 |
| #50 | Admin mode campaigns cosmetic | 2026-02-09 |
| #51 | Field name mismatches and null safety | 2026-02-09 |
| #52 | Settings FAQ page + rebranding | 2026-02-10 |
| #53 | TypeScript errors cleanup | 2026-02-10 |

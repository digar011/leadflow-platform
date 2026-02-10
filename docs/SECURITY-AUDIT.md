# Goldyon CRM -- Security Audit Report

**Audit Date:** 2026-02-08
**Platform:** Next.js 14 + Supabase + TanStack React Query + Tailwind CSS
**Scope:** Full application -- app/, lib/, components/, middleware, supabase/migrations/

---

## Executive Summary

The Goldyon CRM platform implements several good security practices: Zod validation on all client-side forms, CSRF origin checking in middleware, Row-Level Security enabled on every database table, HMAC webhook signature verification with timing-safe comparison, and API keys stored as SHA-256 hashes.

However, this audit identified **17 distinct vulnerabilities** -- including 2 Critical issues that together allow any anonymous internet user to register an admin account with an enterprise subscription, gaining total control over the platform and bypassing all billing.

**Breakdown:** 2 Critical, 5 High, 6 Medium, 4 Low

### Dependency Vulnerabilities (npm audit)

| Package | Severity | Advisory |
|---------|----------|----------|
| `glob` 10.2.0-10.4.5 | High | Command injection via -c/--cmd (GHSA-5j98-mcp5-4vw2) |
| `next` 10.0.0-15.5.9 | High | DoS via Image Optimizer remotePatterns (GHSA-9g9p-9gw9-jx7f) |
| `next` 10.0.0-15.5.9 | High | HTTP request deserialization DoS (GHSA-h25m-26qc-wcjf) |

**Fix:** `npm audit fix --force` (requires breaking change to next@16 and eslint-config-next@16)

---

## Critical Findings

### VULN-01: Privilege Escalation via Signup Metadata (Self-Assigned Admin Role)

- **File:** `supabase/migrations/0001_profiles.sql`, lines 55-67
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** CRITICAL
- **Status:** FIXED

The `handle_new_user()` trigger reads `role` from client-supplied `raw_user_meta_data`:

```sql
COALESCE(NEW.raw_user_meta_data->>'role', 'user')
```

An attacker can register with `options.data: { role: 'admin' }` to get admin access.

**Fix Applied:** Hardcoded role to `'user'` in the trigger. Added a new migration to patch existing deployments.

### VULN-02: Subscription Tier and Role Self-Modification via Profile Update

- **File:** `supabase/migrations/0001_profiles.sql`, lines 29-32
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** CRITICAL
- **Status:** FIXED

The RLS policy allows users to update ANY column on their own profile row, including `role` and `subscription_tier`.

**Fix Applied:** Added a `BEFORE UPDATE` trigger that prevents user-initiated changes to `role`, `subscription_tier`, and `subscription_billing_cycle` columns (only service_role can modify these).

---

## High Severity Findings

### VULN-03: Insecure Cryptographic Randomness for API Keys and Webhook Secrets

- **File:** `lib/hooks/useApiKeys.ts`, lines 162-169; `lib/hooks/useWebhooks.ts`, lines 298-305
- **OWASP:** A02:2021 -- Cryptographic Failures
- **Severity:** HIGH
- **Status:** FIXED

Both API key and webhook secret generation use `Math.random()` instead of `crypto.getRandomValues()`.

**Fix Applied:** Replaced with `crypto.getRandomValues()` for browser-safe cryptographic randomness.

### VULN-04: Webhook Secrets Stored in Plaintext in Database

- **File:** `supabase/migrations/0010_webhooks.sql`, line 11
- **OWASP:** A02:2021 -- Cryptographic Failures
- **Severity:** HIGH
- **Status:** ACKNOWLEDGED (requires schema migration and application-level changes)

The `webhook_configs` table stores HMAC secrets as plaintext. Should be hashed like API keys.

### VULN-05: Admin RLS Policies Based on JWT User Metadata (Client-Controlled)

- **File:** `supabase/migrations/20260208040000_fix_rls_no_auth_users.sql`, lines 11-21
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** HIGH
- **Status:** FIXED

Admin RLS policies rely on JWT `user_metadata` which is client-controlled at signup. Combined with VULN-01, this creates a full privilege escalation chain.

**Fix Applied:** Changed RLS policies to check the `profiles.role` column (which is now protected by the BEFORE UPDATE trigger from VULN-02 fix).

### VULN-06: Unvalidated Webhook Payload Spread into Database Inserts

- **File:** `app/api/webhooks/n8n/route.ts`, lines 180-248
- **OWASP:** A03:2021 -- Injection
- **Severity:** HIGH
- **Status:** FIXED

The webhook handler spreads raw payload data into Supabase inserts without validation.

**Fix Applied:** Added Zod validation and explicit field allowlisting before database insert.

### VULN-07: Timing-Unsafe Password Comparison

- **File:** `lib/utils/security.ts`, line 129
- **OWASP:** A02:2021 -- Cryptographic Failures
- **Severity:** HIGH
- **Status:** FIXED

Uses `===` instead of `crypto.timingSafeEqual()` for password hash comparison.

**Fix Applied:** Replaced with `crypto.timingSafeEqual()`.

---

## Medium Severity Findings

### VULN-08: Overly Permissive `FOR ALL` RLS Policies

- **Files:** Multiple migration files (0006, 0007, 0008)
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** MEDIUM
- **Status:** ACKNOWLEDGED

`campaign_members`, `scheduled_tasks`, and `landing_pages` tables allow any authenticated user full access.

### VULN-09: `WITH CHECK (true)` INSERT Policies Allow Any Caller

- **Files:** `0010_webhooks.sql`, `0009_audit_logs.sql`
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** MEDIUM
- **Status:** ACKNOWLEDGED

`webhook_deliveries` and `audit_logs` tables allow anyone to insert rows.

### VULN-10: Client-Side-Only Subscription Limit Enforcement

- **File:** `lib/hooks/useGatedMutation.ts`
- **OWASP:** A01:2021 -- Broken Access Control
- **Severity:** MEDIUM
- **Status:** ACKNOWLEDGED (server-side enforcement planned with Stripe integration)

Subscription limits are checked client-side only and can be bypassed. Count query doesn't filter by user_id.

### VULN-11: CSP Header Defined but Never Applied; Includes `unsafe-eval`

- **Files:** `lib/utils/security.ts`, `middleware.ts`
- **OWASP:** A05:2021 -- Security Misconfiguration
- **Severity:** MEDIUM
- **Status:** ACKNOWLEDGED

Content Security Policy is defined but never applied in middleware.

### VULN-12: Search Input Interpolated into PostgREST Filter String

- **File:** `lib/hooks/useLeads.ts`, lines 57-60
- **OWASP:** A03:2021 -- Injection
- **Severity:** MEDIUM
- **Status:** FIXED

User search input interpolated directly into PostgREST filter. `sanitizeSearchInput()` exists but was not used.

**Fix Applied:** Applied `sanitizeSearchInput()` to search input before interpolation.

### VULN-13: In-Memory Rate Limiting (Not Persistent Across Serverless Instances)

- **File:** `app/api/webhooks/n8n/route.ts`
- **OWASP:** A05:2021 -- Security Misconfiguration
- **Severity:** MEDIUM
- **Status:** ACKNOWLEDGED (requires Redis/Upstash for distributed rate limiting)

Rate limiting uses in-memory Map, ineffective in serverless deployments.

---

## Low Severity Findings

### VULN-14: TypeScript and ESLint Errors Suppressed in Production Builds

- **File:** `next.config.mjs`
- **Severity:** LOW
- **Status:** ACKNOWLEDGED

### VULN-15: CSRF Origin Check Silently Skipped When Headers Missing

- **File:** `middleware.ts`
- **Severity:** LOW
- **Status:** ACKNOWLEDGED

### VULN-16: Rate Limiting Trusts Spoofable `x-forwarded-for` Header

- **File:** `app/api/webhooks/n8n/route.ts`
- **Severity:** LOW
- **Status:** ACKNOWLEDGED

### VULN-17: Businesses Table Has No User-Scoped Ownership Column

- **File:** `supabase/migrations/0002_businesses.sql`
- **Severity:** LOW
- **Status:** ACKNOWLEDGED (shared workspace is current design)

---

## Attack Chain Summary

The most severe combined attack path (now patched):

1. Register with `options.data: { role: "admin" }` -- VULN-01 (FIXED)
2. JWT contains admin claim -- passes RLS checks -- VULN-05 (FIXED)
3. Update own profile to `subscription_tier: "enterprise"` -- VULN-02 (FIXED)
4. Full admin + enterprise access with no payment

**This chain is now blocked by the applied fixes.**

---

## E2E Test Results

E2E tests could not run to completion in this audit cycle -- the Playwright web server timed out due to port conflicts (ports 3000-3002 were already in use). Tests should be run in a clean environment with:

```bash
npx playwright test --project=chromium
```

Test files available: auth, leads, contacts, activities, dashboard, campaigns, automation, reports, admin, settings, webhooks (11 test suites).

---

## Remediation Priority

1. **Immediate:** VULN-01, VULN-02, VULN-05 (privilege escalation chain) -- DONE
2. **Urgent:** VULN-03, VULN-06, VULN-07, VULN-12 (crypto + injection) -- DONE
3. **Short-term:** VULN-04, VULN-08, VULN-09, VULN-10, VULN-11, VULN-13
4. **Planned:** VULN-14, VULN-15, VULN-16, VULN-17

/**
 * Validate environment variables at startup.
 * Required vars throw; recommended vars warn.
 *
 * For a standalone validation script, see: scripts/validate-env.mjs
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
  ];

  const recommended = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "STRIPE_PRICE_STARTER_MONTHLY",
    "STRIPE_PRICE_STARTER_ANNUAL",
    "STRIPE_PRICE_GROWTH_MONTHLY",
    "STRIPE_PRICE_GROWTH_ANNUAL",
    "STRIPE_PRICE_BUSINESS_MONTHLY",
    "STRIPE_PRICE_BUSINESS_ANNUAL",
  ];

  const missing = required.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Check your .env.local file or run: node scripts/validate-env.mjs"
    );
  }

  const warnings = recommended.filter((v) => !process.env[v]);
  if (warnings.length > 0) {
    console.warn(
      `[env] Missing optional env vars (some features disabled): ${warnings.join(", ")}`
    );
  }
}

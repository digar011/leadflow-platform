/**
 * Validate environment variables at startup.
 * Required vars throw; recommended vars warn.
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const recommended = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
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
        "Check your .env.local file."
    );
  }

  const warnings = recommended.filter((v) => !process.env[v]);
  if (warnings.length > 0) {
    console.warn(
      `[env] Missing optional env vars (some features disabled): ${warnings.join(", ")}`
    );
  }
}

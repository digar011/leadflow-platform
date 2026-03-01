import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring: sample 20% of transactions
  tracesSampleRate: 0.2,

  environment: process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
    ? "development"
    : "production",
});

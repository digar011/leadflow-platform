import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring: sample 20% of transactions
  tracesSampleRate: 0.2,

  // Session replay: capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out noisy/irrelevant errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    // Network errors users cause by navigating away
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    "AbortError",
    // React hydration mismatches (benign in most cases)
    "Hydration failed",
    "Text content does not match",
  ],

  environment: process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
    ? "development"
    : "production",
});

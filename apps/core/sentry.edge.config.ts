import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.APP_VERSION || "1.0.0",

  // Disable in development by default
  enabled: process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,
});

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.APP_VERSION || "1.0.0",

  // Server-side specific settings
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
    }

    return event;
  },

  // Disable in development by default
  enabled: process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,
});

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone mod Windows'ta symlink sorunu yaşatıyor, sunucuda aktif edilecek
  output: process.platform === "win32" ? undefined : "standalone",
  transpilePackages: ["@hyble/ui", "@hyble/api", "@hyble/db", "@hyble/email"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

// Sentry configuration
const sentryConfig = {
  // Suppress source maps upload in CI when no auth token
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Organization and project
  org: process.env.SENTRY_ORG || "hyble",
  project: process.env.SENTRY_PROJECT || "hyble-core",

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Transpile SDK to be compatible with IE11
  transpileClientSDK: false,

  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: "/monitoring",

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Disable logger
  disableLogger: true,

  // Automatically tree-shake Sentry logger statements
  automaticVercelMonitors: true,
};

// Only wrap with Sentry if DSN is configured
const finalConfig = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;

export default finalConfig;

import { createTRPCRouter } from "../trpc/trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { securityRouter } from "./security";
import { organizationRouter } from "./organization";
import { adminRouter } from "./admin";
import { apiKeyRouter } from "./apikey";
import { walletRouter } from "./wallet";
import { pimRouter } from "./pim";
import { paymentRouter } from "./payment";
import { invoiceRouter } from "./invoice";
import { cartRouter } from "./cart";
import { voucherRouter } from "./voucher";
import { subscriptionRouter } from "./subscription";
import { notificationRouter } from "./notification";
import { supportRouter } from "./support";
import { statusRouter } from "./status";
import { emailRouter } from "./email";
import { downloadRouter } from "./download";
import { licenseRouter } from "./license";

// Store Features (Single Vendor)
import { reviewRouter } from "./review";

// Hosting & Website Builder
import { websiteRouter } from "./website";
import { siteBuilderRouter, formBuilderRouter, crmRouter } from "./sitebuilder";
import { aiRouter } from "./ai";
import { storeRouter } from "./store";
import { seoRouter } from "./seo";
import { performanceRouter } from "./performance";

// Analytics
import { analyticsRouter } from "./analytics";

// File Upload
import { uploadRouter } from "./upload";

/**
 * Main tRPC router for hyble-panel
 * All routers are combined here
 *
 * Note: This is a single-vendor store, not a marketplace.
 * All products are sold by the platform owner.
 */
export const appRouter = createTRPCRouter({
  // Core
  auth: authRouter,
  user: userRouter,
  security: securityRouter,
  organization: organizationRouter,
  admin: adminRouter,
  apiKey: apiKeyRouter,
  wallet: walletRouter,

  // E-Commerce (Single Vendor)
  pim: pimRouter,
  payment: paymentRouter,
  invoice: invoiceRouter,
  cart: cartRouter,
  voucher: voucherRouter,
  subscription: subscriptionRouter,

  // Communication
  notification: notificationRouter,
  support: supportRouter,
  status: statusRouter,
  email: emailRouter,

  // Digital Products
  download: downloadRouter,
  license: licenseRouter,

  // Store Features
  review: reviewRouter,

  // Hosting & Website Builder
  website: websiteRouter,
  siteBuilder: siteBuilderRouter,
  formBuilder: formBuilderRouter,
  crm: crmRouter,
  ai: aiRouter,
  store: storeRouter,
  seo: seoRouter,
  performance: performanceRouter,

  // Analytics
  analytics: analyticsRouter,

  // File Upload
  upload: uploadRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;

// Re-export individual routers for direct access if needed
export {
  // Core
  authRouter,
  userRouter,
  securityRouter,
  organizationRouter,
  adminRouter,
  apiKeyRouter,
  walletRouter,

  // E-Commerce
  pimRouter,
  paymentRouter,
  invoiceRouter,
  cartRouter,
  voucherRouter,
  subscriptionRouter,

  // Communication
  notificationRouter,
  supportRouter,
  statusRouter,
  emailRouter,

  // Digital Products
  downloadRouter,
  licenseRouter,

  // Store Features
  reviewRouter,

  // Hosting & Website Builder
  websiteRouter,
  siteBuilderRouter,
  formBuilderRouter,
  crmRouter,
  aiRouter,
  storeRouter,
  seoRouter,
  performanceRouter,

  // Analytics
  analyticsRouter,

  // File Upload
  uploadRouter,
};

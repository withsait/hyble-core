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

// HybleBilling Core
import { billingRouter } from "./billing";

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

// Sales & Growth
import { leadRouter } from "./lead";
import { referralRouter } from "./referral";
import { npsRouter } from "./nps";

// Template Store
import { templateRouter } from "./template";

// Blog
import { blogRouter } from "./blog";

// Settings
import { settingsRouter } from "./settings";

// Order Management
import { orderRouter } from "./order";

// CMS
import { cmsRouter } from "./cms";

// Product Media Management
import { productMediaRouter } from "./product-media";

// AI Assistant & Wizard
import { hylaRouter } from "./hyla";
import { wizardRouter } from "./wizard";
import { adminDashboardRouter } from "./admin-dashboard";

// Funnel & Cart Analytics
import { funnelRouter } from "./funnel";

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

  // HybleBilling Core (New modular billing system)
  billing: billingRouter,

  // E-Commerce (Single Vendor) - Legacy routers
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

  // Sales & Growth
  lead: leadRouter,
  referral: referralRouter,
  nps: npsRouter,

  // Template Store
  template: templateRouter,

  // Blog
  blog: blogRouter,

  // Settings
  settings: settingsRouter,

  // Order Management
  order: orderRouter,

  // CMS
  cms: cmsRouter,

  // Product Media Management
  productMedia: productMediaRouter,

  // AI Assistant & Wizard
  hyla: hylaRouter,
  wizard: wizardRouter,
  adminDashboard: adminDashboardRouter,

  // Funnel & Cart Analytics
  funnel: funnelRouter,
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

  // HybleBilling
  billingRouter,

  // E-Commerce (Legacy)
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

  // Sales & Growth
  leadRouter,
  referralRouter,
  npsRouter,

  // Template Store
  templateRouter,

  // Blog
  blogRouter,

  // Settings
  settingsRouter,

  // Order Management
  orderRouter,

  // CMS
  cmsRouter,

  // Product Media
  productMediaRouter,

  // AI Assistant & Wizard
  hylaRouter,
  wizardRouter,
  adminDashboardRouter,

  // Funnel & Cart Analytics
  funnelRouter,
};

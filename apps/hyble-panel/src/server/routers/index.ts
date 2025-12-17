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

/**
 * Main tRPC router for hyble-panel
 * All routers are combined here
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  security: securityRouter,
  organization: organizationRouter,
  admin: adminRouter,
  apiKey: apiKeyRouter,
  wallet: walletRouter,
  pim: pimRouter,
  payment: paymentRouter,
  invoice: invoiceRouter,
  cart: cartRouter,
  voucher: voucherRouter,
  subscription: subscriptionRouter,
  notification: notificationRouter,
  support: supportRouter,
  status: statusRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;

// Re-export individual routers for direct access if needed
export {
  authRouter,
  userRouter,
  securityRouter,
  organizationRouter,
  adminRouter,
  apiKeyRouter,
  walletRouter,
  pimRouter,
  paymentRouter,
  invoiceRouter,
  cartRouter,
  voucherRouter,
  subscriptionRouter,
  notificationRouter,
  supportRouter,
  statusRouter,
};

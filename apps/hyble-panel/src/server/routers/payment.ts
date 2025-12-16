import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";

export const paymentRouter = createTRPCRouter({
  listMethods: protectedProcedure.query(async () => {
    // TODO: Implement saved payment methods
    return [];
  }),

  payWithWallet: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement wallet payment
      return { success: true };
    }),

  createCheckout: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      amount: z.number(),
      useWalletBalance: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement Stripe checkout
      return { url: null };
    }),

  chargeCard: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      cardId: z.string(),
      amount: z.number(),
      useWalletBalance: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement card charge
      return { success: true };
    }),
});

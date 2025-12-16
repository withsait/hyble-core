import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";

export const voucherRouter = createTRPCRouter({
  validate: protectedProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement voucher validation
      return {
        valid: false,
        message: "Geçersiz kupon kodu",
        amount: 0,
        type: "PROMO",
      };
    }),

  redeem: protectedProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement voucher redemption
      return { success: true, amount: 0 };
    }),
});

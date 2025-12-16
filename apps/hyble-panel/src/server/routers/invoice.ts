import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";

export const invoiceRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Implement invoice list
      return {
        invoices: [],
        totalPages: 0,
        total: 0,
      };
    }),

  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // TODO: Implement invoice detail - return stub data for now
      return {
        id: input.id,
        number: "INV-0000",
        status: "PENDING" as "DRAFT" | "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED",
        total: 0,
        subtotal: 0,
        taxAmount: 0,
        taxRate: 20,
        discount: 0,
        currency: "EUR",
        dueDate: new Date(),
        createdAt: new Date(),
        paidAt: null as Date | null,
        items: [] as Array<{ name: string; description?: string; quantity: number; unitPrice: number; total: number }>,
        billingName: null as string | null,
        billingAddress: null as { line1: string; line2?: string; city: string; postalCode: string; country: string } | null,
        user: { name: ctx.user.name, email: ctx.user.email },
      };
    }),

  downloadPDF: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement PDF generation
      return { url: null };
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-11-17.clover",
    });
  }
  return stripe;
}

// Helper function to get or create wallet
async function getOrCreateWallet(userId: string, currency: string = "EUR") {
  let wallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, currency, balance: 0 },
    });
  }

  return wallet;
}

// Helper function to get or create Stripe customer
async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  let stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (!stripeCustomer) {
    const customer = await getStripe().customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    });

    stripeCustomer = await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
      },
    });
  }

  return stripeCustomer;
}

export const walletRouter = createTRPCRouter({
  // Get wallet balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const wallet = await getOrCreateWallet(ctx.user.id);
    const balance = parseFloat(wallet.balance.toString());
    return {
      balance: wallet.balance.toString(),
      currency: wallet.currency,
      // Extended balance fields (for FAZ2)
      mainBalance: balance,
      bonusBalance: 0,
      promoBalance: 0,
    };
  }),

  // Get transaction history
  getTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        type: z.enum(["DEPOSIT", "CHARGE", "REFUND", "ADJUSTMENT", "BONUS"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);

      const transactions = await prisma.transaction.findMany({
        where: {
          walletId: wallet.id,
          ...(input.type && { type: input.type }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (transactions.length > input.limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          status: tx.status,
          amount: tx.amount.toString(),
          currency: tx.currency,
          description: tx.description,
          reference: tx.reference,
          paymentMethod: tx.paymentMethod,
          invoiceNumber: tx.invoice?.invoiceNumber,
          createdAt: tx.createdAt,
        })),
        nextCursor,
      };
    }),

  // Create Stripe checkout session for deposit
  createDepositSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(5).max(10000), // Min €5, Max €10,000
        currency: z.string().default("EUR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create Stripe customer
      const stripeCustomer = await getOrCreateStripeCustomer(
        ctx.user.id,
        ctx.user.email,
        ctx.user.name
      );

      // Create checkout session
      const session = await getStripe().checkout.sessions.create({
        customer: stripeCustomer.stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: "Cüzdan Yükleme",
                description: `Hyble cüzdanınıza ${input.amount} ${input.currency} yükleme`,
              },
              unit_amount: Math.round(input.amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co"}/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co"}/wallet?cancelled=true`,
        metadata: {
          userId: ctx.user.id,
          type: "DEPOSIT",
          amount: input.amount.toString(),
          currency: input.currency,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Verify payment and add to wallet (called after Stripe webhook)
  verifyDeposit: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        return { success: false, message: "Ödeme henüz tamamlanmadı" };
      }

      // Check if this session was already processed
      const existingTx = await prisma.transaction.findFirst({
        where: { reference: session.id },
      });

      if (existingTx) {
        return {
          success: true,
          message: "Ödeme zaten işlendi",
          transactionId: existingTx.id,
        };
      }

      // This should normally be handled by webhook, but as fallback:
      const amount = (session.amount_total || 0) / 100;
      const currency = session.currency?.toUpperCase() || "EUR";
      const wallet = await getOrCreateWallet(ctx.user.id, currency);

      const newBalance = wallet.balance.add(new Prisma.Decimal(amount));

      // Create transaction and update wallet in a transaction
      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "DEPOSIT",
            status: "COMPLETED",
            amount: amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency,
            description: `Cüzdan yükleme - ${amount} ${currency}`,
            reference: session.id,
            paymentMethod: "STRIPE",
            metadata: {
              stripeSessionId: session.id,
              stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        }),
      ]);

      return {
        success: true,
        message: "Ödeme başarıyla işlendi",
        transactionId: transaction.id,
        newBalance: newBalance.toString(),
      };
    }),

  // Get invoices
  getInvoices: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const invoices = await prisma.invoice.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.status && { status: input.status }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (invoices.length > input.limit) {
        const nextItem = invoices.pop();
        nextCursor = nextItem?.id;
      }

      return {
        invoices: invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          total: inv.total.toString(),
          currency: inv.currency,
          dueDate: inv.dueDate,
          paidAt: inv.paidAt,
          createdAt: inv.createdAt,
        })),
        nextCursor,
      };
    }),

  // Get single invoice
  getInvoice: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura bulunamadı",
        });
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        subtotal: invoice.subtotal.toString(),
        taxRate: invoice.taxRate.toString(),
        taxAmount: invoice.taxAmount.toString(),
        total: invoice.total.toString(),
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        notes: invoice.notes,
        billingAddress: invoice.billingAddress,
        items: invoice.items,
        createdAt: invoice.createdAt,
      };
    }),

  // Admin: Add manual credit
  adminAddCredit: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().min(0.01),
        currency: z.string().default("EUR"),
        description: z.string(),
        type: z.enum(["ADJUSTMENT", "BONUS", "REFUND"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(input.userId, input.currency);
      const newBalance = wallet.balance.add(new Prisma.Decimal(input.amount));

      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: input.type,
            status: "COMPLETED",
            amount: input.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency: input.currency,
            description: input.description,
            paymentMethod: "MANUAL",
            metadata: {
              adminId: ctx.user.id,
              adminEmail: ctx.user.email,
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        }),
      ]);

      return {
        success: true,
        transactionId: transaction.id,
        newBalance: newBalance.toString(),
      };
    }),

  // Admin: Deduct from wallet (for charges)
  adminDeductCredit: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().min(0.01),
        currency: z.string().default("EUR"),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(input.userId, input.currency);

      if (wallet.balance.lessThan(input.amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yetersiz bakiye",
        });
      }

      const newBalance = wallet.balance.sub(new Prisma.Decimal(input.amount));

      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "CHARGE",
            status: "COMPLETED",
            amount: input.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency: input.currency,
            description: input.description,
            paymentMethod: "MANUAL",
            metadata: {
              adminId: ctx.user.id,
              adminEmail: ctx.user.email,
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        }),
      ]);

      return {
        success: true,
        transactionId: transaction.id,
        newBalance: newBalance.toString(),
      };
    }),
});

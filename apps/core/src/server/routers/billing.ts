// HybleBilling tRPC Router
// Bu router apps/core/src/lib/billing servislerini kullanır

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import {
  customerService,
  invoiceService,
  paymentService,
  walletService,
  subscriptionService,
  taxService,
  couponService,
} from "@/lib/billing";

// ==================== CUSTOMER ROUTER ====================

const customerRouter = createTRPCRouter({
  // Get current user's billing customer
  me: protectedProcedure.query(async ({ ctx }) => {
    const customer = await customerService.getByUserId(ctx.user.id);
    if (!customer) {
      return null;
    }
    return customer;
  }),

  // Create billing customer for current user
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        companyName: z.string().optional(),
        taxId: z.string().optional(),
        vatNumber: z.string().optional(),
        currencyCode: z.enum(["EUR", "TRY", "USD", "GBP"]).optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await customerService.getByUserId(ctx.user.id);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Billing customer already exists",
        });
      }

      return customerService.create({
        userId: ctx.user.id,
        email: input.email || ctx.user.email,
        firstName: input.firstName,
        lastName: input.lastName,
        companyName: input.companyName,
        taxId: input.taxId,
        vatNumber: input.vatNumber,
        currencyCode: input.currencyCode,
        country: input.country,
      });
    }),

  // Update billing customer
  update: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        companyName: z.string().optional(),
        taxId: z.string().optional(),
        vatNumber: z.string().optional(),
        currencyCode: z.enum(["EUR", "TRY", "USD", "GBP"]).optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing customer not found",
        });
      }

      return customerService.update(customer.id, input);
    }),

  // Get addresses
  addresses: protectedProcedure.query(async ({ ctx }) => {
    const customer = await customerService.getByUserId(ctx.user.id);
    if (!customer) return [];
    return customerService.getAddresses(customer.id);
  }),

  // Add address
  addAddress: protectedProcedure
    .input(
      z.object({
        type: z.enum(["billing", "shipping"]).default("billing"),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing customer not found",
        });
      }

      return customerService.addAddress(customer.id, input);
    }),

  // Get stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const customer = await customerService.getByUserId(ctx.user.id);
    if (!customer) {
      return {
        totalInvoices: 0,
        totalSpent: 0,
        totalPaid: 0,
        activeServices: 0,
        walletBalance: 0,
        promoBalance: 0,
      };
    }
    return customerService.getStats(customer.id);
  }),

  // Admin: List all customers
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED", "PENDING"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return customerService.list(input);
    }),
});

// ==================== INVOICE ROUTER ====================

const billingInvoiceRouter = createTRPCRouter({
  // List user's invoices
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["DRAFT", "PENDING", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { items: [], total: 0, hasMore: false };
      }
      return invoiceService.list({ ...input, customerId: customer.id });
    }),

  // Get invoice by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await invoiceService.getById(input.id);
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Verify ownership
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer || invoice.customerId !== customer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return invoice;
    }),

  // Admin: Create invoice
  adminCreate: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().positive(),
            taxable: z.boolean().default(true),
            serviceId: z.string().optional(),
          })
        ),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return invoiceService.create(input);
    }),

  // Admin: List all invoices
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        customerId: z.string().optional(),
        status: z.enum(["DRAFT", "PENDING", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return invoiceService.list(input);
    }),

  // Admin: Update status
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["DRAFT", "PENDING", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED", "REFUNDED"]),
      })
    )
    .mutation(async ({ input }) => {
      return invoiceService.updateStatus(input.id, input.status);
    }),

  // Admin: Cancel invoice
  adminCancel: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return invoiceService.cancel(input.id, input.reason);
    }),

  // Admin: Get stats
  adminStats: adminProcedure.query(async () => {
    return invoiceService.getStats();
  }),
});

// ==================== PAYMENT ROUTER ====================

const billingPaymentRouter = createTRPCRouter({
  // Process payment for invoice
  pay: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PAYPAL", "WALLET", "MANUAL", "IYZICO"]),
        gatewayId: z.string().optional(),
        paymentTokenId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify invoice belongs to user
      const invoice = await invoiceService.getById(input.invoiceId);
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer || invoice.customerId !== customer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return paymentService.processPayment(input);
    }),

  // List user's payments
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { items: [], total: 0, hasMore: false };
      }
      return paymentService.list({ ...input, customerId: customer.id });
    }),

  // Admin: List all payments
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        customerId: z.string().optional(),
        invoiceId: z.string().optional(),
        status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return paymentService.list(input);
    }),

  // Admin: Record manual payment
  adminRecordManual: adminProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return paymentService.recordManualPayment(
        input.invoiceId,
        input.amount,
        input.notes,
        ctx.user.id
      );
    }),

  // Admin: Process refund
  adminRefund: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        amount: z.number().positive(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return paymentService.refund({
        ...input,
        processedBy: ctx.user.id,
      });
    }),

  // Admin: Get stats
  adminStats: adminProcedure.query(async () => {
    return paymentService.getStats();
  }),
});

// ==================== WALLET ROUTER ====================

const billingWalletRouter = createTRPCRouter({
  // Get balance
  balance: protectedProcedure.query(async ({ ctx }) => {
    const customer = await customerService.getByUserId(ctx.user.id);
    if (!customer) {
      return { balance: 0, promoBalance: 0, totalBalance: 0 };
    }
    return walletService.getBalance(customer.id);
  }),

  // Create deposit checkout session (Stripe)
  createDepositSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(5).max(10000),
        currency: z.enum(["EUR", "TRY", "USD", "GBP"]).default("EUR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment gateway not configured",
        });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // Get or create billing customer
      let customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        customer = await customerService.create({
          userId: ctx.user.id,
          email: ctx.user.email,
          firstName: ctx.user.name?.split(" ")[0] || "User",
          lastName: ctx.user.name?.split(" ").slice(1).join(" ") || "",
          currencyCode: input.currency,
        });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: ctx.user.email,
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: "Hyble Credits",
                description: `${input.amount} ${input.currency} cüzdan yüklemesi`,
              },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_CONSOLE_URL || "https://console.hyble.co"}/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_CONSOLE_URL || "https://console.hyble.co"}/wallet?cancelled=true`,
        metadata: {
          userId: ctx.user.id,
          customerId: customer.id,
          type: "wallet_deposit",
          amount: input.amount.toString(),
          currency: input.currency,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Verify deposit after Stripe checkout
  verifyDeposit: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment gateway not configured",
        });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        return { success: false, message: "Ödeme henüz tamamlanmadı" };
      }

      // Check if already processed
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { success: false, message: "Müşteri bulunamadı" };
      }

      // Use database transaction with unique constraint check to prevent race condition
      try {
        const amount = (session.amount_total || 0) / 100;

        // Try to add credits with unique reference - will fail if already exists
        const result = await walletService.credit(customer.id, {
          amount,
          type: "CREDIT",
          description: `Stripe ile cüzdan yüklemesi`,
          referenceType: "StripeCheckout",
          referenceId: input.sessionId,
        });

        if (!result) {
          return { success: true, message: "Ödeme zaten işlendi", alreadyProcessed: true };
        }

        return {
          success: true,
          message: "Ödeme başarıyla işlendi",
          amount,
        };
      } catch (error: unknown) {
        // Check if it's a unique constraint violation (P2002 in Prisma)
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
          return { success: true, message: "Ödeme zaten işlendi", alreadyProcessed: true };
        }
        throw error;
      }
    }),

  // Get transactions
  transactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.enum(["CREDIT", "DEBIT", "REFUND", "PROMO", "ADJUSTMENT"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { items: [], total: 0, hasMore: false };
      }
      return walletService.getTransactions(customer.id, input);
    }),

  // Get credit packages
  packages: protectedProcedure.query(async () => {
    return walletService.getCreditPackages();
  }),

  // Purchase credits
  purchaseCredits: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
        paymentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing customer not found. Please create one first.",
        });
      }
      return walletService.purchaseCredits(customer.id, input.packageId, input.paymentId);
    }),

  // Configure auto top-up
  configureAutoTopUp: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        amount: z.number().positive().optional(),
        threshold: z.number().positive().optional(),
        paymentTokenId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing customer not found",
        });
      }
      return walletService.configureAutoTopUp(customer.id, input);
    }),

  // Admin: Adjust balance
  adminAdjust: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        amount: z.number(), // Can be negative
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return walletService.adminAdjust(
        input.customerId,
        input.amount,
        input.reason,
        ctx.user.id
      );
    }),

  // Admin: Get stats
  adminStats: adminProcedure.query(async () => {
    return walletService.getStats();
  }),
});

// ==================== SUBSCRIPTION ROUTER ====================

const billingSubscriptionRouter = createTRPCRouter({
  // List user's subscriptions
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { items: [], total: 0, hasMore: false };
      }
      return subscriptionService.list({ ...input, customerId: customer.id });
    }),

  // Get subscription by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = await subscriptionService.getById(input.id);
      if (!service) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer || service.customerId !== customer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return service;
    }),

  // Cancel subscription
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
        immediate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = await subscriptionService.getById(input.id);
      if (!service) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer || service.customerId !== customer.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return subscriptionService.cancel(input.id, input.reason, input.immediate);
    }),

  // Admin: Create subscription
  adminCreate: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        productId: z.string(),
        billingCycle: z.enum([
          "ONE_TIME",
          "MONTHLY",
          "QUARTERLY",
          "SEMI_ANNUALLY",
          "ANNUALLY",
          "BIENNIALLY",
          "TRIENNIALLY",
        ]),
        startDate: z.date().optional(),
        configOptions: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return subscriptionService.create(input);
    }),

  // Admin: List all subscriptions
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        customerId: z.string().optional(),
        status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED", "CANCELLED"]).optional(),
        vertical: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return subscriptionService.list(input);
    }),

  // Admin: Suspend subscription
  adminSuspend: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return subscriptionService.suspend(input.id, input.reason);
    }),

  // Admin: Reactivate subscription
  adminReactivate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return subscriptionService.reactivate(input.id);
    }),

  // Admin: Get stats
  adminStats: adminProcedure.query(async () => {
    return subscriptionService.getStats();
  }),
});

// ==================== COUPON ROUTER ====================

const billingCouponRouter = createTRPCRouter({
  // Validate coupon
  validate: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        productIds: z.array(z.string()).optional(),
        subtotal: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      if (!customer) {
        return { valid: false, error: "Billing customer not found" };
      }
      return couponService.validate({
        ...input,
        customerId: customer.id,
      });
    }),

  // Admin: Create coupon
  adminCreate: adminProcedure
    .input(
      z.object({
        code: z.string().min(3),
        description: z.string().optional(),
        type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
        value: z.number().positive(),
        minOrderAmount: z.number().positive().optional(),
        maxDiscount: z.number().positive().optional(),
        usageLimit: z.number().positive().optional(),
        usagePerUser: z.number().positive().default(1),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        productIds: z.array(z.string()).optional(),
        campaign: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return couponService.create({
        ...input,
        createdBy: ctx.user.id,
      });
    }),

  // Admin: List coupons
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "DEPLETED"]).optional(),
        type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]).optional(),
        search: z.string().optional(),
        campaign: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return couponService.list(input);
    }),

  // Admin: Update coupon status
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "DEPLETED"]),
      })
    )
    .mutation(async ({ input }) => {
      return couponService.updateStatus(input.id, input.status);
    }),

  // Admin: Get stats
  adminStats: adminProcedure.query(async () => {
    return couponService.getStats();
  }),
});

// ==================== TAX ROUTER ====================

const billingTaxRouter = createTRPCRouter({
  // Calculate tax
  calculate: protectedProcedure
    .input(
      z.object({
        subtotal: z.number().positive(),
        country: z.string(),
        state: z.string().optional(),
        vatNumber: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await customerService.getByUserId(ctx.user.id);
      const isExempt = customer?.taxExempt ?? false;

      return taxService.calculate({
        ...input,
        isExempt,
      });
    }),

  // Admin: List tax rules
  adminListRules: adminProcedure
    .input(z.object({ country: z.string().optional() }))
    .query(async ({ input }) => {
      return taxService.getTaxRules(input.country);
    }),

  // Admin: Create tax rule
  adminCreateRule: adminProcedure
    .input(
      z.object({
        name: z.string(),
        country: z.string().optional(),
        state: z.string().optional(),
        rate: z.number().min(0).max(100),
        isInclusive: z.boolean().default(false),
        isCompound: z.boolean().default(false),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return taxService.createTaxRule(input);
    }),

  // Admin: Update tax rule
  adminUpdateRule: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        rate: z.number().min(0).max(100).optional(),
        isInclusive: z.boolean().optional(),
        isCompound: z.boolean().optional(),
        priority: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return taxService.updateTaxRule(id, data);
    }),

  // Admin: Delete tax rule
  adminDeleteRule: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return taxService.deleteTaxRule(input.id);
    }),
});

// ==================== MAIN BILLING ROUTER ====================

export const billingRouter = createTRPCRouter({
  customer: customerRouter,
  invoice: billingInvoiceRouter,
  payment: billingPaymentRouter,
  wallet: billingWalletRouter,
  subscription: billingSubscriptionRouter,
  coupon: billingCouponRouter,
  tax: billingTaxRouter,
});

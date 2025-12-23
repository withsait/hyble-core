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
      data: {
        userId,
        currency,
        balance: 0,
        mainBalance: 0,
        bonusBalance: 0,
        promoBalance: 0,
      },
    });
  }

  return wallet;
}

// Helper: Bakiye harcama (Promo → Bonus → Main sırası)
// Returns: { success, spent: { promo, bonus, main }, transactions: Transaction[] }
type SpendResult = {
  success: boolean;
  spent: { promo: number; bonus: number; main: number };
  remaining: number;
  transactions: Array<{
    amount: number;
    balanceType: "PROMO" | "BONUS" | "MAIN";
  }>;
};

async function calculateSpendBreakdown(
  wallet: { promoBalance: Prisma.Decimal; bonusBalance: Prisma.Decimal; mainBalance: Prisma.Decimal; balance: Prisma.Decimal },
  amount: number
): Promise<SpendResult> {
  let remaining = amount;
  const spent = { promo: 0, bonus: 0, main: 0 };
  const transactions: SpendResult["transactions"] = [];

  // 1. Önce Promo bakiyeden düş
  const promoBalance = parseFloat(wallet.promoBalance.toString());
  if (promoBalance > 0 && remaining > 0) {
    const promoSpend = Math.min(promoBalance, remaining);
    spent.promo = promoSpend;
    remaining -= promoSpend;
    transactions.push({ amount: promoSpend, balanceType: "PROMO" });
  }

  // 2. Sonra Bonus bakiyeden düş
  const bonusBalance = parseFloat(wallet.bonusBalance.toString());
  if (bonusBalance > 0 && remaining > 0) {
    const bonusSpend = Math.min(bonusBalance, remaining);
    spent.bonus = bonusSpend;
    remaining -= bonusSpend;
    transactions.push({ amount: bonusSpend, balanceType: "BONUS" });
  }

  // 3. Son olarak Main bakiyeden düş
  const mainBalance = parseFloat(wallet.mainBalance.toString());
  if (mainBalance > 0 && remaining > 0) {
    const mainSpend = Math.min(mainBalance, remaining);
    spent.main = mainSpend;
    remaining -= mainSpend;
    transactions.push({ amount: mainSpend, balanceType: "MAIN" });
  }

  return {
    success: remaining === 0,
    spent,
    remaining,
    transactions,
  };
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
    return {
      balance: wallet.balance.toString(),
      currency: wallet.currency,
      mainBalance: parseFloat(wallet.mainBalance.toString()),
      bonusBalance: parseFloat(wallet.bonusBalance.toString()),
      promoBalance: parseFloat(wallet.promoBalance.toString()),
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

      const amountDecimal = new Prisma.Decimal(amount);
      const newMainBalance = wallet.mainBalance.add(amountDecimal);
      const newTotalBalance = wallet.balance.add(amountDecimal);

      // Create transaction and update wallet in a transaction
      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "DEPOSIT",
            status: "COMPLETED",
            amount: amount,
            balanceBefore: wallet.balance,
            balanceAfter: newTotalBalance,
            currency,
            description: `Cüzdan yükleme - ${amount} ${currency}`,
            reference: session.id,
            balanceType: "MAIN",
            paymentMethod: "STRIPE",
            metadata: {
              stripeSessionId: session.id,
              stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newTotalBalance,
            mainBalance: newMainBalance,
          },
        }),
      ]);

      return {
        success: true,
        message: "Ödeme başarıyla işlendi",
        transactionId: transaction.id,
        newBalance: newTotalBalance.toString(),
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

  // Admin: Add credit to specific balance type (MAIN, BONUS, PROMO)
  adminAddTypedCredit: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().min(0.01),
        currency: z.string().default("EUR"),
        balanceType: z.enum(["MAIN", "BONUS", "PROMO"]),
        description: z.string(),
        expiresAt: z.date().optional(), // Bonus/Promo için son kullanma tarihi
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(input.userId, input.currency);
      const amountDecimal = new Prisma.Decimal(input.amount);

      // Hangi bakiye güncelleneceğini belirle
      const balanceField = {
        MAIN: "mainBalance",
        BONUS: "bonusBalance",
        PROMO: "promoBalance",
      }[input.balanceType] as "mainBalance" | "bonusBalance" | "promoBalance";

      const currentTypedBalance = wallet[balanceField];
      const newTypedBalance = currentTypedBalance.add(amountDecimal);
      const newTotalBalance = wallet.balance.add(amountDecimal);

      const transactionType = input.balanceType === "MAIN" ? "DEPOSIT" : "BONUS";

      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: transactionType,
            status: "COMPLETED",
            amount: input.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newTotalBalance,
            currency: input.currency,
            description: input.description,
            balanceType: input.balanceType,
            paymentMethod: "MANUAL",
            metadata: {
              adminId: ctx.user.id,
              adminEmail: ctx.user.email,
              balanceType: input.balanceType,
              expiresAt: input.expiresAt?.toISOString(),
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newTotalBalance,
            [balanceField]: newTypedBalance,
          },
        }),
      ]);

      return {
        success: true,
        transactionId: transaction.id,
        newBalance: newTotalBalance.toString(),
        balanceType: input.balanceType,
        newTypedBalance: newTypedBalance.toString(),
      };
    }),

  // Spend from wallet (Promo → Bonus → Main priority)
  // This is used internally for payments
  spend: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01),
        currency: z.string().default("EUR"),
        description: z.string(),
        reference: z.string().optional(), // Order ID, Invoice ID etc.
        orderId: z.string().optional(),
        invoiceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(ctx.user.id, input.currency);
      const totalBalance = parseFloat(wallet.balance.toString());

      // Toplam bakiye yeterli mi?
      if (totalBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Yetersiz bakiye. Mevcut: €${totalBalance.toFixed(2)}, Gerekli: €${input.amount.toFixed(2)}`,
        });
      }

      // Harcama dağılımını hesapla
      const breakdown = await calculateSpendBreakdown(wallet, input.amount);

      if (!breakdown.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bakiye hesaplama hatası",
        });
      }

      // Yeni bakiyeleri hesapla
      const newPromoBalance = wallet.promoBalance.sub(new Prisma.Decimal(breakdown.spent.promo));
      const newBonusBalance = wallet.bonusBalance.sub(new Prisma.Decimal(breakdown.spent.bonus));
      const newMainBalance = wallet.mainBalance.sub(new Prisma.Decimal(breakdown.spent.main));
      const newTotalBalance = wallet.balance.sub(new Prisma.Decimal(input.amount));

      // Transaction ve wallet güncelleme
      const transactionOperations: Prisma.PrismaPromise<unknown>[] = [];

      // Her bakiye türü için ayrı transaction kaydı oluştur
      for (const tx of breakdown.transactions) {
        transactionOperations.push(
          prisma.transaction.create({
            data: {
              walletId: wallet.id,
              type: "CHARGE",
              status: "COMPLETED",
              amount: tx.amount,
              balanceBefore: wallet.balance, // Toplam bakiye
              balanceAfter: newTotalBalance,
              currency: input.currency,
              description: `${input.description} (${tx.balanceType})`,
              reference: input.reference,
              balanceType: tx.balanceType,
              paymentMethod: "WALLET",
              metadata: {
                orderId: input.orderId,
                invoiceId: input.invoiceId,
                breakdown: breakdown.spent,
              },
            },
          })
        );
      }

      // Wallet güncelle
      transactionOperations.push(
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newTotalBalance,
            mainBalance: newMainBalance,
            bonusBalance: newBonusBalance,
            promoBalance: newPromoBalance,
          },
        })
      );

      await prisma.$transaction(transactionOperations);

      return {
        success: true,
        spent: {
          total: input.amount,
          promo: breakdown.spent.promo,
          bonus: breakdown.spent.bonus,
          main: breakdown.spent.main,
        },
        newBalance: {
          total: newTotalBalance.toString(),
          main: newMainBalance.toString(),
          bonus: newBonusBalance.toString(),
          promo: newPromoBalance.toString(),
        },
      };
    }),

  // Check if wallet has enough balance
  canSpend: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01),
        currency: z.string().default("EUR"),
      })
    )
    .query(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(ctx.user.id, input.currency);
      const totalBalance = parseFloat(wallet.balance.toString());
      const canSpend = totalBalance >= input.amount;

      const breakdown = await calculateSpendBreakdown(wallet, input.amount);

      return {
        canSpend,
        availableBalance: totalBalance,
        requiredAmount: input.amount,
        shortfall: canSpend ? 0 : input.amount - totalBalance,
        breakdown: breakdown.success ? breakdown.spent : null,
      };
    }),

  // Admin: List all wallets
  adminListWallets: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.WalletWhereInput = input.search
        ? {
            user: {
              OR: [
                { email: { contains: input.search, mode: "insensitive" } },
                { name: { contains: input.search, mode: "insensitive" } },
              ],
            },
          }
        : {};

      const [wallets, total] = await Promise.all([
        prisma.wallet.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        }),
        prisma.wallet.count({ where }),
      ]);

      let nextCursor: string | undefined;
      if (wallets.length > input.limit) {
        const nextItem = wallets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        wallets: wallets.map((w) => ({
          id: w.id,
          userId: w.userId,
          currency: w.currency,
          balance: w.balance.toString(),
          mainBalance: w.mainBalance.toString(),
          bonusBalance: w.bonusBalance.toString(),
          promoBalance: w.promoBalance.toString(),
          createdAt: w.createdAt,
          user: w.user,
        })),
        total,
        nextCursor,
      };
    }),

  // Admin: Get user wallet
  adminGetUserWallet: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const wallet = await prisma.wallet.findFirst({
        where: { userId: input.userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!wallet) {
        return null;
      }

      return {
        id: wallet.id,
        userId: wallet.userId,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
        mainBalance: wallet.mainBalance.toString(),
        bonusBalance: wallet.bonusBalance.toString(),
        promoBalance: wallet.promoBalance.toString(),
        user: wallet.user,
      };
    }),

  // Admin: Adjust balance (add or subtract)
  adminAdjustBalance: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(), // Can be negative for subtract
        description: z.string(),
        currency: z.string().default("EUR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(input.userId, input.currency);
      const amountDecimal = new Prisma.Decimal(Math.abs(input.amount));
      const isAddition = input.amount > 0;

      // For subtraction, check balance
      if (!isAddition && wallet.mainBalance.lessThan(amountDecimal)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yetersiz bakiye",
        });
      }

      const newMainBalance = isAddition
        ? wallet.mainBalance.add(amountDecimal)
        : wallet.mainBalance.sub(amountDecimal);
      const newTotalBalance = isAddition
        ? wallet.balance.add(amountDecimal)
        : wallet.balance.sub(amountDecimal);

      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: isAddition ? "ADJUSTMENT" : "CHARGE",
            status: "COMPLETED",
            amount: Math.abs(input.amount),
            balanceBefore: wallet.balance,
            balanceAfter: newTotalBalance,
            currency: input.currency,
            description: input.description,
            balanceType: "MAIN",
            paymentMethod: "MANUAL",
            metadata: {
              adminId: ctx.user.id,
              adminEmail: ctx.user.email,
              action: isAddition ? "ADD" : "SUBTRACT",
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newTotalBalance,
            mainBalance: newMainBalance,
          },
        }),
      ]);

      return {
        success: true,
        transactionId: transaction.id,
        newBalance: newTotalBalance.toString(),
      };
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";
import { createPayTRToken, getPayTRIframeUrl } from "@/lib/paytr";

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

// Helper: Get or create Stripe customer
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

// Helper: Get or create wallet
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

// Helper: Generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `HYB-${year}${month}`,
      },
    },
    orderBy: { invoiceNumber: "desc" },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split("-")[2] || "0");
    sequence = lastSequence + 1;
  }

  return `HYB-${year}${month}-${String(sequence).padStart(4, "0")}`;
}

export const paymentRouter = createTRPCRouter({
  // Kayıtlı ödeme yöntemlerini listele
  listMethods: protectedProcedure.query(async ({ ctx }) => {
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!stripeCustomer) {
      return [];
    }

    const paymentMethods = await getStripe().paymentMethods.list({
      customer: stripeCustomer.stripeCustomerId,
      type: "card",
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === stripeCustomer.defaultPaymentMethod,
    }));
  }),

  // Varsayılan ödeme yöntemini ayarla
  setDefaultMethod: protectedProcedure
    .input(z.object({ paymentMethodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!stripeCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stripe müşteri bulunamadı",
        });
      }

      // Stripe'da varsayılan yap
      await getStripe().customers.update(stripeCustomer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: input.paymentMethodId,
        },
      });

      // DB'de güncelle
      await prisma.stripeCustomer.update({
        where: { id: stripeCustomer.id },
        data: { defaultPaymentMethod: input.paymentMethodId },
      });

      return { success: true };
    }),

  // Ödeme yöntemi kaldır
  removeMethod: protectedProcedure
    .input(z.object({ paymentMethodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!stripeCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stripe müşteri bulunamadı",
        });
      }

      await getStripe().paymentMethods.detach(input.paymentMethodId);

      // Varsayılan ise temizle
      if (stripeCustomer.defaultPaymentMethod === input.paymentMethodId) {
        await prisma.stripeCustomer.update({
          where: { id: stripeCustomer.id },
          data: { defaultPaymentMethod: null },
        });
      }

      return { success: true };
    }),

  // Cüzdandan ödeme yap
  payWithWallet: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.user.id,
          status: "PENDING",
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sipariş bulunamadı veya zaten işlenmiş",
        });
      }

      const wallet = await getOrCreateWallet(ctx.user.id, order.currency);

      if (wallet.balance.lessThan(input.amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yetersiz bakiye",
        });
      }

      const orderTotal = parseFloat(order.total.toString());
      if (input.amount > orderTotal) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ödeme tutarı sipariş tutarını aşamaz",
        });
      }

      const newBalance = wallet.balance.sub(new Prisma.Decimal(input.amount));

      // Transaction başlat
      const result = await prisma.$transaction(async (tx) => {
        // Cüzdan işlemi
        const transaction = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "CHARGE",
            status: "COMPLETED",
            amount: input.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency: order.currency,
            description: `Sipariş ödemesi - ${order.orderNumber}`,
            reference: order.id,
            paymentMethod: "SYSTEM",
          },
        });

        // Cüzdan bakiyesini güncelle
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        });

        // Sipariş güncelle
        const totalPaid = parseFloat(order.walletAmount.toString()) + input.amount;
        const isFullyPaid = totalPaid >= orderTotal;

        await tx.order.update({
          where: { id: order.id },
          data: {
            walletAmount: { increment: input.amount },
            paymentStatus: isFullyPaid ? "CAPTURED" : "AUTHORIZED",
            status: isFullyPaid ? "PROCESSING" : "PENDING",
            paymentMethod: isFullyPaid ? "wallet" : order.paymentMethod,
            paidAt: isFullyPaid ? new Date() : null,
          },
        });

        // Tam ödeme yapıldıysa fatura oluştur
        if (isFullyPaid) {
          const invoiceNumber = await generateInvoiceNumber();

          const invoice = await tx.invoice.create({
            data: {
              transactionId: transaction.id,
              invoiceNumber,
              userId: ctx.user.id,
              status: "PAID",
              subtotal: order.subtotal,
              taxRate: order.taxRate,
              taxAmount: order.taxAmount,
              total: order.total,
              currency: order.currency,
              paidAt: new Date(),
              items: [],
            },
          });

          await tx.order.update({
            where: { id: order.id },
            data: { invoiceId: invoice.id },
          });

          // Kupon kullanıldıysa kaydet
          if (order.couponId) {
            await tx.coupon.update({
              where: { id: order.couponId },
              data: { usedCount: { increment: 1 } },
            });

            await tx.couponUsage.create({
              data: {
                couponId: order.couponId,
                userId: ctx.user.id,
                orderId: order.id,
                discountAmount: order.discountAmount,
              },
            });
          }

          // Sepeti tamamlandı olarak işaretle
          if (order.cartId) {
            await tx.cart.update({
              where: { id: order.cartId },
              data: {
                status: "CONVERTED",
                convertedAt: new Date(),
              },
            });
          }
        }

        return { transaction, isFullyPaid };
      });

      return {
        success: true,
        transactionId: result.transaction.id,
        isFullyPaid: result.isFullyPaid,
        newBalance: newBalance.toString(),
      };
    }),

  // Stripe checkout session oluştur
  createCheckout: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        useWalletBalance: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.user.id,
          status: "PENDING",
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sipariş bulunamadı veya zaten işlenmiş",
        });
      }

      const stripeCustomer = await getOrCreateStripeCustomer(
        ctx.user.id,
        ctx.user.email,
        ctx.user.name
      );

      let amountToPay = parseFloat(order.total.toString());

      // Cüzdan bakiyesi kullanılacaksa
      if (input.useWalletBalance) {
        const wallet = await getOrCreateWallet(ctx.user.id, order.currency);
        const walletBalance = parseFloat(wallet.balance.toString());

        if (walletBalance > 0) {
          const walletDeduction = Math.min(walletBalance, amountToPay);
          amountToPay -= walletDeduction;

          // Cüzdandan düş
          if (walletDeduction > 0) {
            const newBalance = wallet.balance.sub(new Prisma.Decimal(walletDeduction));

            await prisma.$transaction([
              prisma.transaction.create({
                data: {
                  walletId: wallet.id,
                  type: "CHARGE",
                  status: "COMPLETED",
                  amount: walletDeduction,
                  balanceBefore: wallet.balance,
                  balanceAfter: newBalance,
                  currency: order.currency,
                  description: `Sipariş ödemesi (kısmi) - ${order.orderNumber}`,
                  reference: order.id,
                  paymentMethod: "SYSTEM",
                },
              }),
              prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
              }),
              prisma.order.update({
                where: { id: order.id },
                data: { walletAmount: walletDeduction },
              }),
            ]);
          }
        }
      }

      // Eğer cüzdan tüm tutarı karşıladıysa
      if (amountToPay <= 0) {
        // Siparişi tamamla
        const invoiceNumber = await generateInvoiceNumber();

        await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              userId: ctx.user.id,
              status: "PAID",
              subtotal: order.subtotal,
              taxRate: order.taxRate,
              taxAmount: order.taxAmount,
              total: order.total,
              currency: order.currency,
              paidAt: new Date(),
              items: [],
            },
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "PROCESSING",
              paymentStatus: "CAPTURED",
              paymentMethod: "wallet",
              invoiceId: invoice.id,
              paidAt: new Date(),
            },
          });

          if (order.cartId) {
            await tx.cart.update({
              where: { id: order.cartId },
              data: {
                status: "CONVERTED",
                convertedAt: new Date(),
              },
            });
          }
        });

        return {
          url: null,
          fullPaidWithWallet: true,
          orderId: order.id,
        };
      }

      // Stripe checkout session oluştur
      const session = await getStripe().checkout.sessions.create({
        customer: stripeCustomer.stripeCustomerId,
        payment_method_types: ["card"],
        line_items: order.items.map((item) => ({
          price_data: {
            currency: item.currency.toLowerCase(),
            product_data: {
              name: item.productName,
              description: item.variantName || undefined,
            },
            unit_amount: Math.round(parseFloat(item.unitPrice.toString()) * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co"}/checkout/cancel?order_id=${order.id}`,
        metadata: {
          orderId: order.id,
          userId: ctx.user.id,
          orderNumber: order.orderNumber,
        },
        payment_intent_data: {
          metadata: {
            orderId: order.id,
            userId: ctx.user.id,
            orderNumber: order.orderNumber,
          },
        },
      });

      // Stripe ref kaydet
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentRef: session.id,
          paymentMethod: "stripe",
        },
      });

      return {
        url: session.url,
        sessionId: session.id,
        fullPaidWithWallet: false,
      };
    }),

  // Kayıtlı kartla ödeme yap
  chargeCard: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentMethodId: z.string(),
        useWalletBalance: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.user.id,
          status: "PENDING",
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sipariş bulunamadı veya zaten işlenmiş",
        });
      }

      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!stripeCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stripe müşteri bulunamadı",
        });
      }

      let amountToCharge = parseFloat(order.total.toString());
      let walletDeduction = 0;

      // Cüzdan bakiyesi kullanılacaksa
      if (input.useWalletBalance) {
        const wallet = await getOrCreateWallet(ctx.user.id, order.currency);
        const walletBalance = parseFloat(wallet.balance.toString());

        if (walletBalance > 0) {
          walletDeduction = Math.min(walletBalance, amountToCharge);
          amountToCharge -= walletDeduction;
        }
      }

      // Payment intent oluştur ve charge et
      let paymentIntent = null;
      if (amountToCharge > 0) {
        paymentIntent = await getStripe().paymentIntents.create({
          amount: Math.round(amountToCharge * 100),
          currency: order.currency.toLowerCase(),
          customer: stripeCustomer.stripeCustomerId,
          payment_method: input.paymentMethodId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          metadata: {
            orderId: order.id,
            userId: ctx.user.id,
            orderNumber: order.orderNumber,
          },
        });

        if (paymentIntent.status !== "succeeded") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ödeme başarısız oldu",
          });
        }
      }

      // Transaction ile tüm güncellemeleri yap
      await prisma.$transaction(async (tx) => {
        // Cüzdan işlemi
        if (walletDeduction > 0) {
          const wallet = await getOrCreateWallet(ctx.user.id, order.currency);
          const newBalance = wallet.balance.sub(new Prisma.Decimal(walletDeduction));

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: "CHARGE",
              status: "COMPLETED",
              amount: walletDeduction,
              balanceBefore: wallet.balance,
              balanceAfter: newBalance,
              currency: order.currency,
              description: `Sipariş ödemesi (kısmi) - ${order.orderNumber}`,
              reference: order.id,
              paymentMethod: "SYSTEM",
            },
          });

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          });
        }

        // Fatura oluştur
        const invoiceNumber = await generateInvoiceNumber();
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            userId: ctx.user.id,
            status: "PAID",
            subtotal: order.subtotal,
            taxRate: order.taxRate,
            taxAmount: order.taxAmount,
            total: order.total,
            currency: order.currency,
            paidAt: new Date(),
            items: [],
          },
        });

        // Sipariş güncelle
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PROCESSING",
            paymentStatus: "CAPTURED",
            paymentMethod: amountToCharge > 0 ? "stripe" : "wallet",
            paymentRef: paymentIntent?.id,
            walletAmount: walletDeduction,
            cardAmount: amountToCharge,
            invoiceId: invoice.id,
            paidAt: new Date(),
          },
        });

        // Kupon kullanıldıysa kaydet
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: order.couponId,
              userId: ctx.user.id,
              orderId: order.id,
              discountAmount: order.discountAmount,
            },
          });
        }

        // Sepeti tamamlandı olarak işaretle
        if (order.cartId) {
          await tx.cart.update({
            where: { id: order.cartId },
            data: {
              status: "CONVERTED",
              convertedAt: new Date(),
            },
          });
        }
      });

      return {
        success: true,
        paymentIntentId: paymentIntent?.id,
        orderId: order.id,
      };
    }),

  // Stripe checkout doğrula (success page için)
  verifyCheckout: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        orderId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        return { success: false, message: "Ödeme henüz tamamlanmadı" };
      }

      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.user.id,
        },
      });

      if (!order) {
        return { success: false, message: "Sipariş bulunamadı" };
      }

      // Zaten işlendiyse
      if (order.paymentStatus === "CAPTURED") {
        return {
          success: true,
          message: "Ödeme zaten işlendi",
          orderNumber: order.orderNumber,
        };
      }

      // Siparişi güncelle (webhook da yapacak ama güvenlik için)
      const invoiceNumber = await generateInvoiceNumber();

      await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            userId: ctx.user.id,
            status: "PAID",
            subtotal: order.subtotal,
            taxRate: order.taxRate,
            taxAmount: order.taxAmount,
            total: order.total,
            currency: order.currency,
            paidAt: new Date(),
            items: [],
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PROCESSING",
            paymentStatus: "CAPTURED",
            cardAmount: parseFloat(order.total.toString()) - parseFloat(order.walletAmount.toString()),
            paymentRef: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
            invoiceId: invoice.id,
            paidAt: new Date(),
          },
        });

        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: order.couponId,
              userId: ctx.user.id,
              orderId: order.id,
              discountAmount: order.discountAmount,
            },
          });
        }

        if (order.cartId) {
          await tx.cart.update({
            where: { id: order.cartId },
            data: {
              status: "CONVERTED",
              convertedAt: new Date(),
            },
          });
        }
      });

      return {
        success: true,
        message: "Ödeme başarıyla işlendi",
        orderNumber: order.orderNumber,
      };
    }),

  // Kart ekleme için setup intent oluştur
  createSetupIntent: protectedProcedure.mutation(async ({ ctx }) => {
    const stripeCustomer = await getOrCreateStripeCustomer(
      ctx.user.id,
      ctx.user.email,
      ctx.user.name
    );

    const setupIntent = await getStripe().setupIntents.create({
      customer: stripeCustomer.stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  }),

  // ==================== PAYTR METHODS ====================

  // PayTR ile cüzdan yükleme için token oluştur
  createPayTRDeposit: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(10).max(50000), // Min 10 TL, Max 50,000 TL
        currency: z.literal("TRY").default("TRY"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true, email: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Generate unique merchant order ID
      const merchantOid = `DEP-${ctx.user.id.slice(-8)}-${Date.now()}`;

      // Amount in kuruş (1 TL = 100 kuruş)
      const amountKurus = Math.round(input.amount * 100);

      // Get or create wallet
      const wallet = await getOrCreateWallet(ctx.user.id, input.currency);

      // Create pending transaction
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "PENDING",
          amount: input.amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance, // Will be updated on callback
          currency: input.currency,
          description: `Cüzdan yükleme (PayTR) - ${input.amount} TL`,
          reference: merchantOid,
          balanceType: "MAIN",
          paymentMethod: "PAYTR",
          metadata: {
            amountKurus,
            initiatedAt: new Date().toISOString(),
          },
        },
      });

      // Create PayTR token
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co";
      const tokenResponse = await createPayTRToken({
        userId: ctx.user.id,
        userEmail: user.email,
        userName: user.name || "Hyble User",
        userPhone: "05000000000", // Default phone (can be updated later with user profile)
        userAddress: "Turkey",
        userIp: "127.0.0.1", // Will be replaced with actual IP in production
        merchantOid,
        amount: amountKurus,
        currency: "TL",
        basketItems: [
          {
            name: "Cüzdan Yükleme",
            price: amountKurus.toString(),
            quantity: 1,
          },
        ],
        noInstallment: true,
        successUrl: `${baseUrl}/wallet?paytr=success&oid=${merchantOid}`,
        failUrl: `${baseUrl}/wallet?paytr=fail&oid=${merchantOid}`,
        lang: "tr",
      });

      if (tokenResponse.status !== "success" || !tokenResponse.token) {
        // Mark transaction as failed
        await prisma.transaction.updateMany({
          where: { reference: merchantOid },
          data: {
            status: "FAILED",
            metadata: {
              error: tokenResponse.reason,
              failedAt: new Date().toISOString(),
            },
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `PayTR token oluşturulamadı: ${tokenResponse.reason}`,
        });
      }

      return {
        token: tokenResponse.token,
        iframeUrl: getPayTRIframeUrl(tokenResponse.token),
        merchantOid,
        amount: input.amount,
        currency: input.currency,
      };
    }),

  // PayTR ödeme durumunu kontrol et
  checkPayTRStatus: protectedProcedure
    .input(z.object({ merchantOid: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          reference: input.merchantOid,
          wallet: {
            userId: ctx.user.id,
          },
        },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "İşlem bulunamadı",
        });
      }

      return {
        status: transaction.status,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        createdAt: transaction.createdAt,
      };
    }),

  // PayTR ile sipariş ödemesi
  createPayTRCheckout: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get order
      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.user.id,
          paymentStatus: "PENDING",
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sipariş bulunamadı veya ödeme beklenmiyor",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true, email: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Amount in kuruş
      const amountKurus = Math.round(parseFloat(order.total.toString()) * 100);

      // Basket items
      const basketItems = order.items.map((item) => ({
        name: item.productName,
        price: Math.round(parseFloat(item.totalPrice.toString()) * 100).toString(),
        quantity: item.quantity,
      }));

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hyble.co";
      const tokenResponse = await createPayTRToken({
        userId: ctx.user.id,
        userEmail: user.email,
        userName: user.name || "Hyble User",
        userPhone: "05000000000", // Default phone
        userAddress: "Turkey",
        userIp: "127.0.0.1",
        merchantOid: order.orderNumber,
        amount: amountKurus,
        currency: "TL",
        basketItems,
        noInstallment: false,
        maxInstallment: 12,
        successUrl: `${baseUrl}/checkout/success?oid=${order.orderNumber}`,
        failUrl: `${baseUrl}/checkout/fail?oid=${order.orderNumber}`,
        lang: "tr",
      });

      if (tokenResponse.status !== "success" || !tokenResponse.token) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `PayTR token oluşturulamadı: ${tokenResponse.reason}`,
        });
      }

      // Update order with PayTR reference
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentRef: `paytr:${tokenResponse.token}`,
        },
      });

      return {
        token: tokenResponse.token,
        iframeUrl: getPayTRIframeUrl(tokenResponse.token),
        orderNumber: order.orderNumber,
        amount: parseFloat(order.total.toString()),
        currency: order.currency,
      };
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

// Helper: Period end date hesapla
function calculatePeriodEnd(startDate: Date, period: string): Date {
  const endDate = new Date(startDate);

  switch (period) {
    case "monthly":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "quarterly":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "annually":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }

  return endDate;
}

// Helper: Get or create wallet
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

export const subscriptionRouter = createTRPCRouter({
  // Kullanıcının aboneliklerini listele
  list: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: ctx.user.id,
        status: { in: ["ACTIVE", "TRIAL", "PAST_DUE", "PAUSED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map((sub) => ({
      id: sub.id,
      productId: sub.productId,
      variantId: sub.variantId,
      productName: sub.productName,
      variantName: sub.variantName,
      status: sub.status,
      billingPeriod: sub.billingPeriod,
      price: sub.price.toString(),
      currency: sub.currency,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      autoRenew: sub.autoRenew,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      trialEnd: sub.trialEnd,
      createdAt: sub.createdAt,
    }));
  }),

  // Tüm abonelikleri listele (geçmiş dahil)
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map((sub) => ({
      id: sub.id,
      productId: sub.productId,
      variantId: sub.variantId,
      productName: sub.productName,
      variantName: sub.variantName,
      status: sub.status,
      billingPeriod: sub.billingPeriod,
      price: sub.price.toString(),
      currency: sub.currency,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      autoRenew: sub.autoRenew,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      cancelledAt: sub.cancelledAt,
      cancelReason: sub.cancelReason,
      createdAt: sub.createdAt,
    }));
  }),

  // Tek abonelik detayı
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              paidAt: true,
            },
          },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Abonelik bulunamadı",
        });
      }

      return {
        id: subscription.id,
        productId: subscription.productId,
        variantId: subscription.variantId,
        productName: subscription.productName,
        variantName: subscription.variantName,
        status: subscription.status,
        billingPeriod: subscription.billingPeriod,
        price: subscription.price.toString(),
        currency: subscription.currency,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        autoRenew: subscription.autoRenew,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
        cancelledAt: subscription.cancelledAt,
        cancelReason: subscription.cancelReason,
        pausedAt: subscription.pausedAt,
        pauseReason: subscription.pauseReason,
        resumesAt: subscription.resumesAt,
        createdAt: subscription.createdAt,
        order: subscription.order
          ? {
              id: subscription.order.id,
              orderNumber: subscription.order.orderNumber,
              total: subscription.order.total.toString(),
              paidAt: subscription.order.paidAt,
            }
          : null,
      };
    }),

  // Aboneliği iptal et (periyot sonunda)
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
        immediate: z.boolean().default(false), // Hemen mi periyot sonunda mı
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aktif abonelik bulunamadı",
        });
      }

      if (input.immediate) {
        // Hemen iptal et
        await prisma.subscription.update({
          where: { id: input.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelReason: input.reason,
            autoRenew: false,
          },
        });

        return {
          success: true,
          message: "Aboneliğiniz hemen iptal edildi",
          effectiveDate: new Date(),
        };
      } else {
        // Periyot sonunda iptal et
        await prisma.subscription.update({
          where: { id: input.id },
          data: {
            cancelAtPeriodEnd: true,
            cancelReason: input.reason,
            autoRenew: false,
          },
        });

        return {
          success: true,
          message: "Aboneliğiniz mevcut dönem sonunda iptal edilecek",
          effectiveDate: subscription.currentPeriodEnd,
        };
      }
    }),

  // İptal talebini geri al
  reactivate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          cancelAtPeriodEnd: true,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "İptal talebi olan abonelik bulunamadı",
        });
      }

      await prisma.subscription.update({
        where: { id: input.id },
        data: {
          cancelAtPeriodEnd: false,
          cancelReason: null,
          autoRenew: true,
        },
      });

      return {
        success: true,
        message: "İptal talebi geri alındı, aboneliğiniz devam edecek",
      };
    }),

  // Aboneliği duraklat
  pause: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
        resumeAt: z.date().optional(), // Otomatik devam tarihi
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          status: "ACTIVE",
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aktif abonelik bulunamadı",
        });
      }

      await prisma.subscription.update({
        where: { id: input.id },
        data: {
          status: "PAUSED",
          pausedAt: new Date(),
          pauseReason: input.reason,
          resumesAt: input.resumeAt,
        },
      });

      return {
        success: true,
        message: input.resumeAt
          ? `Aboneliğiniz duraklatıldı ve ${input.resumeAt.toLocaleDateString("tr-TR")} tarihinde otomatik devam edecek`
          : "Aboneliğiniz duraklatıldı",
      };
    }),

  // Duraklatılmış aboneliği devam ettir
  resume: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          status: "PAUSED",
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Duraklatılmış abonelik bulunamadı",
        });
      }

      // Yeni periyot hesapla
      const now = new Date();
      const newPeriodEnd = calculatePeriodEnd(now, subscription.billingPeriod);

      await prisma.subscription.update({
        where: { id: input.id },
        data: {
          status: "ACTIVE",
          pausedAt: null,
          pauseReason: null,
          resumesAt: null,
          currentPeriodStart: now,
          currentPeriodEnd: newPeriodEnd,
        },
      });

      return {
        success: true,
        message: "Aboneliğiniz yeniden aktif edildi",
        newPeriodEnd,
      };
    }),

  // Planı değiştir (upgrade/downgrade)
  changePlan: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        newVariantId: z.string(),
        immediate: z.boolean().default(false), // Hemen mi periyot sonunda mı
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.subscriptionId,
          userId: ctx.user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aktif abonelik bulunamadı",
        });
      }

      // Yeni varyantı bul
      const newVariant = await prisma.productVariant.findUnique({
        where: { id: input.newVariantId },
        include: { product: true },
      });

      if (!newVariant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Seçilen plan bulunamadı",
        });
      }

      if (newVariant.productId !== subscription.productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Farklı bir ürüne geçiş yapamazsınız",
        });
      }

      if (input.immediate) {
        // Hemen değiştir
        const oldPrice = parseFloat(subscription.price.toString());
        const newPrice = parseFloat(newVariant.price.toString());

        // Prorate hesapla (kalan günler için fark)
        const now = new Date();
        const periodEnd = subscription.currentPeriodEnd;
        const totalDays = Math.ceil((periodEnd.getTime() - subscription.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dailyOldRate = oldPrice / totalDays;
        const dailyNewRate = newPrice / totalDays;
        const proratedDifference = (dailyNewRate - dailyOldRate) * remainingDays;

        // Upgrade ise fark ödemesi gerekebilir
        if (proratedDifference > 0) {
          const wallet = await getOrCreateWallet(ctx.user.id, subscription.currency);

          if (wallet.balance.lessThan(proratedDifference)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Plan yükseltmesi için ${proratedDifference.toFixed(2)} ${subscription.currency} ödeme gerekiyor. Lütfen önce cüzdanınıza yükleme yapın.`,
            });
          }

          // Farkı tahsil et
          const newBalance = wallet.balance.sub(new Prisma.Decimal(proratedDifference));

          await prisma.$transaction([
            prisma.transaction.create({
              data: {
                walletId: wallet.id,
                type: "CHARGE",
                status: "COMPLETED",
                amount: proratedDifference,
                balanceBefore: wallet.balance,
                balanceAfter: newBalance,
                currency: subscription.currency,
                description: `Plan yükseltme - ${subscription.productName}`,
                reference: subscription.id,
                paymentMethod: "SYSTEM",
              },
            }),
            prisma.wallet.update({
              where: { id: wallet.id },
              data: { balance: newBalance },
            }),
          ]);
        }

        // Aboneliği güncelle
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            variantId: newVariant.id,
            variantName: newVariant.name,
            price: newVariant.price,
            billingPeriod: newVariant.billingPeriod || subscription.billingPeriod,
          },
        });

        return {
          success: true,
          message: "Planınız hemen değiştirildi",
          proratedAmount: proratedDifference > 0 ? proratedDifference : 0,
        };
      } else {
        // Periyot sonunda değiştir (metadata olarak sakla)
        // Bu basit implementasyonda hemen değiştiriyoruz
        // Gerçek uygulamada scheduledChange alanı eklenebilir

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            variantId: newVariant.id,
            variantName: newVariant.name,
            price: newVariant.price,
            billingPeriod: newVariant.billingPeriod || subscription.billingPeriod,
          },
        });

        return {
          success: true,
          message: "Planınız bir sonraki dönemden itibaren değişecek",
          effectiveDate: subscription.currentPeriodEnd,
        };
      }
    }),

  // ==================== ADMIN ENDPOINTS ====================

  // Tüm abonelikleri listele
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "PAUSED", "CANCELLED", "EXPIRED"]).optional(),
        userId: z.string().optional(),
        productId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.SubscriptionWhereInput = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.userId) {
        where.userId = input.userId;
      }

      if (input.productId) {
        where.productId = input.productId;
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.subscription.count({ where }),
      ]);

      return {
        subscriptions: subscriptions.map((sub) => ({
          id: sub.id,
          userId: sub.userId,
          productId: sub.productId,
          productName: sub.productName,
          variantName: sub.variantName,
          status: sub.status,
          billingPeriod: sub.billingPeriod,
          price: sub.price.toString(),
          currency: sub.currency,
          currentPeriodEnd: sub.currentPeriodEnd,
          autoRenew: sub.autoRenew,
          createdAt: sub.createdAt,
        })),
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Manuel abonelik oluştur
  adminCreate: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        variantId: z.string().optional(),
        billingPeriod: z.enum(["monthly", "quarterly", "annually"]),
        price: z.number().positive(),
        currency: z.string().default("EUR"),
        trialDays: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      // Ürün ve varyant kontrolü
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        include: {
          variants: input.variantId ? { where: { id: input.variantId } } : undefined,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ürün bulunamadı",
        });
      }

      const variant = product.variants?.[0];
      const now = new Date();
      const trialEnd = input.trialDays > 0 ? new Date(now.getTime() + input.trialDays * 24 * 60 * 60 * 1000) : null;
      const periodStart = trialEnd || now;
      const periodEnd = calculatePeriodEnd(periodStart, input.billingPeriod);

      const subscription = await prisma.subscription.create({
        data: {
          userId: input.userId,
          productId: input.productId,
          variantId: variant?.id,
          status: trialEnd ? "TRIAL" : "ACTIVE",
          billingPeriod: input.billingPeriod,
          price: input.price,
          currency: input.currency,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialStart: trialEnd ? now : null,
          trialEnd,
          productName: product.nameTr,
          variantName: variant?.name,
          autoRenew: true,
        },
      });

      return {
        success: true,
        subscriptionId: subscription.id,
      };
    }),

  // Abonelik durumunu güncelle
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "PAUSED", "CANCELLED", "EXPIRED"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const subscription = await prisma.subscription.findUnique({
        where: { id: input.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Abonelik bulunamadı",
        });
      }

      const updateData: Prisma.SubscriptionUpdateInput = {
        status: input.status,
      };

      if (input.status === "CANCELLED") {
        updateData.cancelledAt = new Date();
        updateData.cancelReason = input.reason || "Admin tarafından iptal edildi";
      } else if (input.status === "PAUSED") {
        updateData.pausedAt = new Date();
        updateData.pauseReason = input.reason;
      } else if (input.status === "ACTIVE" && subscription.status === "PAUSED") {
        updateData.pausedAt = null;
        updateData.pauseReason = null;
      }

      await prisma.subscription.update({
        where: { id: input.id },
        data: updateData,
      });

      return { success: true };
    }),

  // Abonelik periyodunu uzat
  adminExtendPeriod: adminProcedure
    .input(
      z.object({
        id: z.string(),
        days: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const subscription = await prisma.subscription.findUnique({
        where: { id: input.id },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Abonelik bulunamadı",
        });
      }

      const newPeriodEnd = new Date(subscription.currentPeriodEnd);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + input.days);

      await prisma.subscription.update({
        where: { id: input.id },
        data: { currentPeriodEnd: newPeriodEnd },
      });

      return {
        success: true,
        newPeriodEnd,
      };
    }),
});

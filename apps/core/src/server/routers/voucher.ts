import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

// Helper: Generate voucher code
function generateVoucherCode(prefix: string = "HYB"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix + "-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += "-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

export const voucherRouter = createTRPCRouter({
  // Voucher doğrula (kullanmadan önce kontrol)
  validate: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const code = input.code.toUpperCase().trim();

      const voucher = await prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        return {
          valid: false,
          message: "Geçersiz voucher kodu",
          amount: 0,
          type: null,
        };
      }

      // Status kontrolü
      if (voucher.status !== "ACTIVE") {
        return {
          valid: false,
          message:
            voucher.status === "USED"
              ? "Bu voucher zaten kullanılmış"
              : voucher.status === "EXPIRED"
                ? "Bu voucher'ın süresi dolmuş"
                : "Bu voucher iptal edilmiş",
          amount: 0,
          type: voucher.type,
        };
      }

      // Expiry kontrolü
      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        // Status'u güncelle
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { status: "EXPIRED" },
        });

        return {
          valid: false,
          message: "Bu voucher'ın süresi dolmuş",
          amount: 0,
          type: voucher.type,
        };
      }

      // Kullanıcıya özel mi?
      if (voucher.userId && voucher.userId !== ctx.user.id) {
        return {
          valid: false,
          message: "Bu voucher hesabınız için geçerli değil",
          amount: 0,
          type: voucher.type,
        };
      }

      // Kalan bakiye kontrolü
      if (voucher.remainingAmount.lessThanOrEqualTo(0)) {
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { status: "USED" },
        });

        return {
          valid: false,
          message: "Bu voucher tamamen kullanılmış",
          amount: 0,
          type: voucher.type,
        };
      }

      return {
        valid: true,
        message: "Voucher geçerli",
        amount: parseFloat(voucher.remainingAmount.toString()),
        originalAmount: parseFloat(voucher.originalAmount.toString()),
        type: voucher.type,
        currency: voucher.currency,
        expiresAt: voucher.expiresAt,
      };
    }),

  // Voucher kullan (cüzdana yükle)
  redeem: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const code = input.code.toUpperCase().trim();

      const voucher = await prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geçersiz voucher kodu",
        });
      }

      // Tüm kontroller
      if (voucher.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            voucher.status === "USED"
              ? "Bu voucher zaten kullanılmış"
              : voucher.status === "EXPIRED"
                ? "Bu voucher'ın süresi dolmuş"
                : "Bu voucher iptal edilmiş",
        });
      }

      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { status: "EXPIRED" },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu voucher'ın süresi dolmuş",
        });
      }

      if (voucher.userId && voucher.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu voucher hesabınız için geçerli değil",
        });
      }

      const redeemAmount = parseFloat(voucher.remainingAmount.toString());
      if (redeemAmount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu voucher tamamen kullanılmış",
        });
      }

      // Cüzdana yükle
      const wallet = await getOrCreateWallet(ctx.user.id, voucher.currency);
      const newBalance = wallet.balance.add(voucher.remainingAmount);

      const result = await prisma.$transaction(async (tx) => {
        // Cüzdan işlemi
        const transaction = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "BONUS",
            status: "COMPLETED",
            amount: voucher.remainingAmount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency: voucher.currency,
            description: `Voucher kullanımı - ${voucher.code}`,
            reference: voucher.id,
            paymentMethod: "SYSTEM",
            metadata: {
              voucherId: voucher.id,
              voucherType: voucher.type,
              voucherCode: voucher.code,
            },
          },
        });

        // Cüzdan güncelle
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        });

        // Redemption kaydı
        await tx.voucherRedemption.create({
          data: {
            voucherId: voucher.id,
            userId: ctx.user.id,
            amount: voucher.remainingAmount,
            type: "wallet_deposit",
            balanceBefore: voucher.remainingAmount,
            balanceAfter: new Prisma.Decimal(0),
          },
        });

        // Voucher'ı kullanıldı olarak işaretle
        await tx.voucher.update({
          where: { id: voucher.id },
          data: {
            remainingAmount: 0,
            status: "USED",
          },
        });

        return { transaction };
      });

      return {
        success: true,
        amount: redeemAmount,
        currency: voucher.currency,
        newBalance: parseFloat(newBalance.toString()),
        transactionId: result.transaction.id,
      };
    }),

  // Kullanıcının voucher'larını listele (varsa)
  list: protectedProcedure.query(async ({ ctx }) => {
    const vouchers = await prisma.voucher.findMany({
      where: {
        userId: ctx.user.id,
        status: "ACTIVE",
      },
      orderBy: { expiresAt: "asc" },
    });

    return vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      type: v.type,
      originalAmount: v.originalAmount.toString(),
      remainingAmount: v.remainingAmount.toString(),
      currency: v.currency,
      expiresAt: v.expiresAt,
      reason: v.reason,
    }));
  }),

  // ==================== ADMIN ENDPOINTS ====================

  // Yeni voucher oluştur
  adminCreate: adminProcedure
    .input(
      z.object({
        type: z.enum(["GIFT_CARD", "PROMO_CREDIT", "REFERRAL", "BIRTHDAY"]),
        amount: z.number().positive(),
        currency: z.string().default("EUR"),
        userId: z.string().optional(), // Belirli kullanıcıya özel
        expiresAt: z.date().optional(),
        reason: z.string().optional(),
        count: z.number().min(1).max(100).default(1), // Kaç tane oluşturulacak
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vouchers = [];

      for (let i = 0; i < input.count; i++) {
        // Benzersiz kod oluştur
        let code = generateVoucherCode(
          input.type === "GIFT_CARD"
            ? "GFT"
            : input.type === "PROMO_CREDIT"
              ? "PRM"
              : input.type === "REFERRAL"
                ? "REF"
                : "BDY"
        );

        // Kod benzersiz mi kontrol et
        let existing = await prisma.voucher.findUnique({ where: { code } });
        while (existing) {
          code = generateVoucherCode();
          existing = await prisma.voucher.findUnique({ where: { code } });
        }

        const voucher = await prisma.voucher.create({
          data: {
            code,
            type: input.type,
            status: "ACTIVE",
            originalAmount: input.amount,
            remainingAmount: input.amount,
            currency: input.currency,
            userId: input.userId,
            expiresAt: input.expiresAt,
            reason: input.reason,
            createdBy: ctx.user.id,
          },
        });

        vouchers.push({
          id: voucher.id,
          code: voucher.code,
          amount: input.amount,
          currency: input.currency,
        });
      }

      return {
        success: true,
        vouchers,
        count: vouchers.length,
      };
    }),

  // Voucher listele (admin)
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["ACTIVE", "USED", "EXPIRED", "CANCELLED"]).optional(),
        type: z.enum(["GIFT_CARD", "PROMO_CREDIT", "REFERRAL", "BIRTHDAY"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.VoucherWhereInput = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.search) {
        where.OR = [
          { code: { contains: input.search.toUpperCase() } },
          { reason: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [vouchers, total] = await Promise.all([
        prisma.voucher.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            redemptions: {
              select: {
                id: true,
                userId: true,
                amount: true,
                redeemedAt: true,
              },
            },
          },
        }),
        prisma.voucher.count({ where }),
      ]);

      return {
        vouchers: vouchers.map((v) => ({
          id: v.id,
          code: v.code,
          type: v.type,
          status: v.status,
          originalAmount: v.originalAmount.toString(),
          remainingAmount: v.remainingAmount.toString(),
          currency: v.currency,
          userId: v.userId,
          expiresAt: v.expiresAt,
          reason: v.reason,
          createdAt: v.createdAt,
          redemptions: v.redemptions,
        })),
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Voucher iptal et
  adminCancel: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const voucher = await prisma.voucher.findUnique({
        where: { id: input.id },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voucher bulunamadı",
        });
      }

      if (voucher.status === "USED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanılmış voucher iptal edilemez",
        });
      }

      await prisma.voucher.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      return { success: true };
    }),

  // ==================== COUPON ADMIN ENDPOINTS ====================

  // Kupon oluştur
  adminCreateCoupon: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20),
        description: z.string().optional(),
        type: z.enum(["PERCENTAGE", "FIXED"]),
        value: z.number().positive(),
        minOrderAmount: z.number().optional(),
        maxDiscount: z.number().optional(), // Yüzde için max
        usageLimit: z.number().optional(),
        usagePerUser: z.number().min(1).default(1),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        productIds: z.array(z.string()).default([]),
        categoryIds: z.array(z.string()).default([]),
        excludeProductIds: z.array(z.string()).default([]),
        userIds: z.array(z.string()).default([]),
        campaign: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = input.code.toUpperCase().trim();

      // Kod benzersiz mi?
      const existing = await prisma.coupon.findUnique({ where: { code } });
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kupon kodu zaten kullanılıyor",
        });
      }

      const coupon = await prisma.coupon.create({
        data: {
          code,
          description: input.description,
          type: input.type,
          status: "ACTIVE",
          value: input.value,
          minOrderAmount: input.minOrderAmount,
          maxDiscount: input.maxDiscount,
          usageLimit: input.usageLimit,
          usagePerUser: input.usagePerUser,
          startsAt: input.startsAt || new Date(),
          expiresAt: input.expiresAt,
          productIds: input.productIds,
          categoryIds: input.categoryIds,
          excludeProductIds: input.excludeProductIds,
          userIds: input.userIds,
          campaign: input.campaign,
          createdBy: ctx.user.id,
        },
      });

      return {
        success: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value.toString(),
        },
      };
    }),

  // Kupon listele (admin)
  adminListCoupons: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "DEPLETED"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.CouponWhereInput = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.search) {
        where.OR = [
          { code: { contains: input.search.toUpperCase() } },
          { description: { contains: input.search, mode: "insensitive" } },
          { campaign: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { usages: true },
            },
          },
        }),
        prisma.coupon.count({ where }),
      ]);

      return {
        coupons: coupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          type: c.type,
          status: c.status,
          value: c.value.toString(),
          minOrderAmount: c.minOrderAmount?.toString(),
          maxDiscount: c.maxDiscount?.toString(),
          usageLimit: c.usageLimit,
          usagePerUser: c.usagePerUser,
          usedCount: c.usedCount,
          startsAt: c.startsAt,
          expiresAt: c.expiresAt,
          campaign: c.campaign,
          createdAt: c.createdAt,
          actualUsages: c._count.usages,
        })),
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Kupon güncelle
  adminUpdateCoupon: adminProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
        value: z.number().positive().optional(),
        minOrderAmount: z.number().nullish(),
        maxDiscount: z.number().nullish(),
        usageLimit: z.number().nullish(),
        usagePerUser: z.number().min(1).optional(),
        expiresAt: z.date().nullish(),
        productIds: z.array(z.string()).optional(),
        categoryIds: z.array(z.string()).optional(),
        excludeProductIds: z.array(z.string()).optional(),
        userIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kupon bulunamadı",
        });
      }

      await prisma.coupon.update({
        where: { id },
        data,
      });

      return { success: true };
    }),

  // Kupon sil
  adminDeleteCoupon: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input.id },
        include: { _count: { select: { usages: true } } },
      });

      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kupon bulunamadı",
        });
      }

      // Kullanılmış kuponları silme
      if (coupon._count.usages > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kullanılmış kuponlar silinemez. Bunun yerine pasif yapabilirsiniz.",
        });
      }

      await prisma.coupon.delete({ where: { id: input.id } });

      return { success: true };
    }),
});

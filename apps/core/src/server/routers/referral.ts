// @ts-nocheck
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "../trpc/context";
import { TRPCError } from "@trpc/server";

async function generateUniqueCode(name: string): Promise<string> {
  const base = name
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 6);
  let code = base + Math.floor(Math.random() * 100);

  while (await prisma.referralCode.findUnique({ where: { code } })) {
    code = base + Math.floor(Math.random() * 1000);
  }

  return code;
}

export const referralRouter = createTRPCRouter({
  // Referral kodunu getir veya oluştur
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId: ctx.user.id },
      include: {
        referrals: {
          select: {
            id: true,
            status: true,
            commission: true,
            createdAt: true,
            convertedAt: true,
          },
        },
      },
    });

    if (!referralCode) {
      // Otomatik kod oluştur
      const code = await generateUniqueCode(
        ctx.user.name || ctx.user.email || "USER"
      );
      referralCode = await prisma.referralCode.create({
        data: {
          userId: ctx.user.id,
          code,
        },
        include: { referrals: true },
      });
    }

    return {
      code: referralCode.code,
      link: `https://hyble.co/ref/${referralCode.code}`,
      commission: referralCode.commission,
      discount: referralCode.discount,
      stats: {
        totalReferrals: referralCode.referrals.length,
        converted: referralCode.referrals.filter((r) => r.status === "converted")
          .length,
        pending: referralCode.referrals.filter((r) => r.status === "pending")
          .length,
        totalEarned: referralCode.totalEarned,
        totalPaid: referralCode.totalPaid,
        pendingPayout:
          Number(referralCode.totalEarned) - Number(referralCode.totalPaid),
      },
      referrals: referralCode.referrals,
    };
  }),

  // Özel kod iste
  requestCustomCode: protectedProcedure
    .input(
      z.object({ code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/) })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.referralCode.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Bu kod zaten kullanımda",
        });
      }

      await prisma.referralCode.update({
        where: { userId: ctx.user.id },
        data: { code: input.code },
      });

      return { success: true, code: input.code };
    }),

  // Referral kodu doğrula (kayıt sırasında)
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const referralCode = await prisma.referralCode.findFirst({
        where: { code: input.code.toUpperCase(), isActive: true },
        include: { user: { select: { name: true } } },
      });

      if (!referralCode) {
        return { valid: false };
      }

      return {
        valid: true,
        discount: referralCode.discount,
        referrerName:
          referralCode.user.name?.split(" ")[0] || "Bir arkadaşın",
      };
    }),

  // Referral kaydet (kayıt sonrası)
  trackReferral: publicProcedure
    .input(z.object({ code: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const referralCode = await prisma.referralCode.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      if (!referralCode) return { success: false };

      // Kendini referans edemez
      if (referralCode.userId === input.userId) return { success: false };

      // Zaten referral var mı kontrol et
      const existingReferral = await prisma.referral.findUnique({
        where: { referredUserId: input.userId },
      });

      if (existingReferral) return { success: false };

      await prisma.referral.create({
        data: {
          referralCodeId: referralCode.id,
          referredUserId: input.userId,
          status: "pending",
        },
      });

      return { success: true };
    }),

  // Payout talep et
  requestPayout: protectedProcedure.mutation(async ({ ctx }) => {
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!referralCode) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const pendingAmount =
      Number(referralCode.totalEarned) - Number(referralCode.totalPaid);

    if (pendingAmount < 50) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Minimum payout tutarı €50",
      });
    }

    // Bekleyen payout var mı kontrol et
    const existingRequest = await prisma.payoutRequest.findFirst({
      where: {
        userId: ctx.user.id,
        status: "pending",
      },
    });

    if (existingRequest) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Zaten bekleyen bir ödeme talebiniz var",
      });
    }

    // PayoutRequest oluştur (manuel onay için)
    await prisma.payoutRequest.create({
      data: {
        userId: ctx.user.id,
        amount: pendingAmount,
        status: "pending",
      },
    });

    return { success: true, amount: pendingAmount };
  }),

  // Admin: List all payout requests
  listPayoutRequests: adminProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where: any = {};
      if (input?.status) where.status = input.status;

      return prisma.payoutRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
    }),

  // Admin: Process payout
  processPayout: adminProcedure
    .input(
      z.object({
        requestId: z.string(),
        action: z.enum(["approve", "reject"]),
        method: z.string().optional(),
        details: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request = await prisma.payoutRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (request.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu talep zaten işlendi",
        });
      }

      if (input.action === "approve") {
        // Update payout request
        await prisma.payoutRequest.update({
          where: { id: input.requestId },
          data: {
            status: "approved",
            method: input.method,
            details: input.details,
            processedAt: new Date(),
          },
        });

        // Update referral code totalPaid
        const referralCode = await prisma.referralCode.findUnique({
          where: { userId: request.userId },
        });

        if (referralCode) {
          await prisma.referralCode.update({
            where: { id: referralCode.id },
            data: {
              totalPaid: {
                increment: request.amount,
              },
            },
          });
        }
      } else {
        await prisma.payoutRequest.update({
          where: { id: input.requestId },
          data: {
            status: "rejected",
            processedAt: new Date(),
          },
        });
      }

      return { success: true };
    }),
});

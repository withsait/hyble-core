// @ts-nocheck
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "@/lib/prisma";

export const npsRouter = createTRPCRouter({
  // NPS survey gösterilmeli mi kontrol et
  shouldShowSurvey: protectedProcedure.query(async ({ ctx }) => {
    // Son 30 günde survey gösterilmiş mi?
    const recentSurvey = await prisma.npsSurvey.findFirst({
      where: {
        userId: ctx.user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentSurvey) return false;

    // Kullanıcı en az 7 gündür kayıtlı mı?
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { createdAt: true },
    });

    if (!user) return false;

    const daysSinceRegistration =
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRegistration >= 7;
  }),

  // NPS survey gönder
  submit: protectedProcedure
    .input(
      z.object({
        score: z.number().min(-1).max(10), // -1 for skipped
        feedback: z.string().optional(),
        skipped: z.boolean().optional(),
        trigger: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.npsSurvey.create({
        data: {
          userId: ctx.user.id,
          score: input.score,
          feedback: input.feedback,
          skipped: input.skipped ?? false,
          trigger: input.trigger,
        },
      });

      return { success: true };
    }),

  // Admin: NPS istatistikleri
  stats: adminProcedure
    .input(
      z
        .object({
          days: z.number().default(30),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const surveys = await prisma.npsSurvey.findMany({
        where: {
          createdAt: { gte: since },
          skipped: false,
          score: { gte: 0 },
        },
        select: {
          score: true,
          feedback: true,
          createdAt: true,
        },
      });

      const total = surveys.length;
      if (total === 0) {
        return {
          npsScore: 0,
          total: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          recentFeedback: [],
        };
      }

      // NPS hesaplama
      const promoters = surveys.filter((s) => s.score >= 9).length;
      const detractors = surveys.filter((s) => s.score <= 6).length;
      const passives = total - promoters - detractors;

      const npsScore = Math.round(
        ((promoters - detractors) / total) * 100
      );

      // Son geri bildirimler
      const recentFeedback = surveys
        .filter((s) => s.feedback)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map((s) => ({
          score: s.score,
          feedback: s.feedback,
          createdAt: s.createdAt,
        }));

      return {
        npsScore,
        total,
        promoters,
        passives,
        detractors,
        promoterPercentage: ((promoters / total) * 100).toFixed(1),
        detractorPercentage: ((detractors / total) * 100).toFixed(1),
        recentFeedback,
      };
    }),

  // Admin: Tüm survey listesi
  list: adminProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(20),
          scoreFilter: z.enum(["all", "promoters", "passives", "detractors"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const where: any = { skipped: false };

      if (input?.scoreFilter === "promoters") {
        where.score = { gte: 9 };
      } else if (input?.scoreFilter === "passives") {
        where.score = { gte: 7, lte: 8 };
      } else if (input?.scoreFilter === "detractors") {
        where.score = { lte: 6 };
      }

      const [surveys, total] = await Promise.all([
        prisma.npsSurvey.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.npsSurvey.count({ where }),
      ]);

      return {
        surveys,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});

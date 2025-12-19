// @ts-nocheck
import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const leadRouter = createTRPCRouter({
  // Lead capture (public - for exit intent, newsletter, etc.)
  capture: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        source: z.enum([
          "exit_intent",
          "newsletter",
          "waitlist",
          "demo_request",
        ]),
        couponCode: z.string().optional(),
        metadata: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Lead kaydet veya güncelle
      const lead = await prisma.lead.upsert({
        where: { email: input.email },
        update: {
          lastSource: input.source,
          updatedAt: new Date(),
        },
        create: {
          email: input.email,
          source: input.source,
          couponCode: input.couponCode,
          metadata: input.metadata,
        },
      });

      // Drip campaign'e ekle (sadece yeni leadler için)
      if (lead.createdAt.getTime() > Date.now() - 5000) {
        // Son 5 saniyede oluşturulduysa yeni
        await prisma.emailSequence.create({
          data: {
            leadId: lead.id,
            sequenceName: "onboarding_7day",
            currentStep: 0,
            nextSendAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 gün sonra
          },
        });
      }

      return { success: true };
    }),

  // A/B test tracking
  trackVariant: publicProcedure
    .input(
      z.object({
        testId: z.string(),
        variant: z.string(),
        converted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.aBTestEvent.create({
        data: {
          testId: input.testId,
          variant: input.variant,
          converted: input.converted ?? false,
        },
      });
      return { success: true };
    }),

  // Admin: Get all leads
  list: adminProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(20),
          source: z.string().optional(),
          converted: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const where: any = {};
      if (input?.source) where.source = input.source;
      if (input?.converted !== undefined) {
        where.convertedAt = input.converted ? { not: null } : null;
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            emailSequences: true,
          },
        }),
        prisma.lead.count({ where }),
      ]);

      return {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Get lead stats
  stats: adminProcedure.query(async () => {
    const [total, bySource, converted, thisWeek] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ["source"],
        _count: true,
      }),
      prisma.lead.count({ where: { convertedAt: { not: null } } }),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      converted,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : "0",
      thisWeek,
      bySource: bySource.reduce(
        (acc, item) => {
          acc[item.source] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),

  // Admin: A/B Test results
  abTestResults: adminProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      const results = await prisma.aBTestEvent.groupBy({
        by: ["variant"],
        where: { testId: input.testId },
        _count: true,
        _sum: {
          // converted is boolean, count manually
        },
      });

      // Get conversion counts separately
      const conversions = await Promise.all(
        results.map(async (r) => {
          const converted = await prisma.aBTestEvent.count({
            where: {
              testId: input.testId,
              variant: r.variant,
              converted: true,
            },
          });
          return {
            variant: r.variant,
            total: r._count,
            converted,
            conversionRate:
              r._count > 0 ? ((converted / r._count) * 100).toFixed(2) : "0",
          };
        })
      );

      return conversions;
    }),
});

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

export const emailRouter = createTRPCRouter({
  // Admin: Email loglarını listele
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z
          .enum(["PENDING", "SENT", "DELIVERED", "FAILED", "BOUNCED", "COMPLAINED", "OPENED", "CLICKED"])
          .optional(),
        type: z
          .enum([
            "VERIFICATION",
            "RESET_PASSWORD",
            "WELCOME",
            "INVOICE",
            "TICKET_REPLY",
            "ORG_INVITE",
            "SECURITY_ALERT",
            "MARKETING",
            "SYSTEM_ALERT",
          ])
          .optional(),
        search: z.string().optional(),
        userId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.EmailLogWhereInput = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.userId) {
        where.userId = input.userId;
      }

      if (input.search) {
        where.OR = [
          { recipient: { contains: input.search, mode: "insensitive" } },
          { subject: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.dateFrom || input.dateTo) {
        where.sentAt = {};
        if (input.dateFrom) {
          where.sentAt.gte = input.dateFrom;
        }
        if (input.dateTo) {
          where.sentAt.lte = input.dateTo;
        }
      }

      const [logs, total] = await Promise.all([
        prisma.emailLog.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { sentAt: "desc" },
          select: {
            id: true,
            userId: true,
            type: true,
            recipient: true,
            subject: true,
            status: true,
            error: true,
            openedAt: true,
            clickedAt: true,
            deliveredAt: true,
            bouncedAt: true,
            sentAt: true,
          },
        }),
        prisma.emailLog.count({ where }),
      ]);

      return {
        logs,
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Admin: Email istatistikleri
  adminStats: adminProcedure
    .input(
      z.object({
        period: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "day":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const [
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        byType,
      ] = await Promise.all([
        prisma.emailLog.count({
          where: { sentAt: { gte: startDate } },
        }),
        prisma.emailLog.count({
          where: {
            sentAt: { gte: startDate },
            status: { in: ["DELIVERED", "OPENED", "CLICKED"] },
          },
        }),
        prisma.emailLog.count({
          where: {
            sentAt: { gte: startDate },
            status: { in: ["OPENED", "CLICKED"] },
          },
        }),
        prisma.emailLog.count({
          where: { sentAt: { gte: startDate }, status: "CLICKED" },
        }),
        prisma.emailLog.count({
          where: { sentAt: { gte: startDate }, status: "BOUNCED" },
        }),
        prisma.emailLog.count({
          where: {
            sentAt: { gte: startDate },
            status: { in: ["FAILED", "BOUNCED", "COMPLAINED"] },
          },
        }),
        prisma.emailLog.groupBy({
          by: ["type"],
          where: { sentAt: { gte: startDate } },
          _count: true,
        }),
      ]);

      return {
        period: input.period,
        startDate,
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        bounceRate: totalSent > 0 ? Math.round((bounced / totalSent) * 100) : 0,
        byType: byType.reduce(
          (acc, item) => {
            acc[item.type] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    }),

  // Admin: Tek email detayı
  adminGet: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const log = await prisma.emailLog.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!log) {
        return null;
      }

      return {
        ...log,
        metadata: log.metadata as Record<string, unknown> | null,
      };
    }),

  // Admin: Email yeniden gönder
  adminResend: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const log = await prisma.emailLog.findUnique({
        where: { id: input.id },
      });

      if (!log) {
        return { success: false, message: "Email bulunamadı" };
      }

      // TODO: Resend API ile tekrar gönder
      // Şimdilik sadece status'u PENDING yap
      await prisma.emailLog.update({
        where: { id: input.id },
        data: { status: "PENDING" },
      });

      return { success: true, message: "Email tekrar gönderilmek üzere kuyruğa alındı" };
    }),
});

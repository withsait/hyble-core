/**
 * Support Ticket Router
 * FAZ3-2: Destek talebi sistemi
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { createSupportNotification } from "./notification";

// Generate ticket reference number
function generateTicketRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${dateStr}-${random}`;
}

export const supportRouter = createTRPCRouter({
  // ==================== USER PROCEDURES ====================

  /**
   * Get user's tickets
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        status: z.enum([
          "OPEN",
          "AWAITING_REPLY",
          "IN_PROGRESS",
          "ON_HOLD",
          "RESOLVED",
          "CLOSED",
        ]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status } = input;

      const tickets = await prisma.ticket.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(status && { status }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (tickets.length > limit) {
        const nextItem = tickets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        tickets,
        nextCursor,
      };
    }),

  /**
   * Get ticket by reference number
   */
  getByRef: protectedProcedure
    .input(z.object({ referenceNo: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await prisma.ticket.findFirst({
        where: {
          referenceNo: input.referenceNo,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            where: { isInternal: false }, // Don't show internal notes to users
            orderBy: { createdAt: "asc" },
            include: {
              attachments: true,
            },
          },
          attachments: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      return ticket;
    }),

  /**
   * Create new ticket
   */
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5).max(200),
        category: z.enum([
          "BILLING",
          "TECHNICAL",
          "ACCOUNT",
          "SALES",
          "FEEDBACK",
          "BUG_REPORT",
          "FEATURE_REQUEST",
          "OTHER",
        ]),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
        message: z.string().min(10).max(10000),
        relatedOrderId: z.string().optional(),
        relatedProductId: z.string().optional(),
        relatedSubscriptionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const referenceNo = generateTicketRef();

      const ticket = await prisma.ticket.create({
        data: {
          referenceNo,
          userId: ctx.session.user.id,
          subject: input.subject,
          category: input.category,
          priority: input.priority,
          relatedOrderId: input.relatedOrderId,
          relatedProductId: input.relatedProductId,
          relatedSubscriptionId: input.relatedSubscriptionId,
          messages: {
            create: {
              authorId: ctx.session.user.id,
              authorType: "user",
              authorName: ctx.session.user.name,
              content: input.message,
            },
          },
        },
        include: {
          messages: true,
        },
      });

      // TODO: Send email notification to support team

      return { ticket, referenceNo };
    }),

  /**
   * Add message to ticket
   */
  addMessage: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ticket ownership
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: input.ticketId,
          userId: ctx.session.user.id,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      // Check if ticket is closed
      if (ticket.status === "CLOSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kapatılmış taleplere mesaj eklenemez",
        });
      }

      // Create message and update ticket status
      const [ticketMessage] = await prisma.$transaction([
        prisma.ticketMessage.create({
          data: {
            ticketId: input.ticketId,
            authorId: ctx.session.user.id,
            authorType: "user",
            authorName: ctx.session.user.name,
            content: input.message,
          },
        }),
        prisma.ticket.update({
          where: { id: input.ticketId },
          data: {
            status: "OPEN", // Reopen if was awaiting reply
            updatedAt: new Date(),
          },
        }),
      ]);

      // TODO: Send email notification to assigned admin

      return { message: ticketMessage };
    }),

  /**
   * Close ticket
   */
  close: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: input.ticketId,
          userId: ctx.session.user.id,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Reopen ticket
   */
  reopen: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: input.ticketId,
          userId: ctx.session.user.id,
          status: "CLOSED",
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı veya zaten açık",
        });
      }

      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          status: "OPEN",
          closedAt: null,
        },
      });

      return { success: true };
    }),

  /**
   * Rate ticket (after resolution)
   */
  rate: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: input.ticketId,
          userId: ctx.session.user.id,
          status: { in: ["RESOLVED", "CLOSED"] },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı veya henüz çözülmedi",
        });
      }

      if (ticket.rating) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu talep zaten değerlendirilmiş",
        });
      }

      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          rating: input.rating,
          ratingComment: input.comment,
          ratedAt: new Date(),
        },
      });

      return { success: true };
    }),

  // ==================== ADMIN PROCEDURES ====================

  /**
   * Get all tickets (Admin)
   */
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.enum([
          "OPEN",
          "AWAITING_REPLY",
          "IN_PROGRESS",
          "ON_HOLD",
          "RESOLVED",
          "CLOSED",
        ]).optional(),
        category: z.enum([
          "BILLING",
          "TECHNICAL",
          "ACCOUNT",
          "SALES",
          "FEEDBACK",
          "BUG_REPORT",
          "FEATURE_REQUEST",
          "OTHER",
        ]).optional(),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
        assignedTo: z.string().optional(),
        unassigned: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, status, category, priority, assignedTo, unassigned, search } = input;

      const where = {
        ...(status && { status }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo }),
        ...(unassigned && { assignedTo: null }),
        ...(search && {
          OR: [
            { referenceNo: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const tickets = await prisma.ticket.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (tickets.length > limit) {
        const nextItem = tickets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        tickets,
        nextCursor,
      };
    }),

  /**
   * Get ticket by ID (Admin)
   */
  adminGetById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              attachments: true,
            },
          },
          attachments: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: ticket.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });

      return { ticket, user };
    }),

  /**
   * Assign ticket (Admin)
   */
  assign: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        assignedTo: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          assignedTo: input.assignedTo,
          assignedAt: input.assignedTo ? new Date() : null,
          status: input.assignedTo ? "IN_PROGRESS" : "OPEN",
        },
      });

      return { success: true };
    }),

  /**
   * Update ticket status (Admin)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum([
          "OPEN",
          "AWAITING_REPLY",
          "IN_PROGRESS",
          "ON_HOLD",
          "RESOLVED",
          "CLOSED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      }

      if (input.status === "CLOSED") {
        updateData.closedAt = new Date();
      }

      const ticket = await prisma.ticket.update({
        where: { id: input.ticketId },
        data: updateData,
      });

      // Notify user
      if (input.status === "RESOLVED") {
        await createSupportNotification(
          ticket.userId,
          "Destek Talebiniz Çözüldü",
          `${ticket.referenceNo} numaralı destek talebiniz çözüldü. Lütfen değerlendirme yapınız.`,
          ticket.referenceNo
        );
      }

      return { success: true };
    }),

  /**
   * Update ticket priority (Admin)
   */
  updatePriority: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: { priority: input.priority },
      });

      return { success: true };
    }),

  /**
   * Add admin reply (Admin)
   */
  adminReply: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(1).max(10000),
        isInternal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      // Create message
      const ticketMessage = await prisma.ticketMessage.create({
        data: {
          ticketId: input.ticketId,
          authorId: ctx.session.user.id,
          authorType: "admin",
          authorName: ctx.session.user.name || "Destek Ekibi",
          content: input.message,
          isInternal: input.isInternal,
        },
      });

      // Update ticket status and first response time
      const updateData: Record<string, unknown> = {
        status: input.isInternal ? ticket.status : "AWAITING_REPLY",
        updatedAt: new Date(),
      };

      if (!ticket.firstResponseAt && !input.isInternal) {
        updateData.firstResponseAt = new Date();
      }

      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: updateData,
      });

      // Notify user if not internal
      if (!input.isInternal) {
        await createSupportNotification(
          ticket.userId,
          "Destek Talebinize Yanıt Geldi",
          `${ticket.referenceNo} numaralı destek talebinize yanıt verildi.`,
          ticket.referenceNo
        );

        // TODO: Send email notification
      }

      return { message: ticketMessage };
    }),

  /**
   * Add tags to ticket (Admin)
   */
  addTags: adminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.ticketId },
        select: { tags: true },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destek talebi bulunamadı",
        });
      }

      const newTags = [...new Set([...ticket.tags, ...input.tags])];

      await prisma.ticket.update({
        where: { id: input.ticketId },
        data: { tags: newTags },
      });

      return { success: true };
    }),

  /**
   * Get ticket stats (Admin)
   */
  stats: adminProcedure.query(async () => {
    const [total, open, inProgress, resolved, avgResponseTime, avgRating] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.ticket.aggregate({
        where: { firstResponseAt: { not: null } },
        _avg: {
          // Calculate average response time would need raw SQL
        },
      }),
      prisma.ticket.aggregate({
        where: { rating: { not: null } },
        _avg: { rating: true },
      }),
    ]);

    const byCategory = await prisma.ticket.groupBy({
      by: ["category"],
      _count: true,
    });

    const byPriority = await prisma.ticket.groupBy({
      by: ["priority"],
      _count: true,
    });

    return {
      total,
      open,
      inProgress,
      resolved,
      avgRating: avgRating._avg.rating,
      byCategory: byCategory.reduce(
        (acc, item) => {
          acc[item.category] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPriority: byPriority.reduce(
        (acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),
});

export default supportRouter;

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

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

export const invoiceRouter = createTRPCRouter({
  // Faturaları listele
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
        year: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.InvoiceWhereInput = {
        userId: ctx.user.id,
      };

      if (input.status) {
        where.status = input.status;
      }

      if (input.year) {
        where.createdAt = {
          gte: new Date(input.year, 0, 1),
          lt: new Date(input.year + 1, 0, 1),
        };
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.invoice.count({ where }),
      ]);

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
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Tek fatura detayı
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          transaction: {
            select: {
              id: true,
              type: true,
              paymentMethod: true,
              createdAt: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura bulunamadı",
        });
      }

      // User bilgilerini al
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true, email: true },
      });

      // items JSON olarak saklanıyor
      const items = invoice.items as Array<{
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;

      // billingAddress JSON olarak saklanıyor
      const billingAddress = invoice.billingAddress as {
        line1: string;
        line2?: string;
        city: string;
        postalCode: string;
        country: string;
      } | null;

      return {
        id: invoice.id,
        number: invoice.invoiceNumber,
        status: invoice.status as "DRAFT" | "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED",
        subtotal: parseFloat(invoice.subtotal.toString()),
        taxRate: parseFloat(invoice.taxRate.toString()),
        taxAmount: parseFloat(invoice.taxAmount.toString()),
        total: parseFloat(invoice.total.toString()),
        discount: 0, // Discount invoice'da tutulmuyorsa 0
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
        notes: invoice.notes,
        items: items || [],
        billingName: user?.name || null,
        billingAddress,
        user: {
          name: user?.name || null,
          email: user?.email || "",
        },
        transaction: invoice.transaction
          ? {
              id: invoice.transaction.id,
              type: invoice.transaction.type,
              paymentMethod: invoice.transaction.paymentMethod,
              createdAt: invoice.transaction.createdAt,
            }
          : null,
      };
    }),

  // PDF indirme URL'i oluştur (placeholder - gerçek PDF generation daha sonra)
  downloadPDF: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      // TODO: Gerçek PDF generation implementasyonu
      // Şimdilik placeholder URL döndür
      return {
        url: `/api/invoices/${invoice.id}/pdf`,
        filename: `${invoice.invoiceNumber}.pdf`,
      };
    }),

  // Fatura yıllarını listele (filtre için)
  getYears: protectedProcedure.query(async ({ ctx }) => {
    const invoices = await prisma.invoice.findMany({
      where: { userId: ctx.user.id },
      select: { createdAt: true },
      distinct: ["createdAt"],
      orderBy: { createdAt: "desc" },
    });

    const years = [...new Set(invoices.map((inv) => inv.createdAt.getFullYear()))];
    return years;
  }),

  // Fatura özeti (dashboard için)
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalPaid,
      totalPending,
    ] = await Promise.all([
      prisma.invoice.count({ where: { userId: ctx.user.id } }),
      prisma.invoice.count({ where: { userId: ctx.user.id, status: "PAID" } }),
      prisma.invoice.count({ where: { userId: ctx.user.id, status: "PENDING" } }),
      prisma.invoice.count({
        where: {
          userId: ctx.user.id,
          status: "PENDING",
          dueDate: { lt: new Date() },
        },
      }),
      prisma.invoice.aggregate({
        where: { userId: ctx.user.id, status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { userId: ctx.user.id, status: "PENDING" },
        _sum: { total: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalPaid: totalPaid._sum.total?.toString() || "0",
      totalPending: totalPending._sum.total?.toString() || "0",
    };
  }),

  // ==================== ADMIN ENDPOINTS ====================

  // Tüm faturaları listele (admin)
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
        userId: z.string().optional(),
        search: z.string().optional(), // Invoice number search
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.InvoiceWhereInput = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.userId) {
        where.userId = input.userId;
      }

      if (input.search) {
        where.invoiceNumber = { contains: input.search.toUpperCase() };
      }

      if (input.dateFrom || input.dateTo) {
        where.createdAt = {};
        if (input.dateFrom) {
          where.createdAt.gte = input.dateFrom;
        }
        if (input.dateTo) {
          where.createdAt.lte = input.dateTo;
        }
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.invoice.count({ where }),
      ]);

      return {
        invoices: invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          userId: inv.userId,
          status: inv.status,
          total: inv.total.toString(),
          currency: inv.currency,
          dueDate: inv.dueDate,
          paidAt: inv.paidAt,
          createdAt: inv.createdAt,
        })),
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  // Manuel fatura oluştur
  adminCreate: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            quantity: z.number().min(1),
            unitPrice: z.number().positive(),
          })
        ),
        taxRate: z.number().min(0).max(100).default(20),
        currency: z.string().default("EUR"),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
        billingAddress: z
          .object({
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            postalCode: z.string(),
            country: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Kullanıcı kontrolü
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Hesaplamalar
      const items = input.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = (subtotal * input.taxRate) / 100;
      const total = subtotal + taxAmount;

      // Fatura numarası oluştur
      const invoiceNumber = await generateInvoiceNumber();

      // Fatura oluştur
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: input.userId,
          status: "PENDING",
          subtotal,
          taxRate: input.taxRate,
          taxAmount,
          total,
          currency: input.currency,
          dueDate: input.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 gün
          notes: input.notes,
          billingAddress: input.billingAddress,
          items,
        },
      });

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      };
    }),

  // Fatura durumunu güncelle
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]),
        paidAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const invoice = await prisma.invoice.findUnique({
        where: { id: input.id },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura bulunamadı",
        });
      }

      const updateData: Prisma.InvoiceUpdateInput = {
        status: input.status,
      };

      if (input.status === "PAID") {
        updateData.paidAt = input.paidAt || new Date();
      }

      await prisma.invoice.update({
        where: { id: input.id },
        data: updateData,
      });

      return { success: true };
    }),

  // Fatura sil (sadece DRAFT durumunda)
  adminDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const invoice = await prisma.invoice.findUnique({
        where: { id: input.id },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura bulunamadı",
        });
      }

      if (invoice.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sadece taslak faturalar silinebilir",
        });
      }

      await prisma.invoice.delete({ where: { id: input.id } });

      return { success: true };
    }),

  // Fatura istatistikleri (admin dashboard)
  adminStats: adminProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "year"]).default("month"),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const [
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        cancelledInvoices,
        totalRevenue,
        pendingRevenue,
      ] = await Promise.all([
        prisma.invoice.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.invoice.count({
          where: { createdAt: { gte: startDate }, status: "PAID" },
        }),
        prisma.invoice.count({
          where: { createdAt: { gte: startDate }, status: "PENDING" },
        }),
        prisma.invoice.count({
          where: {
            createdAt: { gte: startDate },
            status: "PENDING",
            dueDate: { lt: now },
          },
        }),
        prisma.invoice.count({
          where: { createdAt: { gte: startDate }, status: "CANCELLED" },
        }),
        prisma.invoice.aggregate({
          where: { createdAt: { gte: startDate }, status: "PAID" },
          _sum: { total: true },
        }),
        prisma.invoice.aggregate({
          where: { createdAt: { gte: startDate }, status: "PENDING" },
          _sum: { total: true },
        }),
      ]);

      return {
        period: input.period,
        startDate,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        cancelledInvoices,
        totalRevenue: totalRevenue._sum.total?.toString() || "0",
        pendingRevenue: pendingRevenue._sum.total?.toString() || "0",
        collectionRate: totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0,
      };
    }),
});

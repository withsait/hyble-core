// InvoiceService - Fatura yönetimi
import { prisma, Prisma, type BillingInvoice, type BillingInvoiceStatus } from "@hyble/db";
import type {
  CreateInvoiceInput,
  InvoiceItemInput,
  PaginationParams,
  PaginatedResult,
  Currency,
} from "./types";
import { taxService } from "./TaxService";
import { couponService } from "./CouponService";

export interface InvoiceFilters {
  customerId?: string;
  status?: BillingInvoiceStatus;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export class InvoiceService {
  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const prefix = `HYB-${year}${month}`;

    const lastInvoice = await prisma.billingInvoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
    });

    let sequence = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split("-");
      const lastSequence = parseInt(parts[parts.length - 1] || "0");
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(5, "0")}`;
  }

  /**
   * Create a new invoice
   */
  async create(input: CreateInvoiceInput): Promise<BillingInvoice> {
    const customer = await prisma.billingCustomer.findUnique({
      where: { id: input.customerId },
      include: { addresses: { where: { isDefault: true, type: "billing" }, take: 1 } },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const currency = customer.currencyCode as Currency;

    // Calculate items with tax
    let subtotal = 0;
    let totalTax = 0;
    let discount = 0;

    const processedItems: Array<{
      description: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      taxable: boolean;
      taxRate: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      discountAmount: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      total: Prisma.Decimal;
      serviceId?: string;
      periodStart?: Date;
      periodEnd?: Date;
    }> = [];

    for (const item of input.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      // Calculate tax for this item
      let taxRate = 0;
      let taxAmount = 0;

      if (item.taxable !== false) {
        const taxResult = await taxService.calculate({
          subtotal: itemSubtotal,
          country: customer.country || "TR",
          isExempt: customer.taxExempt,
          vatNumber: customer.vatNumber || undefined,
        });
        taxRate = taxResult.taxRate;
        taxAmount = taxResult.taxAmount;
        totalTax += taxAmount;
      }

      processedItems.push({
        description: item.description,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        taxable: item.taxable !== false,
        taxRate: new Prisma.Decimal(taxRate),
        taxAmount: new Prisma.Decimal(taxAmount),
        discountAmount: new Prisma.Decimal(0),
        subtotal: new Prisma.Decimal(itemSubtotal),
        total: new Prisma.Decimal(itemSubtotal + taxAmount),
        serviceId: item.serviceId,
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
      });
    }

    // Apply coupon if provided
    if (input.couponCode) {
      const couponResult = await couponService.validate({
        code: input.couponCode,
        customerId: input.customerId,
        subtotal,
      });

      if (couponResult.valid && couponResult.discountAmount) {
        discount = couponResult.discountAmount;
      }
    }

    const total = subtotal + totalTax - discount;
    const dueDate = input.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    // Create invoice with items
    return prisma.billingInvoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        subtotal: new Prisma.Decimal(subtotal),
        taxTotal: new Prisma.Decimal(totalTax),
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(total),
        amountPaid: new Prisma.Decimal(0),
        balance: new Prisma.Decimal(total),
        currencyCode: currency,
        status: "PENDING",
        issueDate: new Date(),
        dueDate,
        notes: input.notes,
        couponCode: input.couponCode,
        billingAddress: customer.addresses[0]
          ? {
              line1: customer.addresses[0].line1,
              line2: customer.addresses[0].line2,
              city: customer.addresses[0].city,
              state: customer.addresses[0].state,
              postalCode: customer.addresses[0].postalCode,
              country: customer.addresses[0].country,
            }
          : Prisma.JsonNull,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });
  }

  /**
   * Get invoice by ID
   */
  async getById(id: string): Promise<BillingInvoice | null> {
    return prisma.billingInvoice.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
        customer: true,
      },
    });
  }

  /**
   * Get invoice by invoice number
   */
  async getByNumber(invoiceNumber: string): Promise<BillingInvoice | null> {
    return prisma.billingInvoice.findUnique({
      where: { invoiceNumber },
      include: {
        items: true,
        payments: true,
        customer: true,
      },
    });
  }

  /**
   * List invoices with filters and pagination
   */
  async list(
    params: PaginationParams & InvoiceFilters
  ): Promise<PaginatedResult<BillingInvoice>> {
    const { limit = 20, offset = 0, customerId, status, fromDate, toDate, minAmount, maxAmount } = params;

    const where: Prisma.BillingInvoiceWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(fromDate && { issueDate: { gte: fromDate } }),
      ...(toDate && { issueDate: { lte: toDate } }),
      ...(minAmount && { total: { gte: minAmount } }),
      ...(maxAmount && { total: { lte: maxAmount } }),
    };

    const [items, total] = await Promise.all([
      prisma.billingInvoice.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true, companyName: true },
          },
          _count: { select: { items: true, payments: true } },
        },
      }),
      prisma.billingInvoice.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: BillingInvoiceStatus, paidDate?: Date): Promise<BillingInvoice> {
    return prisma.billingInvoice.update({
      where: { id },
      data: {
        status,
        ...(status === "PAID" && { paidDate: paidDate || new Date() }),
      },
    });
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, amountPaid: number): Promise<BillingInvoice> {
    const invoice = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const totalPaid = parseFloat(invoice.amountPaid.toString()) + amountPaid;
    const balance = parseFloat(invoice.total.toString()) - totalPaid;

    let status: BillingInvoiceStatus = invoice.status;
    if (balance <= 0) {
      status = "PAID";
    } else if (totalPaid > 0) {
      status = "PARTIALLY_PAID";
    }

    return prisma.billingInvoice.update({
      where: { id },
      data: {
        amountPaid: new Prisma.Decimal(totalPaid),
        balance: new Prisma.Decimal(Math.max(0, balance)),
        status,
        ...(status === "PAID" && { paidDate: new Date() }),
      },
    });
  }

  /**
   * Cancel invoice
   */
  async cancel(id: string, reason?: string): Promise<BillingInvoice> {
    const invoice = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "PAID") {
      throw new Error("Cannot cancel a paid invoice");
    }

    return prisma.billingInvoice.update({
      where: { id },
      data: {
        status: "CANCELLED",
        adminNotes: reason ? `Cancelled: ${reason}` : undefined,
      },
    });
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(): Promise<BillingInvoice[]> {
    return prisma.billingInvoice.findMany({
      where: {
        status: "PENDING",
        dueDate: { lt: new Date() },
      },
      include: {
        customer: true,
      },
    });
  }

  /**
   * Mark overdue invoices
   */
  async markOverdueInvoices(): Promise<number> {
    const result = await prisma.billingInvoice.updateMany({
      where: {
        status: "PENDING",
        dueDate: { lt: new Date() },
      },
      data: {
        status: "OVERDUE",
      },
    });

    return result.count;
  }

  /**
   * Add item to existing invoice
   */
  async addItem(invoiceId: string, item: InvoiceItemInput) {
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status !== "DRAFT" && invoice.status !== "PENDING") {
      throw new Error("Cannot modify invoice in current status");
    }

    const itemSubtotal = item.quantity * item.unitPrice;
    let taxRate = 0;
    let taxAmount = 0;

    if (item.taxable !== false) {
      const taxResult = await taxService.calculate({
        subtotal: itemSubtotal,
        country: invoice.customer.country || "TR",
        isExempt: invoice.customer.taxExempt,
      });
      taxRate = taxResult.taxRate;
      taxAmount = taxResult.taxAmount;
    }

    const newItem = await prisma.billingInvoiceItem.create({
      data: {
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        taxable: item.taxable !== false,
        taxRate: new Prisma.Decimal(taxRate),
        taxAmount: new Prisma.Decimal(taxAmount),
        discountAmount: new Prisma.Decimal(0),
        subtotal: new Prisma.Decimal(itemSubtotal),
        total: new Prisma.Decimal(itemSubtotal + taxAmount),
        serviceId: item.serviceId,
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
      },
    });

    // Recalculate invoice totals
    await this.recalculateTotals(invoiceId);

    return newItem;
  }

  /**
   * Recalculate invoice totals
   */
  async recalculateTotals(invoiceId: string) {
    const items = await prisma.billingInvoiceItem.findMany({
      where: { invoiceId },
    });

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);
    const taxTotal = items.reduce((sum, item) => sum + parseFloat(item.taxAmount.toString()), 0);
    const invoice = await prisma.billingInvoice.findUnique({ where: { id: invoiceId } });
    const discount = parseFloat(invoice?.discount.toString() || "0");
    const amountPaid = parseFloat(invoice?.amountPaid.toString() || "0");
    const total = subtotal + taxTotal - discount;
    const balance = total - amountPaid;

    await prisma.billingInvoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        taxTotal: new Prisma.Decimal(taxTotal),
        total: new Prisma.Decimal(total),
        balance: new Prisma.Decimal(balance),
      },
    });
  }

  /**
   * Get invoice summary stats
   */
  async getStats(customerId?: string) {
    const where = customerId ? { customerId } : {};

    const [pending, paid, overdue, totalRevenue] = await Promise.all([
      prisma.billingInvoice.count({ where: { ...where, status: "PENDING" } }),
      prisma.billingInvoice.count({ where: { ...where, status: "PAID" } }),
      prisma.billingInvoice.count({ where: { ...where, status: "OVERDUE" } }),
      prisma.billingInvoice.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { total: true },
      }),
    ]);

    return {
      pending,
      paid,
      overdue,
      totalRevenue: parseFloat(totalRevenue._sum.total?.toString() || "0"),
    };
  }
}

// Singleton instance
export const invoiceService = new InvoiceService();

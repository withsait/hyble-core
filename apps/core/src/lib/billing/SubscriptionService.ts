// SubscriptionService - Abonelik yönetimi
import { prisma, Prisma, type BillingService, type BillingServiceStatus, type BillingCycle } from "@hyble/db";
import type {
  CreateSubscriptionInput,
  BillingCycleType,
  PaginationParams,
  PaginatedResult,
} from "./types";
import { getNextDueDate } from "./types";
import { invoiceService } from "./InvoiceService";

export interface SubscriptionFilters {
  customerId?: string;
  status?: BillingServiceStatus;
  vertical?: string;
  productId?: string;
}

export interface RenewSubscriptionInput {
  serviceId: string;
  generateInvoice?: boolean;
}

export class SubscriptionService {
  /**
   * Create a new subscription/service
   */
  async create(input: CreateSubscriptionInput): Promise<BillingService> {
    // Get product info
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const startDate = input.startDate || new Date();
    const nextDueDate = getNextDueDate(startDate, input.billingCycle);
    const price = parseFloat(product.basePrice?.toString() || "0");

    return prisma.billingService.create({
      data: {
        customerId: input.customerId,
        productId: input.productId,
        billingCycle: input.billingCycle as BillingCycle,
        amount: new Prisma.Decimal(price),
        currencyCode: product.currency,
        startDate,
        nextDueDate,
        status: "ACTIVE",
        vertical: "hyble", // Can be derived from product
        configOptions: input.configOptions ? (input.configOptions as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  /**
   * Get service by ID
   */
  async getById(id: string): Promise<BillingService | null> {
    return prisma.billingService.findUnique({
      where: { id },
      include: {
        customer: true,
        invoiceItems: {
          include: {
            invoice: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  }

  /**
   * List services with filters
   */
  async list(
    params: PaginationParams & SubscriptionFilters
  ): Promise<PaginatedResult<BillingService>> {
    const { limit = 20, offset = 0, customerId, status, vertical, productId } = params;

    const where: Prisma.BillingServiceWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(vertical && { vertical }),
      ...(productId && { productId }),
    };

    const [items, total] = await Promise.all([
      prisma.billingService.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.billingService.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Get services due for renewal
   */
  async getDueForRenewal(daysAhead: number = 0): Promise<BillingService[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    return prisma.billingService.findMany({
      where: {
        status: "ACTIVE",
        nextDueDate: { lte: targetDate },
      },
      include: {
        customer: true,
      },
    });
  }

  /**
   * Renew subscription
   */
  async renew(input: RenewSubscriptionInput): Promise<{
    service: BillingService;
    invoice?: Awaited<ReturnType<typeof invoiceService.create>>;
  }> {
    const service = await prisma.billingService.findUnique({
      where: { id: input.serviceId },
      include: { customer: true },
    });

    if (!service) {
      throw new Error("Service not found");
    }

    if (service.status !== "ACTIVE") {
      throw new Error("Service is not active");
    }

    const currentDueDate = service.nextDueDate;
    const newDueDate = getNextDueDate(currentDueDate, service.billingCycle as BillingCycleType);

    // Update service
    const updatedService = await prisma.billingService.update({
      where: { id: service.id },
      data: {
        nextDueDate: newDueDate,
      },
    });

    // Generate invoice if requested
    let invoice;
    if (input.generateInvoice) {
      invoice = await invoiceService.create({
        customerId: service.customerId,
        items: [
          {
            description: `Subscription renewal: ${service.identifier || service.productId}`,
            quantity: 1,
            unitPrice: parseFloat(service.amount.toString()),
            serviceId: service.id,
            periodStart: currentDueDate,
            periodEnd: newDueDate,
          },
        ],
        dueDate: currentDueDate,
      });
    }

    return { service: updatedService, invoice };
  }

  /**
   * Suspend service
   */
  async suspend(id: string, reason?: string): Promise<BillingService> {
    return prisma.billingService.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        adminNotes: reason ? `Suspended: ${reason}` : undefined,
      },
    });
  }

  /**
   * Reactivate service
   */
  async reactivate(id: string): Promise<BillingService> {
    const service = await prisma.billingService.findUnique({ where: { id } });

    if (!service) {
      throw new Error("Service not found");
    }

    if (service.status !== "SUSPENDED") {
      throw new Error("Service is not suspended");
    }

    return prisma.billingService.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });
  }

  /**
   * Cancel service
   */
  async cancel(id: string, reason?: string, immediate: boolean = false): Promise<BillingService> {
    const service = await prisma.billingService.findUnique({ where: { id } });

    if (!service) {
      throw new Error("Service not found");
    }

    const terminationDate = immediate ? new Date() : service.nextDueDate;

    return prisma.billingService.update({
      where: { id },
      data: {
        status: "CANCELLED",
        terminationDate,
        adminNotes: reason ? `Cancelled: ${reason}` : undefined,
      },
    });
  }

  /**
   * Update service configuration
   */
  async updateConfig(
    id: string,
    configOptions: Record<string, unknown>
  ): Promise<BillingService> {
    return prisma.billingService.update({
      where: { id },
      data: {
        configOptions: configOptions as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Change billing cycle
   */
  async changeBillingCycle(
    id: string,
    newCycle: BillingCycleType,
    newAmount: number
  ): Promise<BillingService> {
    const service = await prisma.billingService.findUnique({ where: { id } });

    if (!service) {
      throw new Error("Service not found");
    }

    // Calculate prorated amount (optional)
    const nextDueDate = getNextDueDate(service.nextDueDate, newCycle);

    return prisma.billingService.update({
      where: { id },
      data: {
        billingCycle: newCycle as BillingCycle,
        amount: new Prisma.Decimal(newAmount),
        nextDueDate,
      },
    });
  }

  /**
   * Process expired services
   */
  async processExpired(): Promise<number> {
    const gracePeriodDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

    const result = await prisma.billingService.updateMany({
      where: {
        status: "ACTIVE",
        nextDueDate: { lt: cutoffDate },
      },
      data: {
        status: "SUSPENDED",
      },
    });

    return result.count;
  }

  /**
   * Generate renewal invoices
   */
  async generateRenewalInvoices(daysAhead: number = 7): Promise<number> {
    const services = await this.getDueForRenewal(daysAhead);
    let generatedCount = 0;

    for (const service of services) {
      try {
        // Check if invoice already exists for this period
        const existingInvoice = await prisma.billingInvoice.findFirst({
          where: {
            items: {
              some: {
                serviceId: service.id,
                periodStart: service.nextDueDate,
              },
            },
          },
        });

        if (existingInvoice) {
          continue;
        }

        await this.renew({
          serviceId: service.id,
          generateInvoice: true,
        });

        generatedCount++;
      } catch (error) {
        console.error(`Failed to generate renewal invoice for service ${service.id}:`, error);
      }
    }

    return generatedCount;
  }

  /**
   * Get subscription statistics
   */
  async getStats(customerId?: string) {
    const where = customerId ? { customerId } : {};

    const [active, suspended, cancelled, mrr] = await Promise.all([
      prisma.billingService.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.billingService.count({ where: { ...where, status: "SUSPENDED" } }),
      prisma.billingService.count({ where: { ...where, status: "CANCELLED" } }),
      prisma.billingService.aggregate({
        where: { ...where, status: "ACTIVE", billingCycle: "MONTHLY" },
        _sum: { amount: true },
      }),
    ]);

    return {
      active,
      suspended,
      cancelled,
      mrr: parseFloat(mrr._sum.amount?.toString() || "0"),
    };
  }
}

// Singleton instance
export const subscriptionService = new SubscriptionService();

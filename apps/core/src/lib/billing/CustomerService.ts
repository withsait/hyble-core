// CustomerService - Billing müşteri yönetimi
import { prisma, Prisma, type BillingCustomer, type CustomerStatus } from "@hyble/db";
import type { PaginationParams, PaginatedResult } from "./types";

export interface CreateCustomerInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  taxId?: string;
  vatNumber?: string;
  currencyCode?: string;
  language?: string;
  country?: string;
}

export interface UpdateCustomerInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
  vatNumber?: string;
  taxExempt?: boolean;
  currencyCode?: string;
  language?: string;
  country?: string;
}

export interface CreateAddressInput {
  type?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export class CustomerService {
  /**
   * Get or create a billing customer for a user
   */
  async getOrCreate(userId: string, userData?: Partial<CreateCustomerInput>): Promise<BillingCustomer> {
    let customer = await prisma.billingCustomer.findUnique({
      where: { userId },
    });

    if (!customer && userData) {
      customer = await this.create({
        userId,
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        ...userData,
      });
    }

    if (!customer) {
      throw new Error(`Billing customer not found for user ${userId}`);
    }

    return customer;
  }

  /**
   * Create a new billing customer
   */
  async create(input: CreateCustomerInput): Promise<BillingCustomer> {
    return prisma.billingCustomer.create({
      data: {
        userId: input.userId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        companyName: input.companyName,
        taxId: input.taxId,
        vatNumber: input.vatNumber,
        currencyCode: input.currencyCode || "EUR",
        language: input.language || "tr",
        country: input.country,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<BillingCustomer | null> {
    return prisma.billingCustomer.findUnique({
      where: { id },
      include: {
        addresses: true,
        billingWallet: true,
      },
    });
  }

  /**
   * Get customer by user ID
   */
  async getByUserId(userId: string): Promise<BillingCustomer | null> {
    return prisma.billingCustomer.findUnique({
      where: { userId },
      include: {
        addresses: true,
        billingWallet: true,
      },
    });
  }

  /**
   * Update customer
   */
  async update(id: string, input: UpdateCustomerInput): Promise<BillingCustomer> {
    return prisma.billingCustomer.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Update customer status
   */
  async updateStatus(id: string, status: CustomerStatus): Promise<BillingCustomer> {
    return prisma.billingCustomer.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * List customers with pagination
   */
  async list(
    params: PaginationParams & { status?: CustomerStatus; search?: string }
  ): Promise<PaginatedResult<BillingCustomer>> {
    const { limit = 20, offset = 0, status, search } = params;

    const where: Prisma.BillingCustomerWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.billingCustomer.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      }),
      prisma.billingCustomer.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Add address to customer
   */
  async addAddress(customerId: string, input: CreateAddressInput) {
    // If this is the first address or marked as default, unset other defaults
    if (input.isDefault) {
      await prisma.billingAddress.updateMany({
        where: { customerId, type: input.type || "billing" },
        data: { isDefault: false },
      });
    }

    return prisma.billingAddress.create({
      data: {
        customerId,
        type: input.type || "billing",
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault ?? false,
      },
    });
  }

  /**
   * Get customer addresses
   */
  async getAddresses(customerId: string, type?: string) {
    return prisma.billingAddress.findMany({
      where: {
        customerId,
        ...(type && { type }),
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, input: Partial<CreateAddressInput>) {
    const address = await prisma.billingAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    // Handle default flag
    if (input.isDefault) {
      await prisma.billingAddress.updateMany({
        where: { customerId: address.customerId, type: address.type, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return prisma.billingAddress.update({
      where: { id: addressId },
      data: input,
    });
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string) {
    return prisma.billingAddress.delete({
      where: { id: addressId },
    });
  }

  /**
   * Get customer statistics
   */
  async getStats(customerId: string) {
    const [invoiceStats, serviceCount, walletBalance] = await Promise.all([
      prisma.billingInvoice.aggregate({
        where: { customerId },
        _sum: { total: true, amountPaid: true },
        _count: true,
      }),
      prisma.billingService.count({
        where: { customerId, status: "ACTIVE" },
      }),
      prisma.billingWallet.findUnique({
        where: { customerId },
        select: { balance: true, promoBalance: true },
      }),
    ]);

    return {
      totalInvoices: invoiceStats._count,
      totalSpent: parseFloat(invoiceStats._sum.total?.toString() || "0"),
      totalPaid: parseFloat(invoiceStats._sum.amountPaid?.toString() || "0"),
      activeServices: serviceCount,
      walletBalance: parseFloat(walletBalance?.balance.toString() || "0"),
      promoBalance: parseFloat(walletBalance?.promoBalance.toString() || "0"),
    };
  }
}

// Singleton instance
export const customerService = new CustomerService();

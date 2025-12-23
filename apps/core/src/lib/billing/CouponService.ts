// CouponService - Kupon yönetimi
import { prisma, Prisma, type Coupon, type CouponType, type CouponStatus } from "@hyble/db";
import type { ValidateCouponInput, CouponValidationResult, PaginationParams, PaginatedResult } from "./types";

export interface CreateCouponInput {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerUser?: number;
  startsAt?: Date;
  expiresAt?: Date;
  productIds?: string[];
  categoryIds?: string[];
  excludeProductIds?: string[];
  userIds?: string[];
  campaign?: string;
  createdBy?: string;
}

export interface CouponFilters {
  status?: CouponStatus;
  type?: CouponType;
  search?: string;
  campaign?: string;
}

export class CouponService {
  /**
   * Validate a coupon code
   */
  async validate(input: ValidateCouponInput): Promise<CouponValidationResult> {
    const { code, customerId, productIds, subtotal } = input;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, error: "Coupon not found" };
    }

    // Check status
    if (coupon.status !== "ACTIVE") {
      return { valid: false, error: "Coupon is not active" };
    }

    // Check date range
    const now = new Date();
    if (coupon.startsAt > now) {
      return { valid: false, error: "Coupon is not yet valid" };
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, error: "Coupon has expired" };
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    // Check per-user limit
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: customerId },
    });

    if (userUsageCount >= coupon.usagePerUser) {
      return { valid: false, error: "You have already used this coupon" };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount.toString())) {
      const minAmount = parseFloat(coupon.minOrderAmount.toString());
      return {
        valid: false,
        error: `Minimum order amount is ${minAmount}`,
      };
    }

    // Check user restrictions
    if (coupon.userIds.length > 0 && !coupon.userIds.includes(customerId)) {
      return { valid: false, error: "Coupon is not valid for your account" };
    }

    // Check product restrictions
    if (productIds && productIds.length > 0) {
      if (coupon.productIds.length > 0) {
        const hasValidProduct = productIds.some((id) => coupon.productIds.includes(id));
        if (!hasValidProduct) {
          return { valid: false, error: "Coupon is not valid for these products" };
        }
      }

      if (coupon.excludeProductIds.length > 0) {
        const hasExcludedProduct = productIds.some((id) => coupon.excludeProductIds.includes(id));
        if (hasExcludedProduct) {
          return { valid: false, error: "Coupon is not valid for some products in cart" };
        }
      }
    }

    // Calculate discount
    let discountAmount = 0;
    const value = parseFloat(coupon.value.toString());

    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * value) / 100;

      // Apply max discount cap
      if (coupon.maxDiscount) {
        const maxDiscount = parseFloat(coupon.maxDiscount.toString());
        discountAmount = Math.min(discountAmount, maxDiscount);
      }
    } else if (coupon.type === "FIXED") {
      discountAmount = Math.min(value, subtotal);
    }

    return {
      valid: true,
      discountType: coupon.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
      discountValue: value,
      discountAmount,
    };
  }

  /**
   * Apply coupon to order (record usage)
   */
  async apply(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
          discountAmount: new Prisma.Decimal(discountAmount),
        },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);
  }

  /**
   * Create a new coupon
   */
  async create(input: CreateCouponInput): Promise<Coupon> {
    return prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        description: input.description,
        type: input.type as CouponType,
        value: new Prisma.Decimal(input.value),
        minOrderAmount: input.minOrderAmount ? new Prisma.Decimal(input.minOrderAmount) : null,
        maxDiscount: input.maxDiscount ? new Prisma.Decimal(input.maxDiscount) : null,
        usageLimit: input.usageLimit,
        usagePerUser: input.usagePerUser ?? 1,
        startsAt: input.startsAt ?? new Date(),
        expiresAt: input.expiresAt,
        productIds: input.productIds ?? [],
        categoryIds: input.categoryIds ?? [],
        excludeProductIds: input.excludeProductIds ?? [],
        userIds: input.userIds ?? [],
        campaign: input.campaign,
        createdBy: input.createdBy,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Get coupon by code
   */
  async getByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  /**
   * Get coupon by ID
   */
  async getById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          take: 10,
          orderBy: { usedAt: "desc" },
        },
        _count: {
          select: { usages: true },
        },
      },
    });
  }

  /**
   * List coupons with filters
   */
  async list(
    params: PaginationParams & CouponFilters
  ): Promise<PaginatedResult<Coupon>> {
    const { limit = 20, offset = 0, status, type, search, campaign } = params;

    const where: Prisma.CouponWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(campaign && { campaign }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { usages: true } },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Update coupon
   */
  async update(id: string, input: Partial<CreateCouponInput>): Promise<Coupon> {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...(input.code && { code: input.code.toUpperCase() }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.type && { type: input.type as CouponType }),
        ...(input.value !== undefined && { value: new Prisma.Decimal(input.value) }),
        ...(input.minOrderAmount !== undefined && {
          minOrderAmount: input.minOrderAmount ? new Prisma.Decimal(input.minOrderAmount) : null,
        }),
        ...(input.maxDiscount !== undefined && {
          maxDiscount: input.maxDiscount ? new Prisma.Decimal(input.maxDiscount) : null,
        }),
        ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
        ...(input.usagePerUser !== undefined && { usagePerUser: input.usagePerUser }),
        ...(input.startsAt && { startsAt: input.startsAt }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
        ...(input.productIds && { productIds: input.productIds }),
        ...(input.categoryIds && { categoryIds: input.categoryIds }),
        ...(input.excludeProductIds && { excludeProductIds: input.excludeProductIds }),
        ...(input.userIds && { userIds: input.userIds }),
        ...(input.campaign !== undefined && { campaign: input.campaign }),
      },
    });
  }

  /**
   * Update coupon status
   */
  async updateStatus(id: string, status: CouponStatus): Promise<Coupon> {
    return prisma.coupon.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete coupon
   */
  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({
      where: { id },
    });
  }

  /**
   * Generate random coupon code
   */
  generateCode(prefix?: string, length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}-${code}` : code;
  }

  /**
   * Bulk create coupons
   */
  async bulkCreate(
    baseInput: Omit<CreateCouponInput, "code">,
    count: number,
    prefix?: string
  ): Promise<Coupon[]> {
    const coupons: Coupon[] = [];

    for (let i = 0; i < count; i++) {
      let code = this.generateCode(prefix);

      // Ensure unique
      while (await this.getByCode(code)) {
        code = this.generateCode(prefix);
      }

      const coupon = await this.create({
        ...baseInput,
        code,
      });

      coupons.push(coupon);
    }

    return coupons;
  }

  /**
   * Check and update expired coupons
   */
  async processExpired(): Promise<number> {
    const result = await prisma.coupon.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: new Date() },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return result.count;
  }

  /**
   * Check and update depleted coupons
   */
  async processDepleted(): Promise<number> {
    // Find coupons that need to be checked
    const coupons = await prisma.coupon.findMany({
      where: {
        status: "ACTIVE",
        usageLimit: { not: null },
      },
    });

    let count = 0;
    for (const coupon of coupons) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { status: "DEPLETED" },
        });
        count++;
      }
    }

    return count;
  }

  /**
   * Get coupon statistics
   */
  async getStats() {
    const [total, active, expired, depleted, totalUsage, totalDiscount] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { status: "ACTIVE" } }),
      prisma.coupon.count({ where: { status: "EXPIRED" } }),
      prisma.coupon.count({ where: { status: "DEPLETED" } }),
      prisma.couponUsage.count(),
      prisma.couponUsage.aggregate({
        _sum: { discountAmount: true },
      }),
    ]);

    return {
      total,
      active,
      expired,
      depleted,
      totalUsage,
      totalDiscount: parseFloat(totalDiscount._sum.discountAmount?.toString() || "0"),
    };
  }
}

// Singleton instance
export const couponService = new CouponService();

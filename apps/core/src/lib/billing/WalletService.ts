// WalletService - Hyble Credits cüzdan yönetimi
import { prisma, Prisma, type BillingWallet, type BillingWalletTransaction, type BillingWalletTxType } from "@hyble/db";
import type { PaginationParams, PaginatedResult } from "./types";

export interface CreditInput {
  amount: number;
  type?: "CREDIT" | "PROMO" | "ADJUSTMENT" | "REFUND";
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface DebitInput {
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface TopUpInput {
  amount: number;
  paymentMethodId?: string;
  gatewayId?: string;
}

export class WalletService {
  /**
   * Get or create wallet for customer
   */
  async getOrCreate(customerId: string): Promise<BillingWallet> {
    let wallet = await prisma.billingWallet.findUnique({
      where: { customerId },
    });

    if (!wallet) {
      wallet = await prisma.billingWallet.create({
        data: {
          customerId,
          balance: new Prisma.Decimal(0),
          promoBalance: new Prisma.Decimal(0),
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(customerId: string): Promise<{
    balance: number;
    promoBalance: number;
    totalBalance: number;
  }> {
    const wallet = await this.getOrCreate(customerId);
    const balance = parseFloat(wallet.balance.toString());
    const promoBalance = parseFloat(wallet.promoBalance.toString());

    return {
      balance,
      promoBalance,
      totalBalance: balance + promoBalance,
    };
  }

  /**
   * Credit wallet (add funds)
   */
  async credit(
    customerId: string,
    input: CreditInput
  ): Promise<{ wallet: BillingWallet; transaction: BillingWalletTransaction }> {
    const wallet = await this.getOrCreate(customerId);
    const balanceBefore = parseFloat(wallet.balance.toString());
    const promoBefore = parseFloat(wallet.promoBalance.toString());

    const isPromo = input.type === "PROMO";
    const newBalance = isPromo ? balanceBefore : balanceBefore + input.amount;
    const newPromoBalance = isPromo ? promoBefore + input.amount : promoBefore;

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.billingWallet.update({
        where: { id: wallet.id },
        data: {
          balance: new Prisma.Decimal(newBalance),
          promoBalance: new Prisma.Decimal(newPromoBalance),
        },
      }),
      prisma.billingWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: (input.type || "CREDIT") as BillingWalletTxType,
          amount: new Prisma.Decimal(input.amount),
          balanceBefore: new Prisma.Decimal(balanceBefore + promoBefore),
          balanceAfter: new Prisma.Decimal(newBalance + newPromoBalance),
          description: input.description,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Debit wallet (spend funds)
   * Uses promo balance first, then regular balance
   */
  async debit(
    customerId: string,
    input: DebitInput
  ): Promise<{ wallet: BillingWallet; transaction: BillingWalletTransaction }> {
    const wallet = await this.getOrCreate(customerId);
    const balance = parseFloat(wallet.balance.toString());
    const promoBalance = parseFloat(wallet.promoBalance.toString());
    const totalBalance = balance + promoBalance;

    if (input.amount > totalBalance) {
      throw new Error(`Insufficient balance. Available: ${totalBalance}, Required: ${input.amount}`);
    }

    // Deduct from promo first, then regular balance
    let promoDeduction = 0;
    let regularDeduction = 0;

    if (promoBalance >= input.amount) {
      promoDeduction = input.amount;
    } else {
      promoDeduction = promoBalance;
      regularDeduction = input.amount - promoBalance;
    }

    const newBalance = balance - regularDeduction;
    const newPromoBalance = promoBalance - promoDeduction;

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.billingWallet.update({
        where: { id: wallet.id },
        data: {
          balance: new Prisma.Decimal(newBalance),
          promoBalance: new Prisma.Decimal(newPromoBalance),
        },
      }),
      prisma.billingWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT",
          amount: new Prisma.Decimal(-input.amount),
          balanceBefore: new Prisma.Decimal(totalBalance),
          balanceAfter: new Prisma.Decimal(newBalance + newPromoBalance),
          description: input.description,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Check if customer can afford amount
   */
  async canAfford(customerId: string, amount: number): Promise<boolean> {
    const { totalBalance } = await this.getBalance(customerId);
    return totalBalance >= amount;
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    customerId: string,
    params: PaginationParams & { type?: BillingWalletTxType }
  ): Promise<PaginatedResult<BillingWalletTransaction>> {
    const wallet = await this.getOrCreate(customerId);
    const { limit = 20, offset = 0, type } = params;

    const where: Prisma.BillingWalletTransactionWhereInput = {
      walletId: wallet.id,
      ...(type && { type }),
    };

    const [items, total] = await Promise.all([
      prisma.billingWalletTransaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.billingWalletTransaction.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Get credit packages for purchase
   */
  async getCreditPackages() {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { creditAmount: "asc" }],
    });
  }

  /**
   * Process credit package purchase
   */
  async purchaseCredits(
    customerId: string,
    packageId: string,
    paymentId?: string
  ): Promise<{ wallet: BillingWallet; creditsAdded: number }> {
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
    });

    if (!creditPackage || !creditPackage.isActive) {
      throw new Error("Credit package not found or inactive");
    }

    const creditAmount = parseFloat(creditPackage.creditAmount.toString());
    const bonusAmount = parseFloat(creditPackage.bonusAmount.toString());
    const totalCredits = creditAmount + bonusAmount;

    // Add credits to wallet
    const { wallet } = await this.credit(customerId, {
      amount: totalCredits,
      type: bonusAmount > 0 ? "PROMO" : "CREDIT",
      description: `Credit package purchase: ${creditPackage.name}`,
      referenceType: "CreditPackage",
      referenceId: packageId,
    });

    return { wallet, creditsAdded: totalCredits };
  }

  /**
   * Configure auto top-up
   */
  async configureAutoTopUp(
    customerId: string,
    config: {
      enabled: boolean;
      amount?: number;
      threshold?: number;
      paymentTokenId?: string;
    }
  ): Promise<BillingWallet> {
    const wallet = await this.getOrCreate(customerId);

    return prisma.billingWallet.update({
      where: { id: wallet.id },
      data: {
        autoTopUpEnabled: config.enabled,
        autoTopUpAmount: config.amount ? new Prisma.Decimal(config.amount) : null,
        autoTopUpThreshold: config.threshold ? new Prisma.Decimal(config.threshold) : null,
        autoTopUpTokenId: config.paymentTokenId,
      },
    });
  }

  /**
   * Check and process auto top-ups
   */
  async processAutoTopUps(): Promise<number> {
    const walletsNeedingTopUp = await prisma.billingWallet.findMany({
      where: {
        autoTopUpEnabled: true,
        autoTopUpAmount: { not: null },
        autoTopUpThreshold: { not: null },
        autoTopUpTokenId: { not: null },
      },
    });

    let processedCount = 0;

    for (const wallet of walletsNeedingTopUp) {
      const balance = parseFloat(wallet.balance.toString());
      const threshold = parseFloat(wallet.autoTopUpThreshold?.toString() || "0");

      if (balance < threshold) {
        // Process top-up (implement payment processing)
        try {
          const amount = parseFloat(wallet.autoTopUpAmount?.toString() || "0");
          // TODO: Process payment with tokenized card
          // For now, just add credits (simulate successful payment)
          await this.credit(wallet.customerId, {
            amount,
            type: "CREDIT",
            description: "Auto top-up",
            referenceType: "AutoTopUp",
          });
          processedCount++;
        } catch (error) {
          console.error(`Auto top-up failed for wallet ${wallet.id}:`, error);
        }
      }
    }

    return processedCount;
  }

  /**
   * Admin: Adjust balance
   */
  async adminAdjust(
    customerId: string,
    amount: number,
    reason: string,
    adminId: string
  ): Promise<BillingWalletTransaction> {
    const wallet = await this.getOrCreate(customerId);
    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error("Adjustment would result in negative balance");
    }

    const [, transaction] = await prisma.$transaction([
      prisma.billingWallet.update({
        where: { id: wallet.id },
        data: { balance: new Prisma.Decimal(newBalance) },
      }),
      prisma.billingWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "ADJUSTMENT",
          amount: new Prisma.Decimal(amount),
          balanceBefore: new Prisma.Decimal(currentBalance),
          balanceAfter: new Prisma.Decimal(newBalance),
          description: `Admin adjustment: ${reason}`,
          referenceType: "AdminAdjustment",
          referenceId: adminId,
        },
      }),
    ]);

    // Audit log
    await prisma.billingAuditLog.create({
      data: {
        actorType: "admin",
        actorId: adminId,
        action: "wallet.adjusted",
        resourceType: "Wallet",
        resourceId: wallet.id,
        previousData: { balance: currentBalance },
        newData: { balance: newBalance, reason },
      },
    });

    return transaction;
  }

  /**
   * Get wallet statistics
   */
  async getStats() {
    const [totalWallets, totalBalance, totalPromo] = await Promise.all([
      prisma.billingWallet.count(),
      prisma.billingWallet.aggregate({
        _sum: { balance: true },
      }),
      prisma.billingWallet.aggregate({
        _sum: { promoBalance: true },
      }),
    ]);

    return {
      totalWallets,
      totalBalance: parseFloat(totalBalance._sum.balance?.toString() || "0"),
      totalPromoBalance: parseFloat(totalPromo._sum.promoBalance?.toString() || "0"),
    };
  }
}

// Singleton instance
export const walletService = new WalletService();

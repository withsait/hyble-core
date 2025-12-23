// PaymentService - Ödeme işleme
import { prisma, Prisma, type BillingPayment, type BillingPaymentStatus, type BillingPaymentMethod } from "@hyble/db";
import type {
  ProcessPaymentInput,
  PaymentResult,
  PaymentMethodType,
  PaginationParams,
  PaginatedResult,
} from "./types";
import { invoiceService } from "./InvoiceService";
import { walletService } from "./WalletService";

export interface PaymentFilters {
  customerId?: string;
  invoiceId?: string;
  status?: BillingPaymentStatus;
  paymentMethod?: BillingPaymentMethod;
  fromDate?: Date;
  toDate?: Date;
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason?: string;
  processedBy?: string;
}

export class PaymentService {
  /**
   * Process a payment
   */
  async processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id: input.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const balance = parseFloat(invoice.balance.toString());
    if (input.amount > balance) {
      return { success: false, error: "Payment amount exceeds invoice balance" };
    }

    // Handle wallet payment
    if (input.paymentMethod === "WALLET") {
      return this.processWalletPayment(invoice.customerId, input);
    }

    // Get gateway configuration
    const gateway = await prisma.billingPaymentGateway.findFirst({
      where: input.gatewayId
        ? { id: input.gatewayId, isActive: true }
        : { isDefault: true, isActive: true },
    });

    if (!gateway) {
      return { success: false, error: "No active payment gateway found" };
    }

    try {
      // Create pending payment record
      const payment = await prisma.billingPayment.create({
        data: {
          invoiceId: input.invoiceId,
          customerId: invoice.customerId,
          amount: new Prisma.Decimal(input.amount),
          currencyCode: invoice.currencyCode,
          gatewayId: gateway.id,
          paymentTokenId: input.paymentTokenId,
          paymentMethod: input.paymentMethod as BillingPaymentMethod,
          status: "PENDING",
          metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      // Process through gateway (to be implemented per gateway)
      const gatewayResult = await this.processGatewayPayment(gateway, payment, input);

      if (gatewayResult.success) {
        // Update payment status
        await prisma.billingPayment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            gatewayTxnId: gatewayResult.transactionId,
          },
        });

        // Update invoice
        await invoiceService.markAsPaid(input.invoiceId, input.amount);

        // Create audit log
        await this.createAuditLog(payment.id, "payment.completed", invoice.customerId);

        return {
          success: true,
          paymentId: payment.id,
        };
      } else {
        // Mark payment as failed
        await prisma.billingPayment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            metadata: { error: gatewayResult.error },
          },
        });

        return {
          success: false,
          paymentId: payment.id,
          error: gatewayResult.error,
          redirectUrl: gatewayResult.redirectUrl,
          requiresAction: gatewayResult.requiresAction,
          actionType: gatewayResult.actionType,
        };
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      };
    }
  }

  /**
   * Process wallet payment
   */
  private async processWalletPayment(
    customerId: string,
    input: ProcessPaymentInput
  ): Promise<PaymentResult> {
    try {
      // Get manual gateway for wallet payments
      const gateway = await prisma.billingPaymentGateway.findFirst({
        where: { slug: "wallet", isActive: true },
      });

      if (!gateway) {
        // Create wallet gateway if not exists
        const walletGateway = await prisma.billingPaymentGateway.create({
          data: {
            name: "Hyble Wallet",
            slug: "wallet",
            isActive: true,
            credentials: {},
          },
        });

        return this.completeWalletPayment(customerId, input, walletGateway.id);
      }

      return this.completeWalletPayment(customerId, input, gateway.id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Wallet payment failed",
      };
    }
  }

  private async completeWalletPayment(
    customerId: string,
    input: ProcessPaymentInput,
    gatewayId: string
  ): Promise<PaymentResult> {
    // Check wallet balance
    const wallet = await prisma.billingWallet.findUnique({
      where: { customerId },
    });

    if (!wallet || parseFloat(wallet.balance.toString()) < input.amount) {
      return { success: false, error: "Insufficient wallet balance" };
    }

    // Debit from wallet
    await walletService.debit(customerId, {
      amount: input.amount,
      description: `Invoice payment: ${input.invoiceId}`,
      referenceType: "Invoice",
      referenceId: input.invoiceId,
    });

    // Create payment record
    const payment = await prisma.billingPayment.create({
      data: {
        invoiceId: input.invoiceId,
        customerId,
        amount: new Prisma.Decimal(input.amount),
        currencyCode: "EUR", // Will be taken from invoice
        gatewayId,
        paymentMethod: "WALLET",
        status: "COMPLETED",
      },
    });

    // Update invoice
    await invoiceService.markAsPaid(input.invoiceId, input.amount);

    return {
      success: true,
      paymentId: payment.id,
    };
  }

  /**
   * Process payment through gateway (stub - implement per gateway)
   */
  private async processGatewayPayment(
    gateway: { id: string; slug: string; credentials: unknown },
    payment: BillingPayment,
    input: ProcessPaymentInput
  ): Promise<{ success: boolean; transactionId?: string; error?: string; redirectUrl?: string; requiresAction?: boolean; actionType?: "3ds" | "redirect" }> {
    // Gateway-specific implementation will be added
    // For now, simulate successful payment
    switch (gateway.slug) {
      case "stripe":
        // Stripe implementation
        return { success: true, transactionId: `stripe_${Date.now()}` };

      case "iyzico":
        // iyzico implementation
        return { success: true, transactionId: `iyzico_${Date.now()}` };

      case "manual":
        // Manual payment (admin marks as paid)
        return { success: true, transactionId: `manual_${Date.now()}` };

      default:
        return { success: false, error: "Unsupported payment gateway" };
    }
  }

  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<BillingPayment | null> {
    return prisma.billingPayment.findUnique({
      where: { id },
      include: {
        invoice: true,
        gateway: true,
        paymentToken: true,
        refunds: true,
      },
    });
  }

  /**
   * List payments with filters
   */
  async list(
    params: PaginationParams & PaymentFilters
  ): Promise<PaginatedResult<BillingPayment>> {
    const { limit = 20, offset = 0, customerId, invoiceId, status, paymentMethod, fromDate, toDate } = params;

    const where: Prisma.BillingPaymentWhereInput = {
      ...(customerId && { customerId }),
      ...(invoiceId && { invoiceId }),
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(fromDate && { createdAt: { gte: fromDate } }),
      ...(toDate && { createdAt: { lte: toDate } }),
    };

    const [items, total] = await Promise.all([
      prisma.billingPayment.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: { id: true, invoiceNumber: true },
          },
          gateway: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.billingPayment.count({ where }),
    ]);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Process refund
   */
  async refund(input: RefundInput): Promise<{ success: boolean; refundId?: string; error?: string }> {
    const payment = await prisma.billingPayment.findUnique({
      where: { id: input.paymentId },
      include: { gateway: true },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "COMPLETED") {
      return { success: false, error: "Can only refund completed payments" };
    }

    const alreadyRefunded = parseFloat(payment.refundedAmount.toString());
    const maxRefund = parseFloat(payment.amount.toString()) - alreadyRefunded;

    if (input.amount > maxRefund) {
      return { success: false, error: `Maximum refund amount is ${maxRefund}` };
    }

    try {
      // Create refund record
      const refund = await prisma.billingRefund.create({
        data: {
          paymentId: payment.id,
          amount: new Prisma.Decimal(input.amount),
          reason: input.reason,
          status: "pending",
          processedBy: input.processedBy,
        },
      });

      // Process gateway refund (stub)
      const gatewayResult = await this.processGatewayRefund(payment, input.amount);

      if (gatewayResult.success) {
        // Update refund status
        await prisma.billingRefund.update({
          where: { id: refund.id },
          data: {
            status: "completed",
            gatewayRefundId: gatewayResult.refundId,
            processedAt: new Date(),
          },
        });

        // Update payment
        const newRefundedAmount = alreadyRefunded + input.amount;
        const paymentAmount = parseFloat(payment.amount.toString());
        const newStatus: BillingPaymentStatus =
          newRefundedAmount >= paymentAmount ? "REFUNDED" : "PARTIALLY_REFUNDED";

        await prisma.billingPayment.update({
          where: { id: payment.id },
          data: {
            refundedAmount: new Prisma.Decimal(newRefundedAmount),
            status: newStatus,
          },
        });

        // If wallet payment, credit back to wallet
        if (payment.paymentMethod === "WALLET") {
          await walletService.credit(payment.customerId, {
            amount: input.amount,
            type: "REFUND",
            description: `Refund: ${input.reason || "Payment refund"}`,
            referenceType: "Refund",
            referenceId: refund.id,
          });
        }

        // Update invoice balance
        await prisma.billingInvoice.update({
          where: { id: payment.invoiceId },
          data: {
            balance: { increment: input.amount },
            amountPaid: { decrement: input.amount },
            status: "REFUNDED",
          },
        });

        return { success: true, refundId: refund.id };
      } else {
        await prisma.billingRefund.update({
          where: { id: refund.id },
          data: { status: "failed" },
        });

        return { success: false, error: gatewayResult.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund processing failed",
      };
    }
  }

  /**
   * Process gateway refund (stub)
   */
  private async processGatewayRefund(
    payment: BillingPayment & { gateway: { slug: string } | null },
    amount: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    // Gateway-specific refund implementation
    if (!payment.gateway) {
      return { success: true, refundId: `manual_refund_${Date.now()}` };
    }

    switch (payment.gateway.slug) {
      case "stripe":
        // Stripe refund implementation
        return { success: true, refundId: `stripe_refund_${Date.now()}` };

      case "iyzico":
        // iyzico refund implementation
        return { success: true, refundId: `iyzico_refund_${Date.now()}` };

      case "wallet":
        return { success: true, refundId: `wallet_refund_${Date.now()}` };

      default:
        return { success: true, refundId: `manual_refund_${Date.now()}` };
    }
  }

  /**
   * Record manual payment
   */
  async recordManualPayment(
    invoiceId: string,
    amount: number,
    notes?: string,
    recordedBy?: string
  ): Promise<PaymentResult> {
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    // Get or create manual gateway
    let gateway = await prisma.billingPaymentGateway.findFirst({
      where: { slug: "manual" },
    });

    if (!gateway) {
      gateway = await prisma.billingPaymentGateway.create({
        data: {
          name: "Manual Payment",
          slug: "manual",
          isActive: true,
          credentials: {},
        },
      });
    }

    const payment = await prisma.billingPayment.create({
      data: {
        invoiceId,
        customerId: invoice.customerId,
        amount: new Prisma.Decimal(amount),
        currencyCode: invoice.currencyCode,
        gatewayId: gateway.id,
        paymentMethod: "MANUAL",
        status: "COMPLETED",
        metadata: { notes, recordedBy },
      },
    });

    await invoiceService.markAsPaid(invoiceId, amount);

    return {
      success: true,
      paymentId: payment.id,
    };
  }

  /**
   * Get payment statistics
   */
  async getStats(customerId?: string) {
    const where = customerId ? { customerId } : {};

    const [completed, failed, refunded, totalAmount] = await Promise.all([
      prisma.billingPayment.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.billingPayment.count({ where: { ...where, status: "FAILED" } }),
      prisma.billingPayment.count({
        where: { ...where, status: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
      }),
      prisma.billingPayment.aggregate({
        where: { ...where, status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    return {
      completed,
      failed,
      refunded,
      totalAmount: parseFloat(totalAmount._sum.amount?.toString() || "0"),
    };
  }

  /**
   * Create audit log
   */
  private async createAuditLog(resourceId: string, action: string, actorId?: string) {
    await prisma.billingAuditLog.create({
      data: {
        resourceType: "Payment",
        resourceId,
        action,
        actorType: actorId ? "customer" : "system",
        actorId,
      },
    });
  }
}

// Singleton instance
export const paymentService = new PaymentService();

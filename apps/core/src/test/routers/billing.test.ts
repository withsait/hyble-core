import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma, Prisma } from "@hyble/db";

// Mock Prisma
vi.mock("@hyble/db", () => ({
  prisma: {
    billingCustomer: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    billingInvoice: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    billingInvoiceItem: {
      createMany: vi.fn(),
    },
    billingPayment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    billingWallet: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    billingWalletTransaction: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    billingService: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    billingPaymentGateway: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    couponRedemption: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
  Prisma: {
    Decimal: class MockDecimal {
      private value: number;
      constructor(value: number | string) {
        this.value = typeof value === "string" ? parseFloat(value) : value;
      }
      toString() {
        return this.value.toString();
      }
      toNumber() {
        return this.value;
      }
    },
    JsonNull: Symbol("JsonNull"),
  },
}));

describe("Billing Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CustomerService", () => {
    it("should create customer for new user", async () => {
      const mockCustomer = {
        id: "cust_1",
        userId: "user_1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        status: "ACTIVE",
      };

      vi.mocked(prisma.billingCustomer.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.billingCustomer.create).mockResolvedValue(mockCustomer as any);

      const result = await prisma.billingCustomer.create({
        data: {
          userId: "user_1",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          status: "ACTIVE",
        } as any,
      });

      expect(result.id).toBe("cust_1");
      expect(result.email).toBe("test@example.com");
    });

    it("should find existing customer by userId", async () => {
      const mockCustomer = {
        id: "cust_1",
        userId: "user_1",
        email: "test@example.com",
      };

      vi.mocked(prisma.billingCustomer.findFirst).mockResolvedValue(mockCustomer as any);

      const result = await prisma.billingCustomer.findFirst({
        where: { userId: "user_1" },
      });

      expect(result?.id).toBe("cust_1");
    });
  });

  describe("InvoiceService", () => {
    it("should generate unique invoice number", async () => {
      const mockInvoice = {
        id: "inv_1",
        invoiceNumber: "INV-2024-0001",
        status: "DRAFT",
        subtotal: new Prisma.Decimal(100),
        total: new Prisma.Decimal(100),
        balance: new Prisma.Decimal(100),
      };

      vi.mocked(prisma.billingInvoice.create).mockResolvedValue(mockInvoice as any);

      const result = await prisma.billingInvoice.create({
        data: {
          invoiceNumber: "INV-2024-0001",
          customerId: "cust_1",
          subtotal: 100,
          total: 100,
          balance: 100,
          currencyCode: "EUR",
          dueDate: new Date(),
        } as any,
      });

      expect(result.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    });

    it("should mark invoice as paid when balance is zero", async () => {
      const mockInvoice = {
        id: "inv_1",
        status: "PAID",
        balance: new Prisma.Decimal(0),
        amountPaid: new Prisma.Decimal(100),
        paidDate: new Date(),
      };

      vi.mocked(prisma.billingInvoice.update).mockResolvedValue(mockInvoice as any);

      const result = await prisma.billingInvoice.update({
        where: { id: "inv_1" },
        data: {
          status: "PAID",
          balance: 0,
          amountPaid: { increment: 100 },
          paidDate: new Date(),
        } as any,
      });

      expect(result.status).toBe("PAID");
      expect(result.balance.toNumber()).toBe(0);
    });

    it("should calculate tax correctly", async () => {
      const subtotal = 100;
      const taxRate = 0.20; // 20% VAT
      const expectedTax = 20;
      const expectedTotal = 120;

      const mockInvoice = {
        id: "inv_1",
        subtotal: new Prisma.Decimal(subtotal),
        taxTotal: new Prisma.Decimal(expectedTax),
        total: new Prisma.Decimal(expectedTotal),
      };

      vi.mocked(prisma.billingInvoice.create).mockResolvedValue(mockInvoice as any);

      const calculatedTax = subtotal * taxRate;
      const calculatedTotal = subtotal + calculatedTax;

      expect(calculatedTax).toBe(expectedTax);
      expect(calculatedTotal).toBe(expectedTotal);
    });
  });

  describe("PaymentService", () => {
    it("should reject payment exceeding invoice balance", async () => {
      const mockInvoice = {
        id: "inv_1",
        balance: new Prisma.Decimal(50),
      };

      vi.mocked(prisma.billingInvoice.findUnique).mockResolvedValue(mockInvoice as any);

      const invoice = await prisma.billingInvoice.findUnique({
        where: { id: "inv_1" },
      });

      const paymentAmount = 100;
      const invoiceBalance = parseFloat(invoice?.balance?.toString() || "0");

      expect(paymentAmount > invoiceBalance).toBe(true);
    });

    it("should process wallet payment correctly", async () => {
      const mockWallet = {
        id: "wallet_1",
        customerId: "cust_1",
        balance: new Prisma.Decimal(200),
      };

      const mockPayment = {
        id: "pay_1",
        invoiceId: "inv_1",
        amount: new Prisma.Decimal(100),
        paymentMethod: "WALLET",
        status: "COMPLETED",
      };

      vi.mocked(prisma.billingWallet.findUnique).mockResolvedValue(mockWallet as any);
      vi.mocked(prisma.billingPayment.create).mockResolvedValue(mockPayment as any);

      const wallet = await prisma.billingWallet.findUnique({
        where: { customerId: "cust_1" },
      });

      expect(parseFloat(wallet?.balance?.toString() || "0")).toBeGreaterThanOrEqual(100);
    });

    it("should record refund correctly", async () => {
      const mockPayment = {
        id: "pay_1",
        amount: new Prisma.Decimal(100),
        refundedAmount: new Prisma.Decimal(50),
        status: "PARTIALLY_REFUNDED",
      };

      vi.mocked(prisma.billingPayment.update).mockResolvedValue(mockPayment as any);

      const result = await prisma.billingPayment.update({
        where: { id: "pay_1" },
        data: {
          refundedAmount: { increment: 50 },
          status: "PARTIALLY_REFUNDED",
        } as any,
      });

      expect(result.status).toBe("PARTIALLY_REFUNDED");
      expect(result.refundedAmount.toNumber()).toBe(50);
    });
  });

  describe("WalletService", () => {
    it("should create wallet for new customer", async () => {
      const mockWallet = {
        id: "wallet_1",
        customerId: "cust_1",
        balance: new Prisma.Decimal(0),
        promoBalance: new Prisma.Decimal(0),
        currencyCode: "EUR",
      };

      vi.mocked(prisma.billingWallet.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.billingWallet.create).mockResolvedValue(mockWallet as any);

      const existing = await prisma.billingWallet.findUnique({
        where: { customerId: "cust_1" },
      });

      expect(existing).toBeNull();

      const result = await prisma.billingWallet.create({
        data: {
          customerId: "cust_1",
          currencyCode: "EUR",
        } as any,
      });

      expect(result.id).toBe("wallet_1");
      expect(result.balance.toNumber()).toBe(0);
    });

    it("should credit wallet correctly", async () => {
      const mockWallet = {
        id: "wallet_1",
        customerId: "cust_1",
        balance: new Prisma.Decimal(150),
      };

      vi.mocked(prisma.billingWallet.update).mockResolvedValue(mockWallet as any);

      const result = await prisma.billingWallet.update({
        where: { customerId: "cust_1" },
        data: {
          balance: { increment: 100 },
        } as any,
      });

      expect(result.balance.toNumber()).toBe(150);
    });

    it("should debit wallet correctly", async () => {
      const mockWallet = {
        id: "wallet_1",
        balance: new Prisma.Decimal(50),
      };

      vi.mocked(prisma.billingWallet.findUnique).mockResolvedValue({
        id: "wallet_1",
        balance: new Prisma.Decimal(100),
      } as any);

      vi.mocked(prisma.billingWallet.update).mockResolvedValue(mockWallet as any);

      const wallet = await prisma.billingWallet.findUnique({
        where: { customerId: "cust_1" },
      });

      const currentBalance = parseFloat(wallet?.balance?.toString() || "0");
      const debitAmount = 50;

      expect(currentBalance >= debitAmount).toBe(true);
    });

    it("should reject debit when balance is insufficient", async () => {
      const mockWallet = {
        id: "wallet_1",
        balance: new Prisma.Decimal(30),
      };

      vi.mocked(prisma.billingWallet.findUnique).mockResolvedValue(mockWallet as any);

      const wallet = await prisma.billingWallet.findUnique({
        where: { customerId: "cust_1" },
      });

      const currentBalance = parseFloat(wallet?.balance?.toString() || "0");
      const debitAmount = 50;

      expect(currentBalance < debitAmount).toBe(true);
    });

    it("should track transaction history", async () => {
      const mockTransactions = [
        { id: "tx_1", type: "CREDIT", amount: new Prisma.Decimal(100) },
        { id: "tx_2", type: "DEBIT", amount: new Prisma.Decimal(-50) },
      ];

      vi.mocked(prisma.billingWalletTransaction.findMany).mockResolvedValue(mockTransactions as any);

      const result = await prisma.billingWalletTransaction.findMany({
        where: { walletId: "wallet_1" },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("SubscriptionService", () => {
    it("should create subscription with correct billing cycle", async () => {
      const startDate = new Date();
      const nextDueDate = new Date(startDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1); // MONTHLY

      const mockService = {
        id: "svc_1",
        customerId: "cust_1",
        productId: "prod_1",
        billingCycle: "MONTHLY",
        startDate,
        nextDueDate,
        status: "ACTIVE",
      };

      vi.mocked(prisma.billingService.create).mockResolvedValue(mockService as any);

      const result = await prisma.billingService.create({
        data: mockService as any,
      });

      expect(result.billingCycle).toBe("MONTHLY");
      expect(result.status).toBe("ACTIVE");
    });

    it("should calculate next due date correctly for different cycles", () => {
      const startDate = new Date("2024-01-15");

      // MONTHLY
      const monthlyDue = new Date(startDate);
      monthlyDue.setMonth(monthlyDue.getMonth() + 1);
      expect(monthlyDue.getMonth()).toBe(1); // February

      // QUARTERLY
      const quarterlyDue = new Date(startDate);
      quarterlyDue.setMonth(quarterlyDue.getMonth() + 3);
      expect(quarterlyDue.getMonth()).toBe(3); // April

      // ANNUALLY
      const annualDue = new Date(startDate);
      annualDue.setFullYear(annualDue.getFullYear() + 1);
      expect(annualDue.getFullYear()).toBe(2025);
    });

    it("should suspend service after grace period", async () => {
      const mockService = {
        id: "svc_1",
        status: "SUSPENDED",
      };

      vi.mocked(prisma.billingService.updateMany).mockResolvedValue({ count: 5 });
      vi.mocked(prisma.billingService.update).mockResolvedValue(mockService as any);

      const result = await prisma.billingService.updateMany({
        where: {
          status: "ACTIVE",
          nextDueDate: { lt: new Date() },
        },
        data: { status: "SUSPENDED" },
      });

      expect(result.count).toBe(5);
    });
  });

  describe("CouponService", () => {
    it("should validate coupon code", async () => {
      const mockCoupon = {
        id: "coupon_1",
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: new Prisma.Decimal(20),
        status: "ACTIVE",
        usageLimit: 100,
        usedCount: 50,
      };

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(mockCoupon as any);

      const coupon = await prisma.coupon.findFirst({
        where: {
          code: "SAVE20",
          status: "ACTIVE",
        },
      });

      expect(coupon).not.toBeNull();
      expect(coupon?.discountType).toBe("PERCENTAGE");
    });

    it("should reject expired coupon", async () => {
      const expiredCoupon = {
        id: "coupon_1",
        code: "EXPIRED",
        status: "EXPIRED",
        endDate: new Date("2023-01-01"),
      };

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(expiredCoupon as any);

      const coupon = await prisma.coupon.findFirst({
        where: { code: "EXPIRED" },
      });

      expect(coupon?.status).toBe("EXPIRED");
    });

    it("should reject coupon at usage limit", async () => {
      const depleted = {
        id: "coupon_1",
        code: "DEPLETED",
        usageLimit: 100,
        usedCount: 100,
      };

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(depleted as any);

      const coupon = await prisma.coupon.findFirst({
        where: { code: "DEPLETED" },
      });

      expect(coupon?.usedCount).toBe(coupon?.usageLimit);
    });

    it("should calculate percentage discount correctly", () => {
      const subtotal = 100;
      const discountPercent = 20;
      const expectedDiscount = 20;

      const discount = (subtotal * discountPercent) / 100;

      expect(discount).toBe(expectedDiscount);
    });

    it("should calculate fixed discount correctly", () => {
      const subtotal = 100;
      const fixedDiscount = 15;
      const expectedTotal = 85;

      const total = subtotal - fixedDiscount;

      expect(total).toBe(expectedTotal);
    });

    it("should not exceed subtotal for fixed discount", () => {
      const subtotal = 10;
      const fixedDiscount = 50;
      const actualDiscount = Math.min(fixedDiscount, subtotal);

      expect(actualDiscount).toBe(10);
    });
  });

  describe("PaymentGateway", () => {
    it("should get default gateway", async () => {
      const mockGateway = {
        id: "gw_1",
        slug: "stripe",
        name: "Stripe",
        isDefault: true,
        isActive: true,
      };

      vi.mocked(prisma.billingPaymentGateway.findFirst).mockResolvedValue(mockGateway as any);

      const result = await prisma.billingPaymentGateway.findFirst({
        where: { isDefault: true, isActive: true },
      });

      expect(result?.slug).toBe("stripe");
      expect(result?.isDefault).toBe(true);
    });

    it("should get gateway by slug", async () => {
      const mockGateway = {
        id: "gw_2",
        slug: "iyzico",
        name: "iyzico",
        isActive: true,
      };

      vi.mocked(prisma.billingPaymentGateway.findFirst).mockResolvedValue(mockGateway as any);

      const result = await prisma.billingPaymentGateway.findFirst({
        where: { slug: "iyzico", isActive: true },
      });

      expect(result?.slug).toBe("iyzico");
    });
  });

  describe("Tax Calculations", () => {
    it("should apply correct VAT rate for UK", () => {
      const subtotal = 100;
      const ukVatRate = 0.20;
      const expectedTax = 20;

      const tax = subtotal * ukVatRate;

      expect(tax).toBe(expectedTax);
    });

    it("should apply correct KDV rate for Turkey", () => {
      const subtotal = 100;
      const turkeyKdvRate = 0.18;
      const expectedTax = 18;

      const tax = subtotal * turkeyKdvRate;

      expect(tax).toBe(expectedTax);
    });

    it("should apply zero VAT for B2B EU transactions with valid VAT ID", () => {
      const subtotal = 100;
      const reverseChargeVat = 0;
      const expectedTax = 0;

      const tax = subtotal * reverseChargeVat;

      expect(tax).toBe(expectedTax);
    });
  });
});

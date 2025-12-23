// Shared billing types

import { Prisma } from "@hyble/db";
type Decimal = Prisma.Decimal;

export type Currency = "EUR" | "TRY" | "USD" | "GBP";

export interface Money {
  amount: number;
  currency: Currency;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Invoice types
export interface CreateInvoiceInput {
  customerId: string;
  items: InvoiceItemInput[];
  dueDate?: Date;
  notes?: string;
  couponCode?: string;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxable?: boolean;
  serviceId?: string;
  periodStart?: Date;
  periodEnd?: Date;
}

// Payment types
export interface ProcessPaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  gatewayId?: string;
  paymentTokenId?: string;
  metadata?: Record<string, unknown>;
}

export type PaymentMethodType =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "PAYPAL"
  | "WALLET"
  | "MANUAL"
  | "IYZICO";

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
  requiresAction?: boolean;
  actionType?: "3ds" | "redirect";
}

// Wallet types
export interface WalletTopUpInput {
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethodType;
  gatewayId?: string;
}

export interface WalletSpendInput {
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

// Subscription types
export interface CreateSubscriptionInput {
  customerId: string;
  productId: string;
  billingCycle: BillingCycleType;
  startDate?: Date;
  configOptions?: Record<string, unknown>;
}

export type BillingCycleType =
  | "ONE_TIME"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUALLY"
  | "ANNUALLY"
  | "BIENNIALLY"
  | "TRIENNIALLY";

// Tax types
export interface TaxCalculationInput {
  subtotal: number;
  country: string;
  state?: string;
  isExempt?: boolean;
  vatNumber?: string;
}

export interface TaxCalculationResult {
  taxRate: number;
  taxAmount: number;
  isInclusive: boolean;
  breakdown: TaxBreakdownItem[];
}

export interface TaxBreakdownItem {
  name: string;
  rate: number;
  amount: number;
}

// Coupon types
export interface ValidateCouponInput {
  code: string;
  customerId: string;
  productIds?: string[];
  subtotal: number;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  discountAmount?: number;
}

// Event types for webhooks
export type BillingEventType =
  | "invoice.created"
  | "invoice.paid"
  | "invoice.overdue"
  | "invoice.cancelled"
  | "payment.completed"
  | "payment.failed"
  | "payment.refunded"
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "subscription.suspended"
  | "wallet.credited"
  | "wallet.debited";

export interface BillingEvent {
  type: BillingEventType;
  resourceId: string;
  resourceType: "Invoice" | "Payment" | "Subscription" | "Wallet";
  data: Record<string, unknown>;
  occurredAt: Date;
}

// Helper functions
export function toMoney(amount: number | Decimal, currency: Currency): Money {
  const numAmount = typeof amount === "number" ? amount : parseFloat(amount.toString());
  return { amount: numAmount, currency };
}

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
  }).format(money.amount);
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount - b.amount, currency: a.currency };
}

export function multiplyMoney(money: Money, factor: number): Money {
  return { amount: money.amount * factor, currency: money.currency };
}

// Billing cycle helpers
export function getBillingCycleDays(cycle: BillingCycleType): number {
  switch (cycle) {
    case "ONE_TIME":
      return 0;
    case "MONTHLY":
      return 30;
    case "QUARTERLY":
      return 90;
    case "SEMI_ANNUALLY":
      return 180;
    case "ANNUALLY":
      return 365;
    case "BIENNIALLY":
      return 730;
    case "TRIENNIALLY":
      return 1095;
    default:
      return 30;
  }
}

export function getNextDueDate(startDate: Date, cycle: BillingCycleType): Date {
  const days = getBillingCycleDays(cycle);
  if (days === 0) return startDate;

  const nextDate = new Date(startDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Payment Gateway Types
import type { Prisma } from "@hyble/db";

export interface GatewayConfig {
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  sandbox?: boolean;
  webhookSecret?: string;
  [key: string]: unknown;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  customerName?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  metadata?: Record<string, unknown>;
  savedPaymentMethodId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  errorCode?: string;
  redirectUrl?: string;
  requiresAction?: boolean;
  actionType?: "3ds" | "redirect" | "otp";
  actionData?: Record<string, unknown>;
  rawResponse?: unknown;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
  rawResponse?: unknown;
}

export interface SavedPaymentMethod {
  id: string;
  type: "card" | "bank_account";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface PaymentMethodResponse {
  success: boolean;
  paymentMethodId?: string;
  error?: string;
  rawResponse?: unknown;
}

export interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
  signature?: string;
  timestamp?: Date;
}

export interface WebhookValidationResult {
  valid: boolean;
  event?: WebhookEvent;
  error?: string;
}

export abstract class PaymentGateway {
  protected config: GatewayConfig;
  protected sandbox: boolean;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.sandbox = config.sandbox ?? false;
  }

  abstract get name(): string;
  abstract get slug(): string;

  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  abstract capturePayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
  abstract refundPayment(request: RefundRequest): Promise<RefundResponse>;
  abstract getPaymentStatus(transactionId: string): Promise<{ status: string; rawResponse?: unknown }>;

  abstract validateWebhook(payload: string | Buffer, signature: string): WebhookValidationResult;

  // Optional methods for saved payment methods
  async savePaymentMethod?(customerId: string, paymentMethodData: unknown): Promise<PaymentMethodResponse>;
  async deletePaymentMethod?(paymentMethodId: string): Promise<{ success: boolean; error?: string }>;
  async listPaymentMethods?(customerId: string): Promise<SavedPaymentMethod[]>;
}

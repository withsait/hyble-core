// Manual Payment Gateway (for admin-recorded payments like bank transfers)
import {
  PaymentGateway,
  GatewayConfig,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  WebhookValidationResult,
} from "./types";

export class ManualGateway extends PaymentGateway {
  constructor(config: GatewayConfig = {}) {
    super(config);
  }

  get name(): string {
    return "Manual Payment";
  }

  get slug(): string {
    return "manual";
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Manual payments are recorded directly, no processing needed
    const transactionId = `manual_${Date.now()}_${request.orderId}`;

    return {
      success: true,
      transactionId,
      rawResponse: {
        message: "Manual payment recorded",
        request,
      },
    };
  }

  async capturePayment(transactionId: string): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId,
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    const refundId = `manual_refund_${Date.now()}_${request.transactionId}`;

    return {
      success: true,
      refundId,
      rawResponse: {
        message: "Manual refund recorded",
        request,
      },
    };
  }

  async getPaymentStatus(transactionId: string): Promise<{ status: string; rawResponse?: unknown }> {
    // For manual payments, status is managed in the database
    return {
      status: "completed",
      rawResponse: {
        transactionId,
        message: "Manual payment - check database for status",
      },
    };
  }

  validateWebhook(_payload: string | Buffer, _signature: string): WebhookValidationResult {
    // Manual gateway doesn't support webhooks
    return {
      valid: false,
      error: "Manual gateway does not support webhooks",
    };
  }
}

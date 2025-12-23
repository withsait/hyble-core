// PayTR Payment Gateway for Turkey
import * as crypto from "crypto";
import {
  PaymentGateway,
  GatewayConfig,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  WebhookValidationResult,
} from "./types";

export interface PayTRConfig extends GatewayConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  sandbox?: boolean;
}

export class PayTRGateway extends PaymentGateway {
  private baseUrl: string;

  constructor(config: PayTRConfig) {
    super(config);
    this.baseUrl = "https://www.paytr.com";
  }

  get name(): string {
    return "PayTR";
  }

  get slug(): string {
    return "paytr";
  }

  private generateHash(...values: string[]): string {
    const hashStr = values.join("");
    return crypto
      .createHmac("sha256", this.config.merchantKey as string)
      .update(hashStr + this.config.merchantSalt)
      .digest("base64");
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const merchantOid = request.orderId;
      const userIp = "85.34.78.112"; // Should be passed from request
      const paymentAmount = Math.round(request.amount * 100); // Kuruş cinsinden
      const currency = this.mapCurrency(request.currency);

      // Basket items (encoded as JSON and base64)
      const basket = JSON.stringify([
        [request.description || "Payment", request.amount.toFixed(2), 1],
      ]);
      const userBasket = Buffer.from(basket).toString("base64");

      // Required fields for iframe token
      const hashString = [
        this.config.merchantId,
        userIp,
        merchantOid,
        request.customerEmail || "",
        paymentAmount.toString(),
        userBasket,
        "0", // no_installment
        "1", // max_installment
        currency,
        "1", // test_mode (0 for production)
      ].join("");

      const paytrToken = this.generateHash(hashString);

      // Create payment request
      const formData = new URLSearchParams({
        merchant_id: this.config.merchantId as string,
        user_ip: userIp,
        merchant_oid: merchantOid,
        email: request.customerEmail || "",
        payment_amount: paymentAmount.toString(),
        paytr_token: paytrToken,
        user_basket: userBasket,
        debug_on: "1",
        no_installment: "0",
        max_installment: "1",
        user_name: request.customerName || "Customer",
        user_address: request.billingAddress?.line1 || "Address",
        user_phone: "5555555555",
        merchant_ok_url: request.returnUrl || "",
        merchant_fail_url: request.cancelUrl || "",
        timeout_limit: "30",
        currency,
        test_mode: this.sandbox ? "1" : "0",
        lang: "tr",
      });

      const response = await fetch(`${this.baseUrl}/odeme/api/get-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json() as {
        status: string;
        token?: string;
        reason?: string;
      };

      if (data.status === "success" && data.token) {
        return {
          success: false,
          requiresAction: true,
          actionType: "redirect",
          redirectUrl: `${this.baseUrl}/odeme/guvenli/${data.token}`,
          actionData: {
            token: data.token,
          },
          rawResponse: data,
        };
      }

      return {
        success: false,
        error: data.reason || "Payment initialization failed",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
        rawResponse: error,
      };
    }
  }

  private mapCurrency(currency: string): string {
    const currencyMap: Record<string, string> = {
      TRY: "TL",
      USD: "USD",
      EUR: "EUR",
      GBP: "GBP",
      RUB: "RUB",
    };
    return currencyMap[currency.toUpperCase()] || "TL";
  }

  async capturePayment(transactionId: string): Promise<PaymentResponse> {
    // PayTR doesn't support separate authorization/capture
    return {
      success: true,
      transactionId,
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refundAmount = Math.round(request.amount * 100);

      const hashString = [
        this.config.merchantId,
        request.transactionId,
        refundAmount.toString(),
      ].join("");

      const paytrToken = this.generateHash(hashString);

      const formData = new URLSearchParams({
        merchant_id: this.config.merchantId as string,
        merchant_oid: request.transactionId,
        return_amount: refundAmount.toString(),
        paytr_token: paytrToken,
      });

      const response = await fetch(`${this.baseUrl}/odeme/iade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json() as {
        status: string;
        err_no?: string;
        err_msg?: string;
        is_test?: string;
      };

      if (data.status === "success") {
        return {
          success: true,
          refundId: `refund_${request.transactionId}_${Date.now()}`,
          rawResponse: data,
        };
      }

      return {
        success: false,
        error: data.err_msg || "Refund failed",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund failed",
        rawResponse: error,
      };
    }
  }

  async getPaymentStatus(merchantOid: string): Promise<{ status: string; rawResponse?: unknown }> {
    try {
      const hashString = [this.config.merchantId, merchantOid].join("");
      const paytrToken = this.generateHash(hashString);

      const formData = new URLSearchParams({
        merchant_id: this.config.merchantId as string,
        merchant_oid: merchantOid,
        paytr_token: paytrToken,
      });

      const response = await fetch(`${this.baseUrl}/odeme/durum-sorgu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json() as {
        status: string;
        payment_status?: string;
        payment_amount?: string;
      };

      return {
        status: data.payment_status || data.status,
        rawResponse: data,
      };
    } catch (error) {
      return {
        status: "error",
        rawResponse: error,
      };
    }
  }

  validateWebhook(payload: string | Buffer, _signature: string): WebhookValidationResult {
    try {
      const data = typeof payload === "string" ? payload : payload.toString();
      const params = new URLSearchParams(data);

      const merchantOid = params.get("merchant_oid");
      const status = params.get("status");
      const totalAmount = params.get("total_amount");
      const hash = params.get("hash");

      if (!merchantOid || !status || !hash) {
        return {
          valid: false,
          error: "Missing required fields",
        };
      }

      // Verify the hash
      const hashString = [
        merchantOid,
        this.config.merchantSalt,
        status,
        totalAmount,
      ].join("");

      const expectedHash = crypto
        .createHmac("sha256", this.config.merchantKey as string)
        .update(hashString)
        .digest("base64");

      if (hash !== expectedHash) {
        return {
          valid: false,
          error: "Invalid webhook hash",
        };
      }

      return {
        valid: true,
        event: {
          type: status === "success" ? "payment.success" : "payment.failed",
          data: {
            merchantOid,
            status,
            totalAmount,
            currency: params.get("currency"),
            paymentType: params.get("payment_type"),
            failedReasonCode: params.get("failed_reason_code"),
            failedReasonMsg: params.get("failed_reason_msg"),
          },
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid webhook payload",
      };
    }
  }
}

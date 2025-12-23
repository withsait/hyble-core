// iyzico Payment Gateway for Turkey
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

export interface IyzicoConfig extends GatewayConfig {
  apiKey: string;
  secretKey: string;
  sandbox?: boolean;
}

interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  price: string;
}

interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  ip: string;
  city: string;
  country: string;
  zipCode?: string;
  gsmNumber?: string;
}

export class IyzicoGateway extends PaymentGateway {
  private baseUrl: string;

  constructor(config: IyzicoConfig) {
    super(config);
    this.baseUrl = config.sandbox
      ? "https://sandbox-api.iyzipay.com"
      : "https://api.iyzipay.com";
  }

  get name(): string {
    return "iyzico";
  }

  get slug(): string {
    return "iyzico";
  }

  private generateAuthorizationHeader(request: Record<string, unknown>): string {
    const randomString = this.generateRandomString(8);
    const payload = JSON.stringify(request);
    const hashString = `${this.config.apiKey}${randomString}${this.config.secretKey}${payload}`;
    const hash = crypto.createHash("sha1").update(hashString).digest("base64");
    const authorization = `IYZWS ${this.config.apiKey}:${hash}`;

    return `apiKey:${this.config.apiKey}&randomKey:${randomString}&signature:${hash}`;
  }

  private generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async makeRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const randomString = this.generateRandomString(8);
    const jsonBody = JSON.stringify(body);

    // Generate PKI string (iyzico specific format)
    const pkiString = this.generatePkiString(body);
    const hashString = `${this.config.apiKey}${randomString}${this.config.secretKey}${pkiString}`;
    const hash = crypto.createHash("sha1").update(hashString).digest("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `IYZWS ${this.config.apiKey}:${hash}`,
        "x-iyzi-rnd": randomString,
      },
      body: jsonBody,
    });

    return response.json() as Promise<T>;
  }

  private generatePkiString(obj: Record<string, unknown>, _prefix = ""): string {
    let result = "[";
    const entries = Object.entries(obj);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const [key, value] = entry;

      if (value === null || value === undefined) continue;

      if (typeof value === "object" && !Array.isArray(value)) {
        result += `${key}=${this.generatePkiString(value as Record<string, unknown>)}`;
      } else if (Array.isArray(value)) {
        result += `${key}=[`;
        value.forEach((item, index) => {
          if (typeof item === "object") {
            result += this.generatePkiString(item as Record<string, unknown>);
          } else {
            result += String(item);
          }
          if (index < value.length - 1) result += ", ";
        });
        result += "]";
      } else {
        result += `${key}=${value}`;
      }

      if (i < entries.length - 1) result += ", ";
    }

    result += "]";
    return result;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create a basket item for the payment
      const basketItems: IyzicoBasketItem[] = [
        {
          id: request.orderId,
          name: request.description || "Payment",
          category1: "Services",
          itemType: "VIRTUAL",
          price: request.amount.toFixed(2),
        },
      ];

      // Build buyer information
      const buyer: IyzicoBuyer = {
        id: request.customerId,
        name: request.customerName?.split(" ")[0] || "Customer",
        surname: request.customerName?.split(" ").slice(1).join(" ") || "User",
        email: request.customerEmail || "customer@example.com",
        identityNumber: "11111111111", // Required for Turkey
        registrationAddress: request.billingAddress?.line1 || "Address",
        ip: "85.34.78.112", // Should be passed from request
        city: request.billingAddress?.city || "Istanbul",
        country: request.billingAddress?.country || "Turkey",
        zipCode: request.billingAddress?.postalCode,
      };

      // Build addresses
      const billingAddress: IyzicoAddress = {
        contactName: request.customerName || "Customer",
        city: request.billingAddress?.city || "Istanbul",
        country: request.billingAddress?.country || "Turkey",
        address: request.billingAddress?.line1 || "Address",
        zipCode: request.billingAddress?.postalCode,
      };

      // Create checkout form (3D Secure)
      const checkoutFormRequest = {
        locale: "tr",
        conversationId: request.orderId,
        price: request.amount.toFixed(2),
        paidPrice: request.amount.toFixed(2),
        currency: this.mapCurrency(request.currency),
        basketId: request.orderId,
        paymentGroup: "PRODUCT",
        callbackUrl: request.returnUrl,
        buyer,
        shippingAddress: billingAddress,
        billingAddress,
        basketItems,
        enabledInstallments: [1, 2, 3, 6, 9],
      };

      const response = await this.makeRequest<{
        status: string;
        errorCode?: string;
        errorMessage?: string;
        token?: string;
        checkoutFormContent?: string;
        paymentPageUrl?: string;
      }>("/payment/iyzipos/checkoutform/initialize", checkoutFormRequest);

      if (response.status === "success" && response.paymentPageUrl) {
        return {
          success: false,
          requiresAction: true,
          actionType: "redirect",
          redirectUrl: response.paymentPageUrl,
          actionData: {
            token: response.token,
            checkoutFormContent: response.checkoutFormContent,
          },
          rawResponse: response,
        };
      }

      return {
        success: false,
        error: response.errorMessage || "Payment initialization failed",
        errorCode: response.errorCode,
        rawResponse: response,
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
      TRY: "TRY",
      USD: "USD",
      EUR: "EUR",
      GBP: "GBP",
    };
    return currencyMap[currency.toUpperCase()] || "TRY";
  }

  async capturePayment(transactionId: string): Promise<PaymentResponse> {
    // iyzico doesn't have separate capture - payments are captured immediately
    return {
      success: true,
      transactionId,
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refundRequest = {
        locale: "tr",
        conversationId: `refund_${Date.now()}`,
        paymentTransactionId: request.transactionId,
        price: request.amount.toFixed(2),
        currency: "TRY",
        ip: "85.34.78.112",
      };

      const response = await this.makeRequest<{
        status: string;
        errorCode?: string;
        errorMessage?: string;
        paymentId?: string;
      }>("/payment/refund", refundRequest);

      if (response.status === "success") {
        return {
          success: true,
          refundId: response.paymentId,
          rawResponse: response,
        };
      }

      return {
        success: false,
        error: response.errorMessage || "Refund failed",
        rawResponse: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund failed",
        rawResponse: error,
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<{ status: string; rawResponse?: unknown }> {
    try {
      const request = {
        locale: "tr",
        conversationId: `status_${Date.now()}`,
        token: transactionId,
      };

      const response = await this.makeRequest<{
        status: string;
        paymentStatus?: string;
      }>("/payment/iyzipos/checkoutform/auth/ecom/detail", request);

      return {
        status: response.paymentStatus || response.status,
        rawResponse: response,
      };
    } catch (error) {
      return {
        status: "error",
        rawResponse: error,
      };
    }
  }

  validateWebhook(payload: string | Buffer, signature: string): WebhookValidationResult {
    try {
      const data = typeof payload === "string" ? payload : payload.toString();
      const parsedPayload = JSON.parse(data);

      // Verify the signature using iyzico's method
      const expectedSignature = crypto
        .createHmac("sha256", this.config.secretKey as string)
        .update(data)
        .digest("base64");

      if (signature !== expectedSignature) {
        return {
          valid: false,
          error: "Invalid webhook signature",
        };
      }

      return {
        valid: true,
        event: {
          type: parsedPayload.iyziEventType || "payment",
          data: parsedPayload,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid webhook payload",
      };
    }
  }

  // Retrieve checkout form result after callback
  async retrieveCheckoutForm(token: string): Promise<PaymentResponse> {
    try {
      const request = {
        locale: "tr",
        conversationId: `retrieve_${Date.now()}`,
        token,
      };

      const response = await this.makeRequest<{
        status: string;
        errorCode?: string;
        errorMessage?: string;
        paymentId?: string;
        paymentStatus?: string;
        price?: string;
        paidPrice?: string;
      }>("/payment/iyzipos/checkoutform/auth/ecom/detail", request);

      if (response.status === "success" && response.paymentStatus === "SUCCESS") {
        return {
          success: true,
          transactionId: response.paymentId,
          rawResponse: response,
        };
      }

      return {
        success: false,
        error: response.errorMessage || "Payment verification failed",
        errorCode: response.errorCode,
        rawResponse: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment verification failed",
        rawResponse: error,
      };
    }
  }
}

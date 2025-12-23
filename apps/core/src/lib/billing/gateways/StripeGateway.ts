// Stripe Payment Gateway
import Stripe from "stripe";
import {
  PaymentGateway,
  GatewayConfig,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  WebhookValidationResult,
  PaymentMethodResponse,
  SavedPaymentMethod,
} from "./types";

export interface StripeConfig extends GatewayConfig {
  apiKey: string;
  webhookSecret?: string;
}

export class StripeGateway extends PaymentGateway {
  private stripe: Stripe;

  constructor(config: StripeConfig) {
    super(config);
    this.stripe = new Stripe(config.apiKey);
  }

  get name(): string {
    return "Stripe";
  }

  get slug(): string {
    return "stripe";
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create or retrieve Stripe customer
      let stripeCustomerId: string | undefined;

      if (request.customerEmail) {
        const existingCustomers = await this.stripe.customers.list({
          email: request.customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
          stripeCustomerId = existingCustomers.data[0].id;
        } else {
          const customer = await this.stripe.customers.create({
            email: request.customerEmail,
            name: request.customerName,
            metadata: {
              hybleCustomerId: request.customerId,
            },
          });
          stripeCustomerId = customer.id;
        }
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Stripe uses cents
        currency: request.currency.toLowerCase(),
        customer: stripeCustomerId,
        description: request.description,
        metadata: {
          orderId: request.orderId,
          customerId: request.customerId,
          ...(request.metadata as Record<string, string>),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Check if action is required (3DS, etc.)
      if (paymentIntent.status === "requires_action" && paymentIntent.next_action) {
        return {
          success: false,
          transactionId: paymentIntent.id,
          requiresAction: true,
          actionType: "3ds",
          actionData: {
            clientSecret: paymentIntent.client_secret,
            nextAction: paymentIntent.next_action,
          },
          rawResponse: paymentIntent,
        };
      }

      if (paymentIntent.status === "requires_payment_method") {
        return {
          success: false,
          transactionId: paymentIntent.id,
          redirectUrl: request.returnUrl,
          actionData: {
            clientSecret: paymentIntent.client_secret,
          },
          rawResponse: paymentIntent,
        };
      }

      if (paymentIntent.status === "succeeded") {
        return {
          success: true,
          transactionId: paymentIntent.id,
          rawResponse: paymentIntent,
        };
      }

      return {
        success: false,
        transactionId: paymentIntent.id,
        error: `Unexpected payment status: ${paymentIntent.status}`,
        rawResponse: paymentIntent,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
        errorCode: stripeError.code,
        rawResponse: error,
      };
    }
  }

  async capturePayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(transactionId, {
        amount_to_capture: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: paymentIntent.status === "succeeded",
        transactionId: paymentIntent.id,
        rawResponse: paymentIntent,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
        errorCode: stripeError.code,
        rawResponse: error,
      };
    }
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: request.transactionId,
        amount: Math.round(request.amount * 100),
        reason: this.mapRefundReason(request.reason),
      });

      return {
        success: refund.status === "succeeded",
        refundId: refund.id,
        rawResponse: refund,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
        rawResponse: error,
      };
    }
  }

  private mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason | undefined {
    if (!reason) return undefined;
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("duplicate")) return "duplicate";
    if (lowerReason.includes("fraud")) return "fraudulent";
    return "requested_by_customer";
  }

  async getPaymentStatus(transactionId: string): Promise<{ status: string; rawResponse?: unknown }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
      return {
        status: paymentIntent.status,
        rawResponse: paymentIntent,
      };
    } catch (error) {
      return {
        status: "error",
        rawResponse: error,
      };
    }
  }

  validateWebhook(payload: string | Buffer, signature: string): WebhookValidationResult {
    if (!this.config.webhookSecret) {
      return { valid: false, error: "Webhook secret not configured" };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      return {
        valid: true,
        event: {
          type: event.type,
          data: event.data.object as unknown as Record<string, unknown>,
          timestamp: new Date(event.created * 1000),
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid webhook signature",
      };
    }
  }

  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodResponse> {
    try {
      // Get or create Stripe customer
      const customers = await this.stripe.customers.list({
        limit: 1,
      });

      // In real implementation, you'd look up by Hyble customer ID
      let stripeCustomerId: string;

      if (customers.data.length > 0 && customers.data[0]) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await this.stripe.customers.create({
          metadata: { hybleCustomerId: customerId },
        });
        stripeCustomerId = customer.id;
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      return {
        success: true,
        paymentMethodId,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
        rawResponse: error,
      };
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      return { success: true };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
      };
    }
  }

  async listPaymentMethods(stripeCustomerId: string): Promise<SavedPaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
      });

      return paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: "card" as const,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
      }));
    } catch {
      return [];
    }
  }

  // Create a checkout session for hosted payment page
  async createCheckoutSession(request: PaymentRequest & { successUrl: string; cancelUrl: string }) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              product_data: {
                name: request.description || "Payment",
              },
              unit_amount: Math.round(request.amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        client_reference_id: request.orderId,
        customer_email: request.customerEmail,
        metadata: {
          orderId: request.orderId,
          customerId: request.customerId,
        },
      });

      return {
        success: true,
        sessionId: session.id,
        redirectUrl: session.url,
        rawResponse: session,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: stripeError.message,
        rawResponse: error,
      };
    }
  }
}

// Payment Gateway Factory
import { prisma } from "@hyble/db";
import { PaymentGateway, GatewayConfig } from "./types";
import { StripeGateway, StripeConfig } from "./StripeGateway";
import { IyzicoGateway, IyzicoConfig } from "./IyzicoGateway";
import { PayTRGateway, PayTRConfig } from "./PayTRGateway";
import { ManualGateway } from "./ManualGateway";

type GatewayInstance = PaymentGateway | StripeGateway | IyzicoGateway | PayTRGateway | ManualGateway;

// Cache for gateway instances
const gatewayCache = new Map<string, GatewayInstance>();

export class GatewayFactory {
  /**
   * Get a payment gateway by slug
   */
  static async getGateway(slug: string): Promise<GatewayInstance | null> {
    // Check cache first
    if (gatewayCache.has(slug)) {
      return gatewayCache.get(slug) || null;
    }

    // Get gateway config from database
    const gatewayRecord = await prisma.billingPaymentGateway.findFirst({
      where: { slug, isActive: true },
    });

    if (!gatewayRecord) {
      return null;
    }

    const config = (gatewayRecord.credentials || {}) as GatewayConfig;
    const gateway = this.createGateway(slug, config);

    if (gateway) {
      gatewayCache.set(slug, gateway);
    }

    return gateway;
  }

  /**
   * Get a payment gateway by ID
   */
  static async getGatewayById(id: string): Promise<GatewayInstance | null> {
    const gatewayRecord = await prisma.billingPaymentGateway.findUnique({
      where: { id },
    });

    if (!gatewayRecord || !gatewayRecord.isActive) {
      return null;
    }

    // Check cache
    if (gatewayCache.has(gatewayRecord.slug)) {
      return gatewayCache.get(gatewayRecord.slug) || null;
    }

    const config = (gatewayRecord.credentials || {}) as GatewayConfig;
    const gateway = this.createGateway(gatewayRecord.slug, config);

    if (gateway) {
      gatewayCache.set(gatewayRecord.slug, gateway);
    }

    return gateway;
  }

  /**
   * Get the default payment gateway
   */
  static async getDefaultGateway(): Promise<GatewayInstance | null> {
    const gatewayRecord = await prisma.billingPaymentGateway.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (!gatewayRecord) {
      return null;
    }

    return this.getGateway(gatewayRecord.slug);
  }

  /**
   * Create a gateway instance from config
   */
  static createGateway(slug: string, config: GatewayConfig): GatewayInstance | null {
    switch (slug.toLowerCase()) {
      case "stripe":
        if (!config.apiKey) {
          console.error("Stripe gateway requires apiKey");
          return null;
        }
        return new StripeGateway(config as StripeConfig);

      case "iyzico":
        if (!config.apiKey || !config.secretKey) {
          console.error("iyzico gateway requires apiKey and secretKey");
          return null;
        }
        return new IyzicoGateway(config as IyzicoConfig);

      case "paytr":
        if (!config.merchantId || !config.merchantKey || !config.merchantSalt) {
          console.error("PayTR gateway requires merchantId, merchantKey, and merchantSalt");
          return null;
        }
        return new PayTRGateway(config as PayTRConfig);

      case "manual":
        return new ManualGateway(config);

      default:
        console.error(`Unknown gateway slug: ${slug}`);
        return null;
    }
  }

  /**
   * Clear gateway cache (useful after config changes)
   */
  static clearCache(slug?: string): void {
    if (slug) {
      gatewayCache.delete(slug);
    } else {
      gatewayCache.clear();
    }
  }

  /**
   * Get all available gateways from database
   */
  static async getAvailableGateways(): Promise<Array<{
    id: string;
    slug: string;
    name: string;
    isDefault: boolean;
    supportedCurrencies: string[];
  }>> {
    const gateways = await prisma.billingPaymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        isDefault: true,
        supportedCurrencies: true,
      },
    });

    return gateways;
  }

  /**
   * Initialize default gateways in database if they don't exist
   */
  static async initializeDefaultGateways(): Promise<void> {
    const defaultGateways = [
      {
        slug: "stripe",
        name: "Stripe",
        supportedCurrencies: ["EUR", "USD", "GBP", "TRY"],
      },
      {
        slug: "iyzico",
        name: "iyzico",
        supportedCurrencies: ["TRY", "EUR", "USD"],
      },
      {
        slug: "paytr",
        name: "PayTR",
        supportedCurrencies: ["TRY", "EUR", "USD"],
      },
      {
        slug: "manual",
        name: "Manual Payment",
        supportedCurrencies: ["TRY", "EUR", "USD", "GBP"],
      },
    ];

    for (const gateway of defaultGateways) {
      await prisma.billingPaymentGateway.upsert({
        where: { slug: gateway.slug },
        create: {
          ...gateway,
          credentials: {},
          isActive: gateway.slug === "manual", // Only manual is active by default
        },
        update: {}, // Don't update if exists
      });
    }
  }
}

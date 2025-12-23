// TaxService - Vergi hesaplama
import { prisma } from "@hyble/db";
import type { TaxCalculationInput, TaxCalculationResult, TaxBreakdownItem } from "./types";

// Default tax rates by country
const DEFAULT_TAX_RATES: Record<string, number> = {
  TR: 20, // KDV
  DE: 19, // Germany
  FR: 20, // France
  UK: 20, // UK VAT
  GB: 20, // UK VAT (alternative code)
  US: 0, // No federal sales tax (state-specific)
  NL: 21, // Netherlands
  BE: 21, // Belgium
  IT: 22, // Italy
  ES: 21, // Spain
  AT: 20, // Austria
  PL: 23, // Poland
  SE: 25, // Sweden
  DK: 25, // Denmark
  FI: 24, // Finland
  NO: 25, // Norway
  CH: 7.7, // Switzerland
  IE: 23, // Ireland
  PT: 23, // Portugal
  CZ: 21, // Czech Republic
  RO: 19, // Romania
  HU: 27, // Hungary
  GR: 24, // Greece
  BG: 20, // Bulgaria
  HR: 25, // Croatia
  SK: 20, // Slovakia
  SI: 22, // Slovenia
  LT: 21, // Lithuania
  LV: 21, // Latvia
  EE: 20, // Estonia
  CY: 19, // Cyprus
  MT: 18, // Malta
  LU: 17, // Luxembourg
};

// EU member countries for VAT reverse charge
const EU_COUNTRIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT",
  "NL", "PL", "PT", "RO", "SE", "SI", "SK",
];

export class TaxService {
  /**
   * Calculate tax for a given amount
   */
  async calculate(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    const { subtotal, country, state, isExempt, vatNumber } = input;

    // Check if customer is tax exempt
    if (isExempt) {
      return {
        taxRate: 0,
        taxAmount: 0,
        isInclusive: false,
        breakdown: [],
      };
    }

    // Check for VAT reverse charge (B2B in EU with valid VAT number)
    if (vatNumber && EU_COUNTRIES.includes(country)) {
      const isValid = await this.validateVatNumber(vatNumber, country);
      if (isValid) {
        return {
          taxRate: 0,
          taxAmount: 0,
          isInclusive: false,
          breakdown: [
            {
              name: "VAT Reverse Charge",
              rate: 0,
              amount: 0,
            },
          ],
        };
      }
    }

    // Get tax rules from database
    const taxRules = await prisma.taxRule.findMany({
      where: {
        isActive: true,
        OR: [
          { country: null }, // Global rules
          { country }, // Country-specific
          { country, state }, // State-specific
        ],
      },
      orderBy: { priority: "desc" },
    });

    // If no custom rules, use default rates
    if (taxRules.length === 0) {
      const rate = DEFAULT_TAX_RATES[country] || 0;
      const taxAmount = (subtotal * rate) / 100;

      return {
        taxRate: rate,
        taxAmount,
        isInclusive: false,
        breakdown: rate > 0
          ? [{ name: this.getTaxName(country), rate, amount: taxAmount }]
          : [],
      };
    }

    // Apply tax rules
    let totalTax = 0;
    let effectiveRate = 0;
    const breakdown: TaxBreakdownItem[] = [];
    let baseAmount = subtotal;

    for (const rule of taxRules) {
      const rate = parseFloat(rule.rate.toString());
      let taxAmount: number;

      if (rule.isCompound) {
        // Compound tax is calculated on subtotal + previous taxes
        taxAmount = (baseAmount * rate) / 100;
        baseAmount += taxAmount;
      } else {
        // Simple tax is calculated on original subtotal
        taxAmount = (subtotal * rate) / 100;
      }

      totalTax += taxAmount;
      effectiveRate += rate;

      breakdown.push({
        name: rule.name,
        rate,
        amount: taxAmount,
      });
    }

    return {
      taxRate: effectiveRate,
      taxAmount: totalTax,
      isInclusive: taxRules[0]?.isInclusive ?? false,
      breakdown,
    };
  }

  /**
   * Get tax name based on country
   */
  private getTaxName(country: string): string {
    switch (country) {
      case "TR":
        return "KDV";
      case "US":
        return "Sales Tax";
      case "CA":
        return "GST/HST";
      case "AU":
        return "GST";
      case "JP":
        return "Consumption Tax";
      case "IN":
        return "GST";
      case "CH":
        return "MWST";
      default:
        if (EU_COUNTRIES.includes(country)) {
          return "VAT";
        }
        return "Tax";
    }
  }

  /**
   * Validate VAT number (stub - implement VIES check)
   */
  async validateVatNumber(vatNumber: string, country: string): Promise<boolean> {
    // Basic format validation
    const vatPatterns: Record<string, RegExp> = {
      AT: /^ATU\d{8}$/,
      BE: /^BE0?\d{9,10}$/,
      BG: /^BG\d{9,10}$/,
      CY: /^CY\d{8}[A-Z]$/,
      CZ: /^CZ\d{8,10}$/,
      DE: /^DE\d{9}$/,
      DK: /^DK\d{8}$/,
      EE: /^EE\d{9}$/,
      ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
      FI: /^FI\d{8}$/,
      FR: /^FR[A-Z0-9]{2}\d{9}$/,
      GB: /^GB(\d{9}|\d{12}|(GD|HA)\d{3})$/,
      GR: /^EL\d{9}$/,
      HR: /^HR\d{11}$/,
      HU: /^HU\d{8}$/,
      IE: /^IE\d{7}[A-Z]{1,2}$/,
      IT: /^IT\d{11}$/,
      LT: /^LT(\d{9}|\d{12})$/,
      LU: /^LU\d{8}$/,
      LV: /^LV\d{11}$/,
      MT: /^MT\d{8}$/,
      NL: /^NL\d{9}B\d{2}$/,
      PL: /^PL\d{10}$/,
      PT: /^PT\d{9}$/,
      RO: /^RO\d{2,10}$/,
      SE: /^SE\d{12}$/,
      SI: /^SI\d{8}$/,
      SK: /^SK\d{10}$/,
    };

    const pattern = vatPatterns[country];
    if (!pattern) {
      return false;
    }

    // Normalize VAT number
    const normalized = vatNumber.replace(/[\s.-]/g, "").toUpperCase();

    if (!pattern.test(normalized)) {
      return false;
    }

    // TODO: Implement VIES API validation
    // For now, assume format-valid numbers are valid
    return true;
  }

  /**
   * Check if VAT exemption is stored for customer
   */
  async checkExemption(customerId: string): Promise<{
    isExempt: boolean;
    exemptionType?: string;
    vatNumber?: string;
  }> {
    const exemption = await prisma.taxExemption.findUnique({
      where: { customerId },
    });

    if (!exemption || !exemption.isVerified) {
      return { isExempt: false };
    }

    return {
      isExempt: true,
      exemptionType: exemption.exemptionType,
      vatNumber: exemption.taxNumber || undefined,
    };
  }

  /**
   * Create or update tax exemption
   */
  async setExemption(
    customerId: string,
    exemptionType: string,
    taxNumber?: string
  ): Promise<void> {
    await prisma.taxExemption.upsert({
      where: { customerId },
      create: {
        customerId,
        exemptionType,
        taxNumber,
        isVerified: false,
      },
      update: {
        exemptionType,
        taxNumber,
        isVerified: false,
      },
    });
  }

  /**
   * Verify tax exemption
   */
  async verifyExemption(customerId: string): Promise<boolean> {
    const exemption = await prisma.taxExemption.findUnique({
      where: { customerId },
    });

    if (!exemption || !exemption.taxNumber) {
      return false;
    }

    // Get customer country
    const customer = await prisma.billingCustomer.findUnique({
      where: { id: customerId },
      select: { country: true },
    });

    if (!customer?.country) {
      return false;
    }

    // Validate VAT number
    const isValid = await this.validateVatNumber(exemption.taxNumber, customer.country);

    if (isValid) {
      await prisma.taxExemption.update({
        where: { customerId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });
    }

    return isValid;
  }

  /**
   * Get tax rules
   */
  async getTaxRules(country?: string) {
    return prisma.taxRule.findMany({
      where: country ? { country } : {},
      orderBy: [{ country: "asc" }, { priority: "desc" }],
    });
  }

  /**
   * Create tax rule
   */
  async createTaxRule(input: {
    name: string;
    country?: string;
    state?: string;
    rate: number;
    isInclusive?: boolean;
    isCompound?: boolean;
    priority?: number;
  }) {
    return prisma.taxRule.create({
      data: {
        name: input.name,
        country: input.country,
        state: input.state,
        rate: input.rate,
        isInclusive: input.isInclusive ?? false,
        isCompound: input.isCompound ?? false,
        priority: input.priority ?? 0,
        isActive: true,
      },
    });
  }

  /**
   * Update tax rule
   */
  async updateTaxRule(id: string, input: Partial<{
    name: string;
    rate: number;
    isInclusive: boolean;
    isCompound: boolean;
    priority: number;
    isActive: boolean;
  }>) {
    return prisma.taxRule.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Delete tax rule
   */
  async deleteTaxRule(id: string) {
    return prisma.taxRule.delete({
      where: { id },
    });
  }
}

// Singleton instance
export const taxService = new TaxService();

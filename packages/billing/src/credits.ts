// Hyble Credits management

export interface CreditsBalance {
  available: number;
  pending: number;
  currency: "GBP";
}

export interface CreditTransaction {
  id: string;
  type: "deposit" | "purchase" | "refund" | "bonus";
  amount: number;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export function formatCredits(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function canAfford(balance: CreditsBalance, amount: number): boolean {
  return balance.available >= amount;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number
): { discountedPrice: number; savings: number } {
  const savings = originalPrice * (discountPercent / 100);
  return {
    discountedPrice: originalPrice - savings,
    savings,
  };
}

// Credit tier bonuses
export const CREDIT_TIERS = [
  { minAmount: 10, bonusPercent: 0 },
  { minAmount: 25, bonusPercent: 5 },
  { minAmount: 50, bonusPercent: 10 },
  { minAmount: 100, bonusPercent: 15 },
  { minAmount: 250, bonusPercent: 20 },
] as const;

export function calculateCreditBonus(depositAmount: number): {
  bonusPercent: number;
  bonusAmount: number;
  totalCredits: number;
} {
  const tier = [...CREDIT_TIERS]
    .reverse()
    .find((t) => depositAmount >= t.minAmount);

  const bonusPercent = tier?.bonusPercent ?? 0;
  const bonusAmount = depositAmount * (bonusPercent / 100);

  return {
    bonusPercent,
    bonusAmount,
    totalCredits: depositAmount + bonusAmount,
  };
}

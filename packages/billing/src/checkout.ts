// Checkout flow types and logic

export type PaymentMethod = "credits" | "card" | "paypal";

export interface CheckoutSession {
  id: string;
  cartId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod?: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: "GBP" | "USD" | "EUR";
  createdAt: Date;
  expiresAt: Date;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
  redirectUrl?: string;
}

export function calculateCheckoutTotals(
  subtotal: number,
  discountPercent: number = 0,
  taxRate: number = 0.2 // UK VAT 20%
): {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
} {
  const discount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * taxRate;
  const total = afterDiscount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}

export function isSessionExpired(session: CheckoutSession): boolean {
  return new Date() > new Date(session.expiresAt);
}

export function formatPrice(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

// Checkout steps
export const CHECKOUT_STEPS = [
  { id: "review", label: "Review Order" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirmation" },
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]["id"];

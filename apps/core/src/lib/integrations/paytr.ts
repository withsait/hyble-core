/**
 * PayTR Payment Gateway Integration
 * Documentation: https://dev.paytr.com/
 */

import crypto from "crypto";

// PayTR Configuration
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";
const PAYTR_API_URL = "https://www.paytr.com/odeme/api/get-token";
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === "true" ? 1 : 0;

export interface PayTRBasket {
  name: string;
  price: string; // Kuruş cinsinden (100.00 TRY = "10000")
  quantity: number;
}

export interface PayTRPaymentRequest {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userIp: string;
  userAddress?: string;
  merchantOid: string; // Unique order ID
  amount: number; // TRY cinsinden
  basket: PayTRBasket[];
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
  currency?: "TL" | "EUR" | "USD" | "GBP" | "RUB";
  installmentCount?: number;
  noInstallment?: boolean;
  maxInstallment?: number;
  lang?: "tr" | "en";
}

export interface PayTRTokenResponse {
  status: "success" | "failed";
  token?: string;
  reason?: string;
}

export interface PayTRWebhookData {
  merchant_oid: string;
  status: "success" | "failed";
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;
}

/**
 * Generate PayTR payment token (iFrame için)
 */
export async function createPayTRToken(
  request: PayTRPaymentRequest
): Promise<PayTRTokenResponse> {
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR credentials not configured");
  }

  // Basket JSON formatı: [[name, price, quantity], ...]
  const basketJson = JSON.stringify(
    request.basket.map((item) => [item.name, item.price, item.quantity])
  );
  const userBasket = Buffer.from(basketJson).toString("base64");

  // Amount kuruş cinsinden (100.00 TRY = 10000)
  const paymentAmount = Math.round(request.amount * 100).toString();

  // Currency (default TL)
  const currency = request.currency || "TL";

  // No installment
  const noInstallment = request.noInstallment ? 1 : 0;
  const maxInstallment = request.maxInstallment || 0;

  // Hash string oluştur
  const hashStr =
    PAYTR_MERCHANT_ID +
    request.userIp +
    request.merchantOid +
    request.userEmail +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    PAYTR_TEST_MODE +
    PAYTR_MERCHANT_SALT;

  // Hash hesapla
  const paytrToken = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  // API isteği için parametreler
  const params = new URLSearchParams({
    merchant_id: PAYTR_MERCHANT_ID,
    user_ip: request.userIp,
    merchant_oid: request.merchantOid,
    email: request.userEmail,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: PAYTR_TEST_MODE.toString(),
    no_installment: noInstallment.toString(),
    max_installment: maxInstallment.toString(),
    user_name: request.userName,
    user_address: request.userAddress || "Türkiye",
    user_phone: request.userPhone || "05000000000",
    merchant_ok_url: request.successUrl,
    merchant_fail_url: request.failUrl,
    timeout_limit: "30",
    currency: currency,
    test_mode: PAYTR_TEST_MODE.toString(),
    lang: request.lang || "tr",
  });

  try {
    const response = await fetch(PAYTR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.status === "success") {
      return {
        status: "success",
        token: data.token,
      };
    } else {
      console.error("PayTR token error:", data.reason);
      return {
        status: "failed",
        reason: data.reason || "Unknown error",
      };
    }
  } catch (error) {
    console.error("PayTR API error:", error);
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Verify PayTR webhook hash
 */
export function verifyPayTRWebhook(data: PayTRWebhookData): boolean {
  if (!PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR credentials not configured");
  }

  const hashStr =
    data.merchant_oid +
    PAYTR_MERCHANT_SALT +
    data.status +
    data.total_amount;

  const expectedHash = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  return expectedHash === data.hash;
}

/**
 * Generate iFrame URL
 */
export function getPayTRiFrameUrl(token: string): string {
  return `https://www.paytr.com/odeme/guvenli/${token}`;
}

/**
 * Parse webhook status
 */
export function parsePayTRStatus(status: string): {
  success: boolean;
  message: string;
} {
  if (status === "success") {
    return { success: true, message: "Ödeme başarılı" };
  }
  return { success: false, message: "Ödeme başarısız" };
}

/**
 * Format amount for PayTR (kuruş)
 */
export function formatPayTRAmount(amount: number): string {
  return Math.round(amount * 100).toString();
}

/**
 * Parse PayTR amount (kuruş to TRY)
 */
export function parsePayTRAmount(amountKurus: string): number {
  return parseInt(amountKurus, 10) / 100;
}

export const paytr = {
  createToken: createPayTRToken,
  verifyWebhook: verifyPayTRWebhook,
  getIFrameUrl: getPayTRiFrameUrl,
  parseStatus: parsePayTRStatus,
  formatAmount: formatPayTRAmount,
  parseAmount: parsePayTRAmount,
};

export default paytr;

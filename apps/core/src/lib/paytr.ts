import crypto from "crypto";

// PayTR API Configuration
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === "true";

// PayTR iFrame API URLs
const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";

export interface PayTRBasketItem {
  name: string;
  price: string; // Format: "1000" (10.00 TL için)
  quantity: number;
}

export interface PayTRPaymentRequest {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userIp: string;
  merchantOid: string; // Order ID
  amount: number; // Kuruş cinsinden (1000 = 10.00 TL)
  currency: "TL" | "EUR" | "USD" | "GBP";
  basketItems: PayTRBasketItem[];
  noInstallment?: boolean;
  maxInstallment?: number;
  successUrl: string;
  failUrl: string;
  lang?: "tr" | "en";
}

export interface PayTRTokenResponse {
  status: "success" | "failed";
  token?: string;
  reason?: string;
}

export interface PayTRCallbackData {
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
 * Generate PayTR iFrame token for payment
 */
export async function createPayTRToken(request: PayTRPaymentRequest): Promise<PayTRTokenResponse> {
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR credentials not configured");
  }

  // Basket JSON (base64 encoded)
  const basketJson = JSON.stringify(
    request.basketItems.map((item) => [item.name, item.price, item.quantity])
  );
  const userBasket = Buffer.from(basketJson).toString("base64");

  // Payment parameters
  const merchantOid = request.merchantOid;
  const email = request.userEmail;
  const paymentAmount = request.amount.toString();
  const noInstallment = request.noInstallment ? "1" : "0";
  const maxInstallment = request.maxInstallment?.toString() || "0";
  const currency = request.currency === "TL" ? "TL" : request.currency;
  const testMode = PAYTR_TEST_MODE ? "1" : "0";
  const lang = request.lang || "tr";

  // Generate hash
  const hashStr =
    PAYTR_MERCHANT_ID +
    request.userIp +
    merchantOid +
    email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    testMode +
    PAYTR_MERCHANT_SALT;

  const paytrToken = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY).update(hashStr).digest("base64");

  // Prepare form data
  const formData = new URLSearchParams();
  formData.append("merchant_id", PAYTR_MERCHANT_ID);
  formData.append("user_ip", request.userIp);
  formData.append("merchant_oid", merchantOid);
  formData.append("email", email);
  formData.append("payment_amount", paymentAmount);
  formData.append("paytr_token", paytrToken);
  formData.append("user_basket", userBasket);
  formData.append("debug_on", testMode === "1" ? "1" : "0");
  formData.append("no_installment", noInstallment);
  formData.append("max_installment", maxInstallment);
  formData.append("user_name", request.userName);
  formData.append("user_address", request.userAddress);
  formData.append("user_phone", request.userPhone);
  formData.append("merchant_ok_url", request.successUrl);
  formData.append("merchant_fail_url", request.failUrl);
  formData.append("timeout_limit", "30");
  formData.append("currency", currency);
  formData.append("test_mode", testMode);
  formData.append("lang", lang);

  try {
    const response = await fetch(PAYTR_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.status === "success") {
      return {
        status: "success",
        token: data.token,
      };
    } else {
      return {
        status: "failed",
        reason: data.reason || "Unknown error",
      };
    }
  } catch (error) {
    console.error("PayTR token error:", error);
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Verify PayTR callback hash
 */
export function verifyPayTRCallback(data: PayTRCallbackData): boolean {
  if (!PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR credentials not configured");
  }

  const hashStr =
    data.merchant_oid + PAYTR_MERCHANT_SALT + data.status + data.total_amount;

  const expectedHash = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  return data.hash === expectedHash;
}

/**
 * Get PayTR iFrame URL
 */
export function getPayTRIframeUrl(token: string): string {
  return `https://www.paytr.com/odeme/guvenli/${token}`;
}

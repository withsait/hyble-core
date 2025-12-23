/**
 * Webhook System
 * Send event notifications to external URLs
 *
 * Note: Full implementation requires WebhookEndpoint and WebhookDelivery tables
 * in the database schema. This is a placeholder implementation.
 */

import { createHmac } from "crypto";

// Webhook event types
export type WebhookEventType =
  // Order events
  | "order.created"
  | "order.paid"
  | "order.cancelled"
  | "order.refunded"
  // Invoice events
  | "invoice.created"
  | "invoice.paid"
  | "invoice.overdue"
  // Subscription events
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "subscription.renewed"
  // Support events
  | "ticket.created"
  | "ticket.replied"
  | "ticket.resolved"
  // User events
  | "user.created"
  | "user.updated";

interface WebhookPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Generate HMAC signature for webhook payload
 */
export function generateSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Send webhook to a single endpoint
 */
export async function sendWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payloadStr = JSON.stringify(payload);
  const signature = generateSignature(payloadStr, secret);
  const timestamp = Date.now().toString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": timestamp,
        "X-Webhook-Id": payload.id,
        "User-Agent": "Hyble-Webhook/1.0",
      },
      body: payloadStr,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a webhook payload
 */
export function createWebhookPayload(
  event: WebhookEventType,
  data: Record<string, unknown>
): WebhookPayload {
  return {
    id: `whevt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    event,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Verify incoming webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);

  // Use timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Trigger webhook event (placeholder - requires database integration)
 *
 * To use this, you need to:
 * 1. Add WebhookEndpoint and WebhookDelivery models to the Prisma schema
 * 2. Implement endpoint lookup and delivery logging
 */
export async function triggerWebhook(
  event: WebhookEventType,
  data: Record<string, unknown>,
  _userId?: string,
  _organizationId?: string
): Promise<void> {
  // Placeholder - log event for now
  console.log(`[Webhook] Event triggered: ${event}`, { data });

  // TODO: Implement database-backed webhook delivery
  // 1. Look up active endpoints for this event
  // 2. Send webhook to each endpoint
  // 3. Log delivery attempts
}

// Export event trigger helpers (placeholder implementations)
export const webhooks = {
  order: {
    created: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("order.created", data, userId),
    paid: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("order.paid", data, userId),
    cancelled: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("order.cancelled", data, userId),
    refunded: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("order.refunded", data, userId),
  },
  invoice: {
    created: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("invoice.created", data, userId),
    paid: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("invoice.paid", data, userId),
    overdue: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("invoice.overdue", data, userId),
  },
  subscription: {
    created: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("subscription.created", data, userId),
    updated: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("subscription.updated", data, userId),
    cancelled: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("subscription.cancelled", data, userId),
    renewed: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("subscription.renewed", data, userId),
  },
  ticket: {
    created: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("ticket.created", data, userId),
    replied: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("ticket.replied", data, userId),
    resolved: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("ticket.resolved", data, userId),
  },
  user: {
    created: (data: Record<string, unknown>) =>
      triggerWebhook("user.created", data),
    updated: (data: Record<string, unknown>, userId?: string) =>
      triggerWebhook("user.updated", data, userId),
  },
};

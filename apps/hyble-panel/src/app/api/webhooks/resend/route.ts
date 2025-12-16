import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { updateEmailLogFromWebhook } from "@/lib/email";
import type { EmailStatus } from "@prisma/client";

// Resend webhook event types
interface ResendWebhookEvent {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.bounced"
    | "email.complained"
    | "email.opened"
    | "email.clicked";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // bounce specific
    bounce?: {
      message: string;
    };
    // click specific
    click?: {
      link: string;
      timestamp: string;
      userAgent: string;
      ipAddress: string;
    };
  };
}

// Map Resend event types to our EmailStatus enum
function mapEventToStatus(eventType: string): EmailStatus | null {
  const mapping: Record<string, EmailStatus> = {
    "email.sent": "SENT",
    "email.delivered": "DELIVERED",
    "email.bounced": "BOUNCED",
    "email.complained": "COMPLAINED",
    "email.opened": "OPENED",
    "email.clicked": "CLICKED",
  };
  return mapping[eventType] || null;
}

/**
 * Resend Webhook Handler
 *
 * Handles email delivery events from Resend:
 * - email.sent: Email was sent
 * - email.delivered: Email was delivered to recipient
 * - email.delivery_delayed: Email delivery was delayed
 * - email.bounced: Email bounced
 * - email.complained: Recipient marked as spam
 * - email.opened: Email was opened
 * - email.clicked: Link in email was clicked
 *
 * Webhook verification uses Svix (Resend's webhook signature)
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  // Skip verification in development or if no secret configured
  if (!webhookSecret) {
    console.warn("RESEND_WEBHOOK_SECRET not configured - skipping signature verification");
  }

  try {
    const body = await request.text();
    const headers = {
      "svix-id": request.headers.get("svix-id") || "",
      "svix-timestamp": request.headers.get("svix-timestamp") || "",
      "svix-signature": request.headers.get("svix-signature") || "",
    };

    let event: ResendWebhookEvent;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      try {
        const wh = new Webhook(webhookSecret);
        event = wh.verify(body, headers) as ResendWebhookEvent;
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    } else {
      // Parse without verification (development only)
      event = JSON.parse(body) as ResendWebhookEvent;
    }

    const resendId = event.data.email_id;
    const status = mapEventToStatus(event.type);

    if (!status) {
      // Unknown event type - log and ignore
      console.log(`Unknown Resend webhook event: ${event.type}`);
      return NextResponse.json({ received: true });
    }

    // Prepare additional data based on event type
    const additionalData: {
      openedAt?: Date;
      clickedAt?: Date;
      deliveredAt?: Date;
      bouncedAt?: Date;
      complainedAt?: Date;
      error?: string;
    } = {};

    const eventTime = new Date(event.created_at);

    switch (event.type) {
      case "email.delivered":
        additionalData.deliveredAt = eventTime;
        break;
      case "email.opened":
        additionalData.openedAt = eventTime;
        break;
      case "email.clicked":
        additionalData.clickedAt = eventTime;
        break;
      case "email.bounced":
        additionalData.bouncedAt = eventTime;
        additionalData.error = event.data.bounce?.message || "Email bounced";
        break;
      case "email.complained":
        additionalData.complainedAt = eventTime;
        additionalData.error = "Recipient marked as spam";
        break;
    }

    // Update email log
    const updated = await updateEmailLogFromWebhook(resendId, status, additionalData);

    if (!updated) {
      console.warn(`Failed to update email log for ${resendId}`);
    }

    console.log(`📧 Webhook: ${event.type} for ${resendId}`);

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Resend uses POST for webhooks
export async function GET() {
  return NextResponse.json({ message: "Resend webhook endpoint" });
}

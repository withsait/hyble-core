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
    bounce?: {
      message: string;
    };
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

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

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
      event = JSON.parse(body) as ResendWebhookEvent;
    }

    const resendId = event.data.email_id;
    const status = mapEventToStatus(event.type);

    if (!status) {
      console.log(`Unknown Resend webhook event: ${event.type}`);
      return NextResponse.json({ received: true });
    }

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

    await updateEmailLogFromWebhook(resendId, status, additionalData);

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

export async function GET() {
  return NextResponse.json({ message: "Resend webhook endpoint" });
}

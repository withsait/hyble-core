import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma, Prisma } from "@hyble/db";

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-11-17.clover",
    });
  }
  return stripe;
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}

// Helper function to get or create wallet
async function getOrCreateWallet(userId: string, currency: string = "EUR") {
  let wallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, currency, balance: 0 },
    });
  }

  return wallet;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`PaymentIntent ${paymentIntent.id} failed`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type;

  if (!userId || type !== "DEPOSIT") {
    console.log("Skipping non-deposit checkout session");
    return;
  }

  // Check if already processed
  const existingTx = await prisma.transaction.findFirst({
    where: { reference: session.id },
  });

  if (existingTx) {
    console.log(`Transaction ${session.id} already processed`);
    return;
  }

  const amount = (session.amount_total || 0) / 100;
  const currency = session.currency?.toUpperCase() || "EUR";

  const wallet = await getOrCreateWallet(userId, currency);
  const newBalance = wallet.balance.add(new Prisma.Decimal(amount));

  // Create transaction and update wallet atomically
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        status: "COMPLETED",
        amount: amount,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        currency,
        description: `Cüzdan yükleme - ${amount} ${currency}`,
        reference: session.id,
        paymentMethod: "STRIPE",
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
        },
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
  ]);

  console.log(`Deposit of ${amount} ${currency} added to wallet for user ${userId}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Find original transaction by payment intent
  const paymentIntentId = charge.payment_intent as string;

  const originalTx = await prisma.transaction.findFirst({
    where: {
      metadata: {
        path: ["stripePaymentIntent"],
        equals: paymentIntentId,
      },
    },
    include: { wallet: true },
  });

  if (!originalTx) {
    console.log(`No transaction found for payment intent ${paymentIntentId}`);
    return;
  }

  // Check if refund already processed
  const existingRefund = await prisma.transaction.findFirst({
    where: {
      reference: charge.id,
      type: "REFUND",
    },
  });

  if (existingRefund) {
    console.log(`Refund ${charge.id} already processed`);
    return;
  }

  const refundAmount = (charge.amount_refunded || 0) / 100;
  const wallet = originalTx.wallet;
  const newBalance = wallet.balance.sub(new Prisma.Decimal(refundAmount));

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "REFUND",
        status: "COMPLETED",
        amount: refundAmount,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        currency: originalTx.currency,
        description: `İade - ${refundAmount} ${originalTx.currency}`,
        reference: charge.id,
        paymentMethod: "STRIPE",
        metadata: {
          stripeChargeId: charge.id,
          stripePaymentIntent: paymentIntentId,
          originalTransactionId: originalTx.id,
        },
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
  ]);

  console.log(`Refund of ${refundAmount} processed for wallet ${wallet.id}`);
}

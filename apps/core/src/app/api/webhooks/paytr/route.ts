import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@hyble/db";
import { verifyPayTRCallback, PayTRCallbackData } from "@/lib/paytr";

// Helper function to get or create wallet
async function getOrCreateWallet(userId: string, currency: string = "TRY") {
  let wallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        currency,
        balance: 0,
        mainBalance: 0,
        bonusBalance: 0,
        promoBalance: 0,
      },
    });
  }

  return wallet;
}

export async function POST(request: NextRequest) {
  try {
    // PayTR callback comes as form-urlencoded
    const formData = await request.formData();

    const callbackData: PayTRCallbackData = {
      merchant_oid: formData.get("merchant_oid") as string,
      status: formData.get("status") as "success" | "failed",
      total_amount: formData.get("total_amount") as string,
      hash: formData.get("hash") as string,
      failed_reason_code: formData.get("failed_reason_code") as string | undefined,
      failed_reason_msg: formData.get("failed_reason_msg") as string | undefined,
      test_mode: formData.get("test_mode") as string | undefined,
      payment_type: formData.get("payment_type") as string | undefined,
      currency: formData.get("currency") as string | undefined,
      payment_amount: formData.get("payment_amount") as string | undefined,
    };

    // Verify hash
    if (!verifyPayTRCallback(callbackData)) {
      console.error("PayTR callback hash verification failed");
      return new NextResponse("HASH_ERROR", { status: 400 });
    }

    // Find the pending transaction by merchant_oid
    const pendingTx = await prisma.transaction.findFirst({
      where: {
        reference: callbackData.merchant_oid,
        status: "PENDING",
        paymentMethod: "PAYTR",
      },
      include: { wallet: true },
    });

    if (!pendingTx) {
      console.log(`No pending transaction found for merchant_oid: ${callbackData.merchant_oid}`);
      // Return OK to prevent PayTR from retrying
      return new NextResponse("OK", { status: 200 });
    }

    const wallet = pendingTx.wallet;

    if (callbackData.status === "success") {
      // Payment successful - update wallet and transaction
      const amount = parseFloat(callbackData.total_amount) / 100; // PayTR sends in kuruş
      const amountDecimal = new Prisma.Decimal(amount);
      const newMainBalance = wallet.mainBalance.add(amountDecimal);
      const newTotalBalance = wallet.balance.add(amountDecimal);

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: pendingTx.id },
          data: {
            status: "COMPLETED",
            balanceAfter: newTotalBalance,
            metadata: {
              ...(pendingTx.metadata as object || {}),
              paytrStatus: callbackData.status,
              paytrPaymentType: callbackData.payment_type,
              paytrCurrency: callbackData.currency,
              completedAt: new Date().toISOString(),
            },
          },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newTotalBalance,
            mainBalance: newMainBalance,
          },
        }),
      ]);

      console.log(`PayTR payment ${callbackData.merchant_oid} completed: ${amount} TRY`);
    } else {
      // Payment failed - update transaction status
      await prisma.transaction.update({
        where: { id: pendingTx.id },
        data: {
          status: "FAILED",
          metadata: {
            ...(pendingTx.metadata as object || {}),
            paytrStatus: callbackData.status,
            failedReasonCode: callbackData.failed_reason_code,
            failedReasonMsg: callbackData.failed_reason_msg,
            failedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`PayTR payment ${callbackData.merchant_oid} failed: ${callbackData.failed_reason_msg}`);
    }

    // PayTR expects "OK" response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("PayTR webhook error:", error);
    // Return OK to prevent retries on processing errors
    return new NextResponse("OK", { status: 200 });
  }
}

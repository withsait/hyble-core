import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { validateApiKey } from "@/lib/middleware/security";
import { rateLimitMiddleware, rateLimitConfigs } from "@/lib/middleware/rate-limit";

/**
 * Public API v1 - Wallet
 * GET /api/v1/wallet - Get wallet balance
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfigs.api.default);
  if (rateLimitResult) return rateLimitResult;

  // API Key validation
  const apiKeyResult = await validateApiKey(request);
  if (!apiKeyResult.valid) {
    return NextResponse.json(
      { error: apiKeyResult.error },
      { status: 401 }
    );
  }

  if (!apiKeyResult.userId) {
    return NextResponse.json(
      { error: "API key not associated with a user" },
      { status: 403 }
    );
  }

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { userId: apiKeyResult.userId },
      select: {
        id: true,
        balance: true,
        bonusBalance: true,
        currency: true,
        updatedAt: true,
      },
    });

    if (!wallet) {
      return NextResponse.json({
        data: {
          balance: "0.00",
          bonusBalance: "0.00",
          totalBalance: "0.00",
          currency: "EUR",
        },
      });
    }

    const balance = parseFloat(wallet.balance.toString());
    const bonusBalance = parseFloat(wallet.bonusBalance.toString());

    return NextResponse.json({
      data: {
        id: wallet.id,
        balance: balance.toFixed(2),
        bonusBalance: bonusBalance.toFixed(2),
        totalBalance: (balance + bonusBalance).toFixed(2),
        currency: wallet.currency,
        updatedAt: wallet.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API v1] Wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

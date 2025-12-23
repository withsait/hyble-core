import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { validateApiKey } from "@/lib/middleware/security";
import { rateLimitMiddleware, rateLimitConfigs } from "@/lib/middleware/rate-limit";

/**
 * Public API v1 - Invoices
 * GET /api/v1/invoices - List user's invoices
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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      userId: apiKeyResult.userId,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          subtotal: true,
          taxRate: true,
          taxAmount: true,
          total: true,
          currency: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        subtotal: inv.subtotal.toString(),
        taxRate: inv.taxRate.toString(),
        taxAmount: inv.taxAmount.toString(),
        total: inv.total.toString(),
        currency: inv.currency,
        dueDate: inv.dueDate?.toISOString() || null,
        paidAt: inv.paidAt?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("[API v1] Invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

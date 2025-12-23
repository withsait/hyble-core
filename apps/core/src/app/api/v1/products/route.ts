import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { validateApiKey } from "@/lib/middleware/security";
import { rateLimitMiddleware, rateLimitConfigs } from "@/lib/middleware/rate-limit";

/**
 * Public API v1 - Products
 * GET /api/v1/products - List products
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

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (category) {
      where.categoryId = category;
    }
    if (featured) {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          descriptionTr: true,
          descriptionEn: true,
          basePrice: true,
          currency: true,
          type: true,
          isFeatured: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: {
          tr: p.nameTr,
          en: p.nameEn,
        },
        description: {
          tr: p.descriptionTr,
          en: p.descriptionEn,
        },
        basePrice: p.basePrice?.toString() || null,
        currency: p.currency,
        type: p.type,
        featured: p.isFeatured,
        createdAt: p.createdAt.toISOString(),
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
    console.error("[API v1] Products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@hyble/db";

// Public endpoint - no authentication required
// Returns featured products for the landing page

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        isFeatured: true,
      },
      select: {
        id: true,
        slug: true,
        type: true,
        nameTr: true,
        nameEn: true,
        shortDescTr: true,
        shortDescEn: true,
        basePrice: true,
        tags: true,
        category: {
          select: {
            id: true,
            nameTr: true,
            nameEn: true,
            slug: true,
          },
        },
        media: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
          },
          orderBy: { price: "asc" },
        },
        _count: {
          select: { variants: true },
        },
      },
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    });

    // Calculate lowest price for each product
    const productsWithLowestPrice = products.map((product) => {
      const variantPrices = product.variants.map((v) => Number(v.price));
      const lowestPrice =
        variantPrices.length > 0
          ? Math.min(...variantPrices)
          : product.basePrice
            ? Number(product.basePrice)
            : null;

      return {
        ...product,
        primaryImage: product.media[0]?.url || null,
        lowestPrice,
        variantCount: product._count.variants,
        media: undefined,
        variants: undefined,
        _count: undefined,
      };
    });

    return NextResponse.json(
      { products: productsWithLowestPrice },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { products: [], error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

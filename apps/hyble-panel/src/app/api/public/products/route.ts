import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";

// Public endpoint - no authentication required
// Returns all active products with optional filtering

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    // Filter by category slug
    if (category) {
      where.category = { slug: category };
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { nameTr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { shortDescTr: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
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
        isFeatured: true,
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
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    // Fetch categories for filter
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameTr: true,
        nameEn: true,
        slug: true,
        icon: true,
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Process products
    const processedProducts = products.map((product) => {
      const variantPrices = product.variants.map((v) => Number(v.price));
      const lowestPrice =
        variantPrices.length > 0
          ? Math.min(...variantPrices)
          : product.basePrice
            ? Number(product.basePrice)
            : null;

      return {
        id: product.id,
        slug: product.slug,
        type: product.type,
        nameTr: product.nameTr,
        nameEn: product.nameEn,
        shortDescTr: product.shortDescTr,
        shortDescEn: product.shortDescEn,
        tags: product.tags,
        isFeatured: product.isFeatured,
        category: product.category,
        primaryImage: product.media[0]?.url || null,
        lowestPrice,
        basePrice: product.basePrice ? Number(product.basePrice) : null,
        variantCount: product._count.variants,
      };
    });

    // Process categories
    const processedCategories = categories.map((cat) => ({
      id: cat.id,
      nameTr: cat.nameTr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon,
      productCount: cat._count.products,
    }));

    return NextResponse.json(
      {
        products: processedProducts,
        categories: processedCategories,
        total: processedProducts.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { products: [], categories: [], error: "Failed to fetch products" },
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

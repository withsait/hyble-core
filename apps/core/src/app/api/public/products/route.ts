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
    const offset = parseInt(searchParams.get("offset") || "0");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const tags = searchParams.get("tags"); // comma-separated
    const type = searchParams.get("type"); // DIGITAL, SUBSCRIPTION, etc.
    const featured = searchParams.get("featured"); // true/false
    const sort = searchParams.get("sort") || "featured"; // featured, price-asc, price-desc, newest, name

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    // Filter by category slug
    if (category) {
      where.category = { slug: category };
    }

    // Filter by product type
    if (type) {
      where.type = type;
    }

    // Filter by featured
    if (featured === "true") {
      where.isFeatured = true;
    }

    // Filter by tags (any match)
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim().toLowerCase());
      where.tags = { hasSome: tagList };
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { nameTr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { shortDescTr: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // Build orderBy based on sort parameter
    let orderBy: any[] = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    switch (sort) {
      case "price-asc":
        orderBy = [{ basePrice: "asc" }, { createdAt: "desc" }];
        break;
      case "price-desc":
        orderBy = [{ basePrice: "desc" }, { createdAt: "desc" }];
        break;
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;
      case "name":
        orderBy = [{ nameTr: "asc" }];
        break;
      default:
        orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

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
        demoUrl: true,
        createdAt: true,
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
      orderBy,
      skip: offset,
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
        demoUrl: product.demoUrl,
        category: product.category,
        primaryImage: product.media[0]?.url || null,
        lowestPrice,
        basePrice: product.basePrice ? Number(product.basePrice) : null,
        variantCount: product._count.variants,
        createdAt: product.createdAt,
      };
    });

    // Apply price filtering after getting lowest prices (client-side calculation needed)
    let filteredByPrice = processedProducts;
    if (minPrice || maxPrice) {
      filteredByPrice = processedProducts.filter((p) => {
        const price = p.lowestPrice;
        if (price === null) return false;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Calculate price range stats for filters
    const allPrices = processedProducts
      .map((p) => p.lowestPrice)
      .filter((p): p is number => p !== null);
    const priceStats = {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
    };

    // Get all unique tags for filter
    const allTags = [...new Set(processedProducts.flatMap((p) => p.tags))].slice(0, 20);

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
        products: minPrice || maxPrice ? filteredByPrice : processedProducts,
        categories: processedCategories,
        total: totalCount,
        returned: (minPrice || maxPrice ? filteredByPrice : processedProducts).length,
        filters: {
          priceRange: priceStats,
          availableTags: allTags,
          types: ["DIGITAL", "SUBSCRIPTION", "BUNDLE", "SERVICE"],
        },
        pagination: {
          offset,
          limit,
          hasMore: offset + limit < totalCount,
        },
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

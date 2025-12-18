import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";

// Public endpoint - no authentication required
// Returns single product details by slug

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: "ACTIVE",
      },
      select: {
        id: true,
        slug: true,
        type: true,
        nameTr: true,
        nameEn: true,
        shortDescTr: true,
        shortDescEn: true,
        descriptionTr: true,
        descriptionEn: true,
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
          select: {
            id: true,
            url: true,
            type: true,
            alt: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            billingPeriod: true,
            isDefault: true,
            features: true,
          },
          orderBy: [{ isDefault: "desc" }, { price: "asc" }],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Process product
    const processedProduct = {
      id: product.id,
      slug: product.slug,
      type: product.type,
      nameTr: product.nameTr,
      nameEn: product.nameEn,
      shortDescTr: product.shortDescTr,
      shortDescEn: product.shortDescEn,
      descriptionTr: product.descriptionTr,
      descriptionEn: product.descriptionEn,
      tags: product.tags,
      isFeatured: product.isFeatured,
      category: product.category,
      media: product.media,
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price: Number(v.price),
        billingPeriod: v.billingPeriod,
        isDefault: v.isDefault,
        features: v.features,
      })),
      lowestPrice: product.variants.length > 0
        ? Math.min(...product.variants.map((v) => Number(v.price)))
        : product.basePrice
          ? Number(product.basePrice)
          : null,
    };

    return NextResponse.json(processedProduct, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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

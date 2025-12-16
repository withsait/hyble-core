import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

// ==================== INPUT SCHEMAS ====================

const categoryCreateSchema = z.object({
  nameTr: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

const productCreateSchema = z.object({
  type: z.enum(["DIGITAL", "SUBSCRIPTION", "BUNDLE", "SERVICE"]),
  nameTr: z.string().min(2).max(200),
  nameEn: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  categoryId: z.string().optional(),
  descriptionTr: z.string().optional(),
  descriptionEn: z.string().optional(),
  shortDescTr: z.string().max(300).optional(),
  shortDescEn: z.string().max(300).optional(),
  targetAudience: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  basePrice: z.number().min(0).optional(),
  currency: z.string().default("EUR"),
  taxRate: z.number().min(0).max(100).default(20),
  isFeatured: z.boolean().default(false),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  featuredOrder: z.number().int().optional(),
});

const variantCreateSchema = z.object({
  productId: z.string(),
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  price: z.number().min(0),
  currency: z.string().default("EUR"),
  features: z.record(z.any()).optional(),
  stockType: z.enum(["UNLIMITED", "LIMITED", "CAPACITY"]).default("UNLIMITED"),
  stockQty: z.number().int().optional(),
  billingPeriod: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
});

const variantUpdateSchema = variantCreateSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

const mediaCreateSchema = z.object({
  productId: z.string(),
  type: z.enum(["image", "video", "thumbnail", "banner", "icon"]),
  url: z.string().url(),
  alt: z.string().optional(),
  title: z.string().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  fileSize: z.number().int().optional(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

const metaUpdateSchema = z.object({
  productId: z.string(),
  metaTitleTr: z.string().max(70).optional(),
  metaTitleEn: z.string().max(70).optional(),
  metaDescTr: z.string().max(160).optional(),
  metaDescEn: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  keywordsTr: z.array(z.string()).default([]),
  keywordsEn: z.array(z.string()).default([]),
});

const bundleItemSchema = z.object({
  bundleProductId: z.string(),
  includedProductId: z.string(),
  quantity: z.number().int().min(1).default(1),
  individualValue: z.number().min(0),
  sortOrder: z.number().int().default(0),
});

const relationSchema = z.object({
  productId: z.string(),
  relatedId: z.string(),
  type: z.enum(["upsell", "crosssell", "accessory", "similar"]),
  sortOrder: z.number().int().default(0),
});

// ==================== ROUTER ====================

export const pimRouter = createTRPCRouter({
  // ==================== CATEGORY ====================

  // List categories (with tree structure)
  listCategories: protectedProcedure
    .input(z.object({
      includeInactive: z.boolean().default(false),
      parentId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where = {
        ...(input?.includeInactive ? {} : { isActive: true }),
        ...(input?.parentId !== undefined ? { parentId: input.parentId } : {}),
      };

      const categories = await prisma.category.findMany({
        where,
        include: {
          children: {
            where: input?.includeInactive ? {} : { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
      });

      return categories;
    }),

  // Get category by slug
  getCategoryBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await prisma.category.findUnique({
        where: { slug: input.slug },
        include: {
          parent: true,
          children: { orderBy: { sortOrder: "asc" } },
          products: {
            where: { status: "ACTIVE" },
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kategori bulunamadı" });
      }

      return category;
    }),

  // Create category (admin)
  createCategory: adminProcedure
    .input(categoryCreateSchema)
    .mutation(async ({ input }) => {
      // Check slug uniqueness
      const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
      }

      const category = await prisma.category.create({
        data: input,
      });

      return category;
    }),

  // Update category (admin)
  updateCategory: adminProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Check if exists
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kategori bulunamadı" });
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.category.findUnique({ where: { slug: data.slug } });
        if (slugExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  // Delete category (admin)
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Check if has products
      const productCount = await prisma.product.count({ where: { categoryId: input.id } });
      if (productCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Bu kategoride ${productCount} ürün var. Önce ürünleri taşıyın.`,
        });
      }

      // Check if has children
      const childCount = await prisma.category.count({ where: { parentId: input.id } });
      if (childCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Bu kategorinin ${childCount} alt kategorisi var. Önce alt kategorileri silin.`,
        });
      }

      await prisma.category.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ==================== PRODUCT ====================

  // List products
  listProducts: protectedProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
      type: z.enum(["DIGITAL", "SUBSCRIPTION", "BUNDLE", "SERVICE"]).optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      isFeatured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where = {
        ...(input?.status && { status: input.status }),
        ...(input?.type && { type: input.type }),
        ...(input?.categoryId && { categoryId: input.categoryId }),
        ...(input?.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input?.search && {
          OR: [
            { nameTr: { contains: input.search, mode: "insensitive" as const } },
            { nameEn: { contains: input.search, mode: "insensitive" as const } },
            { tags: { has: input.search } },
          ],
        }),
      };

      const products = await prisma.product.findMany({
        where,
        take: (input?.limit || 20) + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { isFeatured: "desc" },
          { featuredOrder: "asc" },
          { createdAt: "desc" },
        ],
        include: {
          category: { select: { id: true, nameTr: true, nameEn: true, slug: true } },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          media: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: { select: { variants: true } },
        },
      });

      let nextCursor: string | undefined;
      if (products.length > (input?.limit || 20)) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id;
      }

      return {
        products: products.map((p) => ({
          id: p.id,
          type: p.type,
          status: p.status,
          nameTr: p.nameTr,
          nameEn: p.nameEn,
          slug: p.slug,
          shortDescTr: p.shortDescTr,
          shortDescEn: p.shortDescEn,
          basePrice: p.basePrice?.toString(),
          currency: p.currency,
          isFeatured: p.isFeatured,
          category: p.category,
          primaryImage: p.media[0]?.url,
          lowestPrice: p.variants[0]?.price.toString(),
          variantCount: p._count.variants,
          createdAt: p.createdAt,
        })),
        nextCursor,
      };
    }),

  // Get product by slug (public)
  getProductBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          media: { orderBy: { sortOrder: "asc" } },
          meta: true,
          relations: {
            include: {
              relatedProduct: {
                include: {
                  media: { where: { isPrimary: true }, take: 1 },
                  variants: { where: { isActive: true, isDefault: true }, take: 1 },
                },
              },
            },
          },
          bundleItems: {
            include: {
              includedProduct: {
                include: {
                  media: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ürün bulunamadı" });
      }

      return product;
    }),

  // Get product by ID (admin)
  getProductById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          variants: { orderBy: { sortOrder: "asc" } },
          media: { orderBy: { sortOrder: "asc" } },
          meta: true,
          relations: {
            include: { relatedProduct: { select: { id: true, nameTr: true, nameEn: true, slug: true } } },
          },
          bundleItems: {
            include: { includedProduct: { select: { id: true, nameTr: true, nameEn: true, slug: true } } },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ürün bulunamadı" });
      }

      return product;
    }),

  // Create product (admin)
  createProduct: adminProcedure
    .input(productCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
      }

      const product = await prisma.product.create({
        data: {
          ...input,
          basePrice: input.basePrice,
          createdBy: ctx.user.id,
        },
      });

      return product;
    }),

  // Update product (admin)
  updateProduct: adminProcedure
    .input(productUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Check if exists
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ürün bulunamadı" });
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.product.findUnique({ where: { slug: data.slug } });
        if (slugExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...data,
          basePrice: data.basePrice,
        },
      });

      return product;
    }),

  // Delete product (admin)
  deleteProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Check if included in any bundle
      const bundleCount = await prisma.bundleItem.count({ where: { includedProductId: input.id } });
      if (bundleCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Bu ürün ${bundleCount} pakette yer alıyor. Önce paketlerden çıkarın.`,
        });
      }

      await prisma.product.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ==================== VARIANT ====================

  // Create variant (admin)
  createVariant: adminProcedure
    .input(variantCreateSchema)
    .mutation(async ({ input }) => {
      // Check SKU uniqueness
      const existing = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu SKU zaten kullanılıyor" });
      }

      // If isDefault, unset other defaults
      if (input.isDefault) {
        await prisma.productVariant.updateMany({
          where: { productId: input.productId },
          data: { isDefault: false },
        });
      }

      const variant = await prisma.productVariant.create({
        data: {
          ...input,
          price: input.price,
        },
      });

      return variant;
    }),

  // Update variant (admin)
  updateVariant: adminProcedure
    .input(variantUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const existing = await prisma.productVariant.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Varyant bulunamadı" });
      }

      // Check SKU uniqueness if changing
      if (data.sku && data.sku !== existing.sku) {
        const skuExists = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
        if (skuExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Bu SKU zaten kullanılıyor" });
        }
      }

      // If setting as default, unset others
      if (data.isDefault) {
        await prisma.productVariant.updateMany({
          where: { productId: existing.productId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const variant = await prisma.productVariant.update({
        where: { id },
        data: {
          ...data,
          price: data.price,
        },
      });

      return variant;
    }),

  // Delete variant (admin)
  deleteVariant: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.productVariant.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ==================== MEDIA ====================

  // Add media (admin)
  addMedia: adminProcedure
    .input(mediaCreateSchema)
    .mutation(async ({ input }) => {
      // If setting as primary, unset others
      if (input.isPrimary) {
        await prisma.productMedia.updateMany({
          where: { productId: input.productId },
          data: { isPrimary: false },
        });
      }

      const media = await prisma.productMedia.create({ data: input });
      return media;
    }),

  // Update media order (admin)
  updateMediaOrder: adminProcedure
    .input(z.object({
      productId: z.string(),
      mediaIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const updates = input.mediaIds.map((id, index) =>
        prisma.productMedia.update({
          where: { id },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);
      return { success: true };
    }),

  // Delete media (admin)
  deleteMedia: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.productMedia.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Set primary media (admin)
  setPrimaryMedia: adminProcedure
    .input(z.object({ id: z.string(), productId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.$transaction([
        prisma.productMedia.updateMany({
          where: { productId: input.productId },
          data: { isPrimary: false },
        }),
        prisma.productMedia.update({
          where: { id: input.id },
          data: { isPrimary: true },
        }),
      ]);

      return { success: true };
    }),

  // ==================== META (SEO) ====================

  // Update product meta (admin)
  updateMeta: adminProcedure
    .input(metaUpdateSchema)
    .mutation(async ({ input }) => {
      const { productId, ...data } = input;

      const meta = await prisma.productMeta.upsert({
        where: { productId },
        create: { productId, ...data },
        update: data,
      });

      return meta;
    }),

  // ==================== RELATIONS ====================

  // Add product relation (admin)
  addRelation: adminProcedure
    .input(relationSchema)
    .mutation(async ({ input }) => {
      // Prevent self-relation
      if (input.productId === input.relatedId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ürün kendisiyle ilişkilendirilemez" });
      }

      const relation = await prisma.productRelation.create({ data: input });
      return relation;
    }),

  // Remove product relation (admin)
  removeRelation: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.productRelation.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ==================== BUNDLE ====================

  // Add bundle item (admin)
  addBundleItem: adminProcedure
    .input(bundleItemSchema)
    .mutation(async ({ input }) => {
      // Verify bundle product is type BUNDLE
      const bundleProduct = await prisma.product.findUnique({ where: { id: input.bundleProductId } });
      if (!bundleProduct || bundleProduct.type !== "BUNDLE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Hedef ürün bir paket değil" });
      }

      // Prevent adding bundle to itself
      if (input.bundleProductId === input.includedProductId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Paket kendisini içeremez" });
      }

      // Prevent adding another bundle
      const includedProduct = await prisma.product.findUnique({ where: { id: input.includedProductId } });
      if (includedProduct?.type === "BUNDLE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Paket içine başka paket eklenemez" });
      }

      const bundleItem = await prisma.bundleItem.create({
        data: {
          ...input,
          individualValue: input.individualValue,
        },
      });

      return bundleItem;
    }),

  // Remove bundle item (admin)
  removeBundleItem: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.bundleItem.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Calculate bundle savings
  calculateBundleSavings: protectedProcedure
    .input(z.object({ bundleProductId: z.string() }))
    .query(async ({ input }) => {
      const bundleItems = await prisma.bundleItem.findMany({
        where: { bundleProductId: input.bundleProductId },
        include: { includedProduct: true },
      });

      const bundleProduct = await prisma.product.findUnique({
        where: { id: input.bundleProductId },
        include: { variants: { where: { isDefault: true }, take: 1 } },
      });

      if (!bundleProduct) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paket bulunamadı" });
      }

      const totalIndividualValue = bundleItems.reduce(
        (sum, item) => sum + Number(item.individualValue) * item.quantity,
        0
      );

      const bundlePrice = bundleProduct.variants[0]?.price
        ? Number(bundleProduct.variants[0].price)
        : Number(bundleProduct.basePrice || 0);

      const savings = totalIndividualValue - bundlePrice;
      const savingsPercentage = totalIndividualValue > 0
        ? Math.round((savings / totalIndividualValue) * 100)
        : 0;

      return {
        totalIndividualValue,
        bundlePrice,
        savings,
        savingsPercentage,
        itemCount: bundleItems.length,
      };
    }),
});

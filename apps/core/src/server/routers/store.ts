// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Store Product Types
const ProductTypeEnum = z.enum(["PHYSICAL", "DIGITAL", "SERVICE"]);
const ProductStatusEnum = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

// Store Settings schema
const storeSettingsSchema = z.object({
  websiteId: z.string(),
  storeName: z.string().min(2).max(100),
  storeDescription: z.string().optional(),
  currency: z.string().default("TRY"),
  taxRate: z.number().min(0).max(100).default(18),
  shippingEnabled: z.boolean().default(true),
  digitalDownloadsEnabled: z.boolean().default(true),
  stripeEnabled: z.boolean().default(false),
  iyzicoEnabled: z.boolean().default(false),
  paypalEnabled: z.boolean().default(false),
  bankTransferEnabled: z.boolean().default(true),
  minOrderAmount: z.number().min(0).default(0),
  freeShippingThreshold: z.number().min(0).optional(),
  notificationEmail: z.string().email().optional(),
  termsAndConditions: z.string().optional(),
  privacyPolicy: z.string().optional(),
  refundPolicy: z.string().optional(),
});

// Store Product schema
const storeProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().optional(),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  type: ProductTypeEnum,
  status: ProductStatusEnum.default("DRAFT"),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  trackInventory: z.boolean().default(false),
  allowBackorder: z.boolean().default(false),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  digitalFile: z.string().optional(),
  downloadLimit: z.number().int().min(-1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    price: z.number().min(0),
    stock: z.number().int().min(0).optional(),
    attributes: z.record(z.string()),
  })).optional(),
});

// Store Category schema
const storeCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  position: z.number().int().default(0),
});

// Store Order schema
const OrderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

// Shipping Method schema
const shippingMethodSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  estimatedDays: z.string().optional(),
  enabled: z.boolean().default(true),
  freeShippingThreshold: z.number().min(0).optional(),
});

// Discount/Coupon schema
const discountSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
  usesPerCustomer: z.number().int().min(1).default(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
});

export const storeRouter = createTRPCRouter({
  // ==================== STORE SETTINGS ====================

  // Get store settings
  getSettings: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      // In production, fetch from database
      return {
        websiteId: input.websiteId,
        storeName: "My Store",
        currency: "TRY",
        taxRate: 18,
        shippingEnabled: true,
        digitalDownloadsEnabled: true,
        stripeEnabled: false,
        iyzicoEnabled: true,
        paypalEnabled: false,
        bankTransferEnabled: true,
        minOrderAmount: 0,
        freeShippingThreshold: 500,
      };
    }),

  // Update store settings
  updateSettings: protectedProcedure
    .input(storeSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // In production, save to database
      return { success: true, settings: input };
    }),

  // ==================== PRODUCTS ====================

  // List products
  listProducts: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      status: ProductStatusEnum.optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      sortBy: z.enum(["createdAt", "name", "price", "stock"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => {
      // Mock data for now
      const products = [
        {
          id: "prod-1",
          name: "Premium Website Template",
          description: "Modern ve profesyonel web sitesi sablonu",
          price: 299,
          comparePrice: 499,
          type: "DIGITAL",
          status: "ACTIVE",
          images: ["/placeholder.jpg"],
          stock: null,
          featured: true,
          createdAt: new Date(),
        },
        {
          id: "prod-2",
          name: "E-Commerce Starter Kit",
          description: "Online magaza baslangic paketi",
          price: 599,
          type: "DIGITAL",
          status: "ACTIVE",
          images: ["/placeholder.jpg"],
          stock: null,
          featured: true,
          createdAt: new Date(),
        },
        {
          id: "prod-3",
          name: "SEO Optimization Service",
          description: "Profesyonel SEO danismanligi",
          price: 1500,
          type: "SERVICE",
          status: "ACTIVE",
          images: ["/placeholder.jpg"],
          stock: null,
          featured: false,
          createdAt: new Date(),
        },
      ];

      return {
        products,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: products.length,
          totalPages: 1,
        },
      };
    }),

  // Get single product
  getProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        id: input.id,
        name: "Premium Website Template",
        description: "Modern ve profesyonel web sitesi sablonu",
        shortDescription: "Profesyonel sablon",
        sku: "TEMPLATE-001",
        price: 299,
        comparePrice: 499,
        type: "DIGITAL",
        status: "ACTIVE",
        images: ["/placeholder.jpg"],
        tags: ["template", "website", "premium"],
        trackInventory: false,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // Create product
  createProduct: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      product: storeProductSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const productId = `prod-${Date.now()}`;
      return {
        id: productId,
        ...input.product,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // Update product
  updateProduct: protectedProcedure
    .input(z.object({
      id: z.string(),
      product: storeProductSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        id: input.id,
        ...input.product,
        updatedAt: new Date(),
      };
    }),

  // Delete product
  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),

  // ==================== CATEGORIES ====================

  // List categories
  listCategories: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      return [
        { id: "cat-1", name: "Templates", slug: "templates", productCount: 5, position: 0 },
        { id: "cat-2", name: "Services", slug: "services", productCount: 3, position: 1 },
        { id: "cat-3", name: "Plugins", slug: "plugins", productCount: 8, position: 2 },
      ];
    }),

  // Create category
  createCategory: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      category: storeCategorySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = input.category.slug || input.category.name.toLowerCase().replace(/\s+/g, "-");
      return {
        id: `cat-${Date.now()}`,
        ...input.category,
        slug,
        productCount: 0,
      };
    }),

  // Update category
  updateCategory: protectedProcedure
    .input(z.object({
      id: z.string(),
      category: storeCategorySchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { id: input.id, ...input.category };
    }),

  // Delete category
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),

  // ==================== ORDERS ====================

  // List orders
  listOrders: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      status: OrderStatusEnum.optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const orders = [
        {
          id: "order-1",
          orderNumber: "HYB-001",
          status: "DELIVERED",
          customer: { name: "Ahmet Yilmaz", email: "ahmet@example.com" },
          items: [{ productId: "prod-1", name: "Premium Template", quantity: 1, price: 299 }],
          subtotal: 299,
          tax: 53.82,
          shipping: 0,
          total: 352.82,
          createdAt: new Date(),
        },
        {
          id: "order-2",
          orderNumber: "HYB-002",
          status: "PROCESSING",
          customer: { name: "Ayse Kaya", email: "ayse@example.com" },
          items: [{ productId: "prod-2", name: "E-Commerce Kit", quantity: 1, price: 599 }],
          subtotal: 599,
          tax: 107.82,
          shipping: 0,
          total: 706.82,
          createdAt: new Date(),
        },
      ];

      return {
        orders,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: orders.length,
          totalPages: 1,
        },
      };
    }),

  // Get single order
  getOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        id: input.id,
        orderNumber: "HYB-001",
        status: "DELIVERED",
        customer: {
          name: "Ahmet Yilmaz",
          email: "ahmet@example.com",
          phone: "+90 555 123 4567",
          address: {
            line1: "Ornek Mahallesi",
            line2: "123 Sokak No:45",
            city: "Istanbul",
            state: "Istanbul",
            postalCode: "34000",
            country: "TR",
          },
        },
        items: [
          {
            productId: "prod-1",
            name: "Premium Template",
            sku: "TEMPLATE-001",
            quantity: 1,
            price: 299,
            total: 299,
          },
        ],
        subtotal: 299,
        tax: 53.82,
        shipping: 0,
        discount: 0,
        total: 352.82,
        paymentMethod: "credit_card",
        paymentStatus: "PAID",
        shippingMethod: "digital",
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // Update order status
  updateOrderStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: OrderStatusEnum,
      note: z.string().optional(),
      sendNotification: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production:
      // 1. Update order status in database
      // 2. Send email notification if requested
      // 3. Log status change
      return {
        id: input.id,
        status: input.status,
        updatedAt: new Date(),
      };
    }),

  // ==================== SHIPPING ====================

  // List shipping methods
  listShippingMethods: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      return [
        { id: "ship-1", name: "Standart Kargo", price: 29.90, estimatedDays: "3-5 is gunu", enabled: true },
        { id: "ship-2", name: "Hizli Kargo", price: 49.90, estimatedDays: "1-2 is gunu", enabled: true },
        { id: "ship-3", name: "Ucretsiz Kargo", price: 0, estimatedDays: "5-7 is gunu", freeShippingThreshold: 500, enabled: true },
      ];
    }),

  // Create shipping method
  createShippingMethod: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      method: shippingMethodSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        id: `ship-${Date.now()}`,
        ...input.method,
      };
    }),

  // Update shipping method
  updateShippingMethod: protectedProcedure
    .input(z.object({
      id: z.string(),
      method: shippingMethodSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { id: input.id, ...input.method };
    }),

  // Delete shipping method
  deleteShippingMethod: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),

  // ==================== DISCOUNTS ====================

  // List discounts
  listDiscounts: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      return [
        {
          id: "disc-1",
          code: "WELCOME10",
          type: "PERCENTAGE",
          value: 10,
          usesCount: 45,
          maxUses: 100,
          enabled: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "disc-2",
          code: "FREESHIP",
          type: "FIXED",
          value: 29.90,
          usesCount: 12,
          maxUses: null,
          enabled: true,
          minOrderAmount: 200,
        },
      ];
    }),

  // Create discount
  createDiscount: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      discount: discountSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        id: `disc-${Date.now()}`,
        ...input.discount,
        usesCount: 0,
      };
    }),

  // Validate discount code
  validateDiscount: publicProcedure
    .input(z.object({
      websiteId: z.string(),
      code: z.string(),
      orderAmount: z.number(),
      productIds: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      // Mock validation
      if (input.code === "WELCOME10") {
        return {
          valid: true,
          discount: {
            code: "WELCOME10",
            type: "PERCENTAGE",
            value: 10,
            calculatedDiscount: input.orderAmount * 0.1,
          },
        };
      }
      return { valid: false, error: "Gecersiz indirim kodu" };
    }),

  // Update discount
  updateDiscount: protectedProcedure
    .input(z.object({
      id: z.string(),
      discount: discountSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { id: input.id, ...input.discount };
    }),

  // Delete discount
  deleteDiscount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),

  // ==================== ANALYTICS ====================

  // Get store analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      websiteId: z.string(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        summary: {
          totalRevenue: 12500,
          totalOrders: 45,
          averageOrderValue: 277.78,
          conversionRate: 3.2,
        },
        revenueByDay: [
          { date: "2024-01-01", revenue: 850 },
          { date: "2024-01-02", revenue: 1200 },
          { date: "2024-01-03", revenue: 950 },
          { date: "2024-01-04", revenue: 1500 },
          { date: "2024-01-05", revenue: 1100 },
        ],
        topProducts: [
          { id: "prod-1", name: "Premium Template", sales: 15, revenue: 4485 },
          { id: "prod-2", name: "E-Commerce Kit", sales: 8, revenue: 4792 },
          { id: "prod-3", name: "SEO Service", sales: 5, revenue: 7500 },
        ],
        ordersByStatus: {
          PENDING: 3,
          PROCESSING: 5,
          SHIPPED: 12,
          DELIVERED: 22,
          CANCELLED: 2,
          REFUNDED: 1,
        },
      };
    }),

  // ==================== PUBLIC STOREFRONT ====================

  // Get public products (for storefront)
  getPublicProducts: publicProcedure
    .input(z.object({
      websiteId: z.string(),
      categorySlug: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(12),
      sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).default("newest"),
    }))
    .query(async ({ input }) => {
      // Return only active products for public storefront
      const products = [
        {
          id: "prod-1",
          name: "Premium Website Template",
          slug: "premium-website-template",
          shortDescription: "Modern ve profesyonel web sitesi sablonu",
          price: 299,
          comparePrice: 499,
          images: ["/placeholder.jpg"],
          category: { id: "cat-1", name: "Templates", slug: "templates" },
          rating: 4.8,
          reviewCount: 24,
        },
        {
          id: "prod-2",
          name: "E-Commerce Starter Kit",
          slug: "ecommerce-starter-kit",
          shortDescription: "Online magaza baslangic paketi",
          price: 599,
          images: ["/placeholder.jpg"],
          category: { id: "cat-1", name: "Templates", slug: "templates" },
          rating: 4.9,
          reviewCount: 18,
        },
      ];

      return {
        products,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: products.length,
          totalPages: 1,
        },
      };
    }),

  // Get public product detail
  getPublicProduct: publicProcedure
    .input(z.object({
      websiteId: z.string(),
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      return {
        id: "prod-1",
        name: "Premium Website Template",
        slug: input.slug,
        description: "Modern ve profesyonel web sitesi sablonu. Responsive tasarim, SEO uyumlu, kolay ozellestirme.",
        shortDescription: "Modern ve profesyonel web sitesi sablonu",
        price: 299,
        comparePrice: 499,
        images: ["/placeholder.jpg", "/placeholder2.jpg"],
        type: "DIGITAL",
        category: { id: "cat-1", name: "Templates", slug: "templates" },
        tags: ["template", "website", "premium", "responsive"],
        features: [
          "Responsive Tasarim",
          "SEO Uyumlu",
          "Kolay Ozellestirme",
          "Ucretsiz Guncellemeler",
          "7/24 Destek",
        ],
        rating: 4.8,
        reviewCount: 24,
        reviews: [
          { id: "rev-1", author: "Ahmet Y.", rating: 5, text: "Harika sablon!", date: new Date() },
          { id: "rev-2", author: "Mehmet K.", rating: 4, text: "Cok iyi, tavsiye ederim.", date: new Date() },
        ],
      };
    }),

  // Create checkout session
  createCheckout: publicProcedure
    .input(z.object({
      websiteId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
      })),
      customer: z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
      }),
      shippingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string(),
        country: z.string(),
      }).optional(),
      billingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string(),
        country: z.string(),
      }).optional(),
      shippingMethodId: z.string().optional(),
      discountCode: z.string().optional(),
      paymentMethod: z.enum(["credit_card", "bank_transfer", "paypal"]),
    }))
    .mutation(async ({ input }) => {
      // Create checkout session
      const checkoutId = `checkout-${Date.now()}`;

      // Calculate totals
      const subtotal = 299; // Mock calculation
      const tax = subtotal * 0.18;
      const shipping = 0;
      const discount = 0;
      const total = subtotal + tax + shipping - discount;

      return {
        checkoutId,
        summary: {
          subtotal,
          tax,
          shipping,
          discount,
          total,
        },
        // In production, return payment URL or client secret
        paymentUrl: `/checkout/${checkoutId}/payment`,
      };
    }),
});

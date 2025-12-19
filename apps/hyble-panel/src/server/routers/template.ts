// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Template Enums from Prisma
const TemplateCategoryEnum = z.enum([
  "WEBSITE",
  "ECOMMERCE",
  "LANDING_PAGE",
  "SAAS",
  "BLOG",
  "PORTFOLIO",
  "RESTAURANT",
  "AGENCY",
]);

const TemplateStatusEnum = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
const TemplateFrameworkEnum = z.enum(["NEXTJS", "REACT", "HTML", "WORDPRESS"]);

// Deployment config schema
const deployConfigSchema = z.object({
  // Branding
  logo: z.string().nullable().optional(),
  primaryColor: z.string().default("#3B82F6"),
  secondaryColor: z.string().default("#10B981"),
  fontFamily: z.string().default("Inter"),

  // Content
  siteName: z.string().min(1),
  siteDescription: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  // Domain
  domainType: z.enum(["subdomain", "custom"]),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
});

export const templateRouter = createTRPCRouter({
  // ==================== PUBLIC ENDPOINTS ====================

  // List all active templates (public store)
  list: publicProcedure
    .input(z.object({
      category: TemplateCategoryEnum.optional(),
      framework: TemplateFrameworkEnum.optional(),
      search: z.string().optional(),
      featured: z.boolean().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      tags: z.array(z.string()).optional(),
      sortBy: z.enum(["newest", "popular", "price_asc", "price_desc", "rating"]).default("popular"),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(12),
    }))
    .query(async ({ input }) => {
      const {
        category,
        framework,
        search,
        featured,
        minPrice,
        maxPrice,
        tags,
        sortBy,
        page,
        limit,
      } = input;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {
        status: "ACTIVE",
      };

      if (category) where.category = category;
      if (framework) where.framework = framework;
      if (featured) where.isFeatured = featured;
      if (minPrice !== undefined) where.price = { ...((where.price as object) || {}), gte: minPrice };
      if (maxPrice !== undefined) where.price = { ...((where.price as object) || {}), lte: maxPrice };
      if (tags && tags.length > 0) where.tags = { hasSome: tags };
      if (search) {
        where.OR = [
          { nameTr: { contains: search, mode: "insensitive" } },
          { nameEn: { contains: search, mode: "insensitive" } },
          { descriptionTr: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search] } },
        ];
      }

      // Build orderBy
      let orderBy: Record<string, string> = {};
      switch (sortBy) {
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "popular":
          orderBy = { salesCount: "desc" };
          break;
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "rating":
          orderBy = { rating: "desc" };
          break;
      }

      try {
        const [templates, total] = await Promise.all([
          prisma.template.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
              id: true,
              slug: true,
              nameTr: true,
              nameEn: true,
              shortDescTr: true,
              shortDescEn: true,
              category: true,
              price: true,
              comparePrice: true,
              framework: true,
              thumbnail: true,
              previewUrl: true,
              features: true,
              tags: true,
              salesCount: true,
              rating: true,
              reviewCount: true,
              isFeatured: true,
              isNew: true,
              deployTime: true,
            },
          }),
          prisma.template.count({ where }),
        ]);

        // Get unique categories with counts
        const categories = await prisma.template.groupBy({
          by: ["category"],
          where: { status: "ACTIVE" },
          _count: true,
        });

        // Get available tags
        const allTemplates = await prisma.template.findMany({
          where: { status: "ACTIVE" },
          select: { tags: true },
        });
        const availableTags = [...new Set(allTemplates.flatMap((t) => t.tags))];

        return {
          templates,
          total,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + templates.length < total,
          },
          filters: {
            categories: categories.map((c) => ({
              category: c.category,
              count: c._count,
            })),
            availableTags,
          },
        };
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Return mock data for development
        return {
          templates: [
            {
              id: "tpl-1",
              slug: "corporate-starter",
              nameTr: "Kurumsal Başlangıç",
              nameEn: "Corporate Starter",
              shortDescTr: "Modern kurumsal web sitesi şablonu",
              shortDescEn: "Modern corporate website template",
              category: "WEBSITE",
              price: 49,
              comparePrice: 79,
              framework: "NEXTJS",
              thumbnail: "/templates/corporate.jpg",
              previewUrl: "https://demo.hyble.co/corporate",
              features: ["responsive", "dark-mode", "seo-ready"],
              tags: ["kurumsal", "modern", "minimal"],
              salesCount: 245,
              rating: 4.8,
              reviewCount: 32,
              isFeatured: true,
              isNew: false,
              deployTime: 60,
            },
            {
              id: "tpl-2",
              slug: "ecommerce-pro",
              nameTr: "E-Ticaret Pro",
              nameEn: "E-Commerce Pro",
              shortDescTr: "Tam özellikli e-ticaret şablonu",
              shortDescEn: "Full-featured e-commerce template",
              category: "ECOMMERCE",
              price: 99,
              comparePrice: 149,
              framework: "NEXTJS",
              thumbnail: "/templates/ecommerce.jpg",
              previewUrl: "https://demo.hyble.co/ecommerce",
              features: ["cart", "payments", "inventory"],
              tags: ["e-ticaret", "online-magaza"],
              salesCount: 189,
              rating: 4.9,
              reviewCount: 28,
              isFeatured: true,
              isNew: true,
              deployTime: 90,
            },
          ],
          total: 2,
          pagination: { page: 1, limit: 12, totalPages: 1, hasMore: false },
          filters: {
            categories: [
              { category: "WEBSITE", count: 50 },
              { category: "ECOMMERCE", count: 30 },
              { category: "LANDING_PAGE", count: 40 },
              { category: "SAAS", count: 25 },
            ],
            availableTags: ["kurumsal", "modern", "minimal", "e-ticaret"],
          },
        };
      }
    }),

  // Get single template by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const template = await prisma.template.findUnique({
          where: { slug: input.slug, status: "ACTIVE" },
          include: {
            reviews: {
              where: { isApproved: true },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });

        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        // Increment view count
        await prisma.template.update({
          where: { id: template.id },
          data: { viewCount: { increment: 1 } },
        });

        return template;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        // Return mock data for development
        if (input.slug === "corporate-starter") {
          return {
            id: "tpl-1",
            slug: "corporate-starter",
            status: "ACTIVE",
            nameTr: "Kurumsal Başlangıç",
            nameEn: "Corporate Starter",
            descriptionTr: "Modern ve profesyonel kurumsal web sitesi şablonu. Responsive tasarım, SEO uyumlu, kolay özelleştirme.",
            descriptionEn: "Modern and professional corporate website template. Responsive design, SEO ready, easy customization.",
            shortDescTr: "Modern kurumsal web sitesi şablonu",
            shortDescEn: "Modern corporate website template",
            category: "WEBSITE",
            tags: ["kurumsal", "modern", "minimal"],
            industry: ["teknoloji", "finans", "danismanlik"],
            price: 49,
            comparePrice: 79,
            currency: "EUR",
            framework: "NEXTJS",
            version: "1.2.0",
            features: ["responsive", "dark-mode", "seo-ready", "contact-form", "blog"],
            techStack: ["Next.js 14", "Tailwind CSS", "TypeScript", "Framer Motion"],
            thumbnail: "/templates/corporate.jpg",
            images: ["/templates/corporate-1.jpg", "/templates/corporate-2.jpg"],
            previewUrl: "https://demo.hyble.co/corporate",
            documentationUrl: "https://docs.hyble.co/templates/corporate",
            salesCount: 245,
            viewCount: 1250,
            rating: 4.8,
            reviewCount: 32,
            isFeatured: true,
            isNew: false,
            cloudCompatible: true,
            deployTime: 60,
            createdAt: new Date(),
            updatedAt: new Date(),
            reviews: [
              {
                id: "rev-1",
                userId: "user-1",
                rating: 5,
                title: "Harika şablon!",
                content: "Çok profesyonel görünüyor, kurulum çok kolaydı.",
                isVerified: true,
                isApproved: true,
                createdAt: new Date(),
              },
            ],
          };
        }

        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
    }),

  // ==================== PURCHASE ENDPOINTS ====================

  // Purchase template
  purchase: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      paymentMethod: z.enum(["wallet", "card"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Check if already purchased
        const existingPurchase = await prisma.templatePurchase.findUnique({
          where: {
            templateId_userId: {
              templateId: input.templateId,
              userId,
            },
          },
        });

        if (existingPurchase) {
          return { success: true, purchase: existingPurchase, alreadyOwned: true };
        }

        // Get template
        const template = await prisma.template.findUnique({
          where: { id: input.templateId },
        });

        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        // Process payment
        if (input.paymentMethod === "wallet") {
          // Check wallet balance
          const wallet = await prisma.wallet.findFirst({
            where: { userId },
          });

          if (!wallet || wallet.balance < template.price) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient wallet balance" });
          }

          // Deduct from wallet
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: template.price } },
          });
        } else {
          // Card payment would go through Stripe
          // For now, just allow it
        }

        // Create purchase
        const purchase = await prisma.templatePurchase.create({
          data: {
            templateId: input.templateId,
            userId,
            amount: template.price,
            currency: template.currency,
          },
        });

        // Increment sales count
        await prisma.template.update({
          where: { id: input.templateId },
          data: { salesCount: { increment: 1 } },
        });

        return { success: true, purchase, alreadyOwned: false };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Purchase error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Purchase failed" });
      }
    }),

  // Get user's purchases
  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      const purchases = await prisma.templatePurchase.findMany({
        where: { userId },
        include: {
          template: {
            select: {
              id: true,
              slug: true,
              nameTr: true,
              nameEn: true,
              thumbnail: true,
              framework: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return purchases;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  }),

  // ==================== DEPLOYMENT ENDPOINTS ====================

  // Deploy template
  deploy: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      config: deployConfigSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Check if user owns the template
        const purchase = await prisma.templatePurchase.findUnique({
          where: {
            templateId_userId: {
              templateId: input.templateId,
              userId,
            },
          },
        });

        if (!purchase) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Template not purchased" });
        }

        // Validate subdomain availability
        if (input.config.domainType === "subdomain" && input.config.subdomain) {
          const existingDeployment = await prisma.templateDeployment.findUnique({
            where: { subdomain: input.config.subdomain },
          });

          if (existingDeployment) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Subdomain already taken" });
          }
        }

        // Create deployment
        const deployment = await prisma.templateDeployment.create({
          data: {
            templateId: input.templateId,
            purchaseId: purchase.id,
            userId,
            projectName: input.config.siteName,
            subdomain: input.config.domainType === "subdomain"
              ? input.config.subdomain!
              : `${input.config.siteName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
            customDomain: input.config.domainType === "custom" ? input.config.customDomain : null,
            config: input.config,
            status: "deploying",
          },
        });

        // TODO: Trigger actual deployment via background job
        // For now, simulate deployment
        setTimeout(async () => {
          await prisma.templateDeployment.update({
            where: { id: deployment.id },
            data: {
              status: "active",
              deployedAt: new Date(),
            },
          });
        }, 5000);

        return {
          success: true,
          deployment,
          url: `https://${deployment.subdomain}.hyble.co`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Deployment error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Deployment failed" });
      }
    }),

  // Get user's deployments
  myDeployments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      const deployments = await prisma.templateDeployment.findMany({
        where: { userId },
        include: {
          template: {
            select: {
              id: true,
              slug: true,
              nameTr: true,
              nameEn: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return deployments;
    } catch (error) {
      console.error("Error fetching deployments:", error);
      return [];
    }
  }),

  // Check subdomain availability
  checkSubdomain: publicProcedure
    .input(z.object({ subdomain: z.string().min(3).max(63) }))
    .query(async ({ input }) => {
      const subdomain = input.subdomain.toLowerCase();

      // Reserved subdomains
      const reserved = ["admin", "panel", "api", "www", "mail", "ftp", "blog", "shop", "app"];
      if (reserved.includes(subdomain)) {
        return { available: false, reason: "reserved" };
      }

      // Check regex
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
        return { available: false, reason: "invalid" };
      }

      try {
        const existing = await prisma.templateDeployment.findUnique({
          where: { subdomain },
        });

        return { available: !existing };
      } catch (error) {
        // In development, assume available
        return { available: true };
      }
    }),

  // ==================== REVIEW ENDPOINTS ====================

  // Submit review
  submitReview: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      rating: z.number().int().min(1).max(5),
      title: z.string().max(200).optional(),
      content: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        // Check if user purchased the template
        const purchase = await prisma.templatePurchase.findUnique({
          where: {
            templateId_userId: {
              templateId: input.templateId,
              userId,
            },
          },
        });

        // Check for existing review
        const existingReview = await prisma.templateReview.findUnique({
          where: {
            templateId_userId: {
              templateId: input.templateId,
              userId,
            },
          },
        });

        if (existingReview) {
          // Update existing review
          const updated = await prisma.templateReview.update({
            where: { id: existingReview.id },
            data: {
              rating: input.rating,
              title: input.title,
              content: input.content,
              isApproved: false, // Re-review on update
            },
          });
          return { success: true, review: updated, updated: true };
        }

        // Create new review
        const review = await prisma.templateReview.create({
          data: {
            templateId: input.templateId,
            userId,
            rating: input.rating,
            title: input.title,
            content: input.content,
            isVerified: !!purchase,
            isApproved: false, // Requires admin approval
          },
        });

        return { success: true, review, updated: false };
      } catch (error) {
        console.error("Review error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit review" });
      }
    }),

  // ==================== ADMIN ENDPOINTS ====================

  // Admin: Create template
  adminCreate: protectedProcedure
    .input(z.object({
      slug: z.string().min(3).max(100),
      nameTr: z.string().min(2).max(200),
      nameEn: z.string().min(2).max(200),
      descriptionTr: z.string(),
      descriptionEn: z.string(),
      shortDescTr: z.string().max(300).optional(),
      shortDescEn: z.string().max(300).optional(),
      category: TemplateCategoryEnum,
      tags: z.array(z.string()).default([]),
      industry: z.array(z.string()).default([]),
      price: z.number().min(0),
      comparePrice: z.number().min(0).optional(),
      framework: TemplateFrameworkEnum,
      features: z.array(z.string()).default([]),
      techStack: z.array(z.string()).default([]),
      thumbnail: z.string(),
      images: z.array(z.string()).default([]),
      previewUrl: z.string().optional(),
      downloadUrl: z.string().optional(),
      documentationUrl: z.string().optional(),
      deployTime: z.number().int().default(60),
      status: TemplateStatusEnum.default("DRAFT"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const template = await prisma.template.create({
          data: input,
        });

        return { success: true, template };
      } catch (error) {
        console.error("Create template error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create template" });
      }
    }),

  // Admin: Update template
  adminUpdate: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        slug: z.string().min(3).max(100).optional(),
        nameTr: z.string().min(2).max(200).optional(),
        nameEn: z.string().min(2).max(200).optional(),
        descriptionTr: z.string().optional(),
        descriptionEn: z.string().optional(),
        shortDescTr: z.string().max(300).optional(),
        shortDescEn: z.string().max(300).optional(),
        category: TemplateCategoryEnum.optional(),
        tags: z.array(z.string()).optional(),
        industry: z.array(z.string()).optional(),
        price: z.number().min(0).optional(),
        comparePrice: z.number().min(0).optional(),
        framework: TemplateFrameworkEnum.optional(),
        features: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
        images: z.array(z.string()).optional(),
        previewUrl: z.string().optional(),
        downloadUrl: z.string().optional(),
        documentationUrl: z.string().optional(),
        deployTime: z.number().int().optional(),
        status: TemplateStatusEnum.optional(),
        isFeatured: z.boolean().optional(),
        isNew: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const template = await prisma.template.update({
          where: { id: input.id },
          data: input.data,
        });

        return { success: true, template };
      } catch (error) {
        console.error("Update template error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update template" });
      }
    }),

  // Admin: Delete template
  adminDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        await prisma.template.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        console.error("Delete template error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete template" });
      }
    }),

  // Admin: Approve review
  adminApproveReview: protectedProcedure
    .input(z.object({
      reviewId: z.string(),
      approved: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const review = await prisma.templateReview.update({
          where: { id: input.reviewId },
          data: { isApproved: input.approved },
        });

        // Update template rating if approved
        if (input.approved) {
          const reviews = await prisma.templateReview.findMany({
            where: { templateId: review.templateId, isApproved: true },
            select: { rating: true },
          });

          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

          await prisma.template.update({
            where: { id: review.templateId },
            data: {
              rating: avgRating,
              reviewCount: reviews.length,
            },
          });
        }

        return { success: true, review };
      } catch (error) {
        console.error("Approve review error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to approve review" });
      }
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

// ==================== INPUT SCHEMAS ====================

const categoryCreateSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  nameTr: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  descTr: z.string().max(500).optional(),
  descEn: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

const postCreateSchema = z.object({
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  vertical: z.enum(["GENERAL", "DIGITAL", "STUDIOS"]).default("GENERAL"),

  // i18n Content
  titleTr: z.string().min(5).max(200),
  titleEn: z.string().min(5).max(200),
  excerptTr: z.string().max(500).optional(),
  excerptEn: z.string().max(500).optional(),
  contentTr: z.string().min(50),
  contentEn: z.string().min(50),

  // Kategori & Etiketler
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Görsel
  featuredImage: z.string().url().optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")),
  gallery: z.array(z.string().url()).default([]),

  // SEO
  metaTitleTr: z.string().max(70).optional(),
  metaTitleEn: z.string().max(70).optional(),
  metaDescTr: z.string().max(160).optional(),
  metaDescEn: z.string().max(160).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),

  // Yazar
  authorName: z.string().optional(),
  authorImage: z.string().url().optional().or(z.literal("")),

  // İlişkili İçerik
  relatedPosts: z.array(z.string()).default([]),

  // Öne Çıkarma
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),

  // Yayınlama
  publishImmediately: z.boolean().default(false),
  scheduledAt: z.string().datetime().optional(),
});

const postUpdateSchema = postCreateSchema.partial().extend({
  id: z.string(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
});

// ==================== HELPER FUNCTIONS ====================

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).length;
}

// ==================== ROUTER ====================

export const blogRouter = createTRPCRouter({
  // ==================== CATEGORY ====================

  // List categories (public)
  listCategories: publicProcedure
    .input(z.object({
      includeInactive: z.boolean().default(false),
      parentId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where = {
        ...(input?.includeInactive ? {} : { isActive: true }),
        ...(input?.parentId !== undefined ? { parentId: input.parentId } : {}),
      };

      const categories = await prisma.blogCategory.findMany({
        where,
        include: {
          children: {
            where: input?.includeInactive ? {} : { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { posts: true } },
        },
        orderBy: { sortOrder: "asc" },
      });

      return categories;
    }),

  // Get category by slug (public)
  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await prisma.blogCategory.findUnique({
        where: { slug: input.slug },
        include: {
          parent: true,
          children: { orderBy: { sortOrder: "asc" } },
          _count: { select: { posts: true } },
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
      const existing = await prisma.blogCategory.findUnique({ where: { slug: input.slug } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
      }

      const category = await prisma.blogCategory.create({ data: input });
      return category;
    }),

  // Update category (admin)
  updateCategory: adminProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const existing = await prisma.blogCategory.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kategori bulunamadı" });
      }

      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.blogCategory.findUnique({ where: { slug: data.slug } });
        if (slugExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
        }
      }

      const category = await prisma.blogCategory.update({
        where: { id },
        data,
      });

      return category;
    }),

  // Delete category (admin)
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const postCount = await prisma.blogPost.count({ where: { categoryId: input.id } });
      if (postCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Bu kategoride ${postCount} yazı var. Önce yazıları taşıyın.`,
        });
      }

      const childCount = await prisma.blogCategory.count({ where: { parentId: input.id } });
      if (childCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Bu kategorinin ${childCount} alt kategorisi var.`,
        });
      }

      await prisma.blogCategory.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ==================== POST ====================

  // List posts (public - only published)
  listPublished: publicProcedure
    .input(z.object({
      vertical: z.enum(["GENERAL", "DIGITAL", "STUDIOS"]).optional(),
      categoryId: z.string().optional(),
      tag: z.string().optional(),
      search: z.string().optional(),
      isFeatured: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where = {
        status: "PUBLISHED" as const,
        publishedAt: { lte: new Date() },
        ...(input?.vertical && { vertical: input.vertical }),
        ...(input?.categoryId && { categoryId: input.categoryId }),
        ...(input?.tag && { tags: { has: input.tag } }),
        ...(input?.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input?.search && {
          OR: [
            { titleTr: { contains: input.search, mode: "insensitive" as const } },
            { titleEn: { contains: input.search, mode: "insensitive" as const } },
            { excerptTr: { contains: input.search, mode: "insensitive" as const } },
            { excerptEn: { contains: input.search, mode: "insensitive" as const } },
            { tags: { has: input.search } },
          ],
        }),
      };

      const posts = await prisma.blogPost.findMany({
        where,
        take: (input?.limit || 10) + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { isPinned: "desc" },
          { isFeatured: "desc" },
          { publishedAt: "desc" },
        ],
        include: {
          category: { select: { id: true, slug: true, nameTr: true, nameEn: true, icon: true, color: true } },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > (input?.limit || 10)) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts: posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          vertical: p.vertical,
          titleTr: p.titleTr,
          titleEn: p.titleEn,
          excerptTr: p.excerptTr,
          excerptEn: p.excerptEn,
          featuredImage: p.featuredImage,
          thumbnail: p.thumbnail,
          category: p.category,
          tags: p.tags,
          readingTime: p.readingTime,
          authorName: p.authorName,
          authorImage: p.authorImage,
          publishedAt: p.publishedAt,
          isFeatured: p.isFeatured,
          isPinned: p.isPinned,
          viewCount: p.viewCount,
        })),
        nextCursor,
      };
    }),

  // Get post by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await prisma.blogPost.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      // Only show published posts publicly
      if (post.status !== "PUBLISHED" || (post.publishedAt && post.publishedAt > new Date())) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      // Fetch related posts
      let relatedPosts: Array<{
        id: string;
        slug: string;
        titleTr: string;
        titleEn: string;
        thumbnail: string | null;
        readingTime: number;
      }> = [];

      if (post.relatedPosts.length > 0) {
        relatedPosts = await prisma.blogPost.findMany({
          where: {
            id: { in: post.relatedPosts },
            status: "PUBLISHED",
          },
          select: {
            id: true,
            slug: true,
            titleTr: true,
            titleEn: true,
            thumbnail: true,
            readingTime: true,
          },
        });
      }

      return {
        ...post,
        relatedPosts,
      };
    }),

  // List all posts (admin)
  list: adminProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
      vertical: z.enum(["GENERAL", "DIGITAL", "STUDIOS"]).optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      isFeatured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where = {
        ...(input?.status && { status: input.status }),
        ...(input?.vertical && { vertical: input.vertical }),
        ...(input?.categoryId && { categoryId: input.categoryId }),
        ...(input?.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input?.search && {
          OR: [
            { titleTr: { contains: input.search, mode: "insensitive" as const } },
            { titleEn: { contains: input.search, mode: "insensitive" as const } },
            { tags: { has: input.search } },
          ],
        }),
      };

      const posts = await prisma.blogPost.findMany({
        where,
        take: (input?.limit || 20) + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { updatedAt: "desc" },
        ],
        include: {
          category: { select: { id: true, slug: true, nameTr: true, nameEn: true } },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > (input?.limit || 20)) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  // Get post by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await prisma.blogPost.findUnique({
        where: { id: input.id },
        include: {
          category: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      return post;
    }),

  // Create post (admin)
  create: adminProcedure
    .input(postCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.blogPost.findUnique({ where: { slug: input.slug } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
      }

      const { publishImmediately, scheduledAt, ...postData } = input;

      // Calculate reading time and word count
      const readingTime = calculateReadingTime(postData.contentTr + " " + postData.contentEn);
      const wordCount = countWords(postData.contentTr + " " + postData.contentEn);

      // Determine status and publish date
      let status: "DRAFT" | "SCHEDULED" | "PUBLISHED" = "DRAFT";
      let publishedAt: Date | null = null;

      if (publishImmediately) {
        status = "PUBLISHED";
        publishedAt = new Date();
      } else if (scheduledAt) {
        status = "SCHEDULED";
      }

      const post = await prisma.blogPost.create({
        data: {
          ...postData,
          status,
          publishedAt,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          readingTime,
          wordCount,
          authorId: ctx.user.id,
          createdBy: ctx.user.id,
          featuredImage: postData.featuredImage || null,
          thumbnail: postData.thumbnail || null,
          canonicalUrl: postData.canonicalUrl || null,
          authorImage: postData.authorImage || null,
        },
      });

      return post;
    }),

  // Update post (admin)
  update: adminProcedure
    .input(postUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, publishImmediately, scheduledAt, ...data } = input;

      const existing = await prisma.blogPost.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
        if (slugExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Bu slug zaten kullanılıyor" });
        }
      }

      // Recalculate reading time if content changed
      let readingTime = existing.readingTime;
      let wordCount = existing.wordCount;

      if (data.contentTr || data.contentEn) {
        const contentTr = data.contentTr || existing.contentTr;
        const contentEn = data.contentEn || existing.contentEn;
        readingTime = calculateReadingTime(contentTr + " " + contentEn);
        wordCount = countWords(contentTr + " " + contentEn);
      }

      // Handle publish status changes
      let publishedAt = existing.publishedAt;
      let status = data.status || existing.status;

      if (publishImmediately && existing.status !== "PUBLISHED") {
        status = "PUBLISHED";
        publishedAt = new Date();
      } else if (scheduledAt && existing.status === "DRAFT") {
        status = "SCHEDULED";
      }

      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          ...data,
          status,
          publishedAt,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt,
          readingTime,
          wordCount,
          featuredImage: data.featuredImage === "" ? null : data.featuredImage,
          thumbnail: data.thumbnail === "" ? null : data.thumbnail,
          canonicalUrl: data.canonicalUrl === "" ? null : data.canonicalUrl,
          authorImage: data.authorImage === "" ? null : data.authorImage,
        },
      });

      return post;
    }),

  // Delete post (admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      await prisma.blogPost.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Publish post (admin)
  publish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      const post = await prisma.blogPost.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      return post;
    }),

  // Unpublish post (admin)
  unpublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const post = await prisma.blogPost.update({
        where: { id: input.id },
        data: {
          status: "DRAFT",
        },
      });

      return post;
    }),

  // Archive post (admin)
  archive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const post = await prisma.blogPost.update({
        where: { id: input.id },
        data: {
          status: "ARCHIVED",
        },
      });

      return post;
    }),

  // Toggle featured (admin)
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      const post = await prisma.blogPost.update({
        where: { id: input.id },
        data: { isFeatured: !existing.isFeatured },
      });

      return post;
    }),

  // Toggle pinned (admin)
  togglePinned: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      const post = await prisma.blogPost.update({
        where: { id: input.id },
        data: { isPinned: !existing.isPinned },
      });

      return post;
    }),

  // Duplicate post (admin)
  duplicate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!original) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Yazı bulunamadı" });
      }

      // Generate unique slug
      let baseSlug = `${original.slug}-kopya`;
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const duplicated = await prisma.blogPost.create({
        data: {
          slug: uniqueSlug,
          status: "DRAFT",
          vertical: original.vertical,
          titleTr: `${original.titleTr} (Kopya)`,
          titleEn: `${original.titleEn} (Copy)`,
          excerptTr: original.excerptTr,
          excerptEn: original.excerptEn,
          contentTr: original.contentTr,
          contentEn: original.contentEn,
          categoryId: original.categoryId,
          tags: original.tags,
          featuredImage: original.featuredImage,
          thumbnail: original.thumbnail,
          gallery: original.gallery,
          metaTitleTr: original.metaTitleTr,
          metaTitleEn: original.metaTitleEn,
          metaDescTr: original.metaDescTr,
          metaDescEn: original.metaDescEn,
          readingTime: original.readingTime,
          wordCount: original.wordCount,
          authorId: ctx.user.id,
          authorName: original.authorName,
          authorImage: original.authorImage,
          relatedPosts: original.relatedPosts,
          isFeatured: false,
          isPinned: false,
          createdBy: ctx.user.id,
        },
      });

      return duplicated;
    }),

  // Get stats (admin)
  stats: adminProcedure.query(async () => {
    const [total, published, draft, scheduled, archived, totalViews] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.blogPost.count({ where: { status: "SCHEDULED" } }),
      prisma.blogPost.count({ where: { status: "ARCHIVED" } }),
      prisma.blogPost.aggregate({ _sum: { viewCount: true } }),
    ]);

    // Get top posts by views
    const topPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        titleTr: true,
        titleEn: true,
        viewCount: true,
      },
    });

    // Get posts per vertical
    const verticalStats = await prisma.blogPost.groupBy({
      by: ["vertical"],
      _count: true,
    });

    return {
      total,
      published,
      draft,
      scheduled,
      archived,
      totalViews: totalViews._sum.viewCount || 0,
      topPosts,
      verticalStats: verticalStats.reduce((acc, v) => {
        acc[v.vertical] = v._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }),

  // Get all tags (public)
  getAllTags: publicProcedure.query(async () => {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { tags: true },
    });

    // Count tag occurrences
    const tagCount: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Sort by count and return
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }),

  // Get featured posts for landing page (public)
  getFeaturedForLanding: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(6).default(3) }).optional())
    .query(async ({ input }) => {
      const posts = await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
          OR: [
            { isFeatured: true },
            { isPinned: true },
          ],
        },
        take: input?.limit || 3,
        orderBy: [
          { isPinned: "desc" },
          { publishedAt: "desc" },
        ],
        include: {
          category: { select: { slug: true, nameTr: true, nameEn: true, icon: true, color: true } },
        },
      });

      return posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        vertical: p.vertical,
        titleTr: p.titleTr,
        titleEn: p.titleEn,
        excerptTr: p.excerptTr,
        excerptEn: p.excerptEn,
        featuredImage: p.featuredImage,
        thumbnail: p.thumbnail,
        category: p.category,
        tags: p.tags,
        readingTime: p.readingTime,
        authorName: p.authorName,
        authorImage: p.authorImage,
        publishedAt: p.publishedAt,
      }));
    }),
});

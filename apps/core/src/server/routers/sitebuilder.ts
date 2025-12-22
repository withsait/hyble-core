// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

export const siteBuilderRouter = createTRPCRouter({
  // Get available blocks (public)
  getBlocks: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        premiumOnly: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = { isActive: true };

      if (input.category) {
        where.category = input.category;
      }

      if (input.premiumOnly !== undefined) {
        where.isPremium = input.premiumOnly;
      }

      const blocks = await prisma.siteBlock.findMany({
        where,
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      });

      // Group by category
      const grouped = blocks.reduce((acc, block) => {
        if (!acc[block.category]) {
          acc[block.category] = [];
        }
        acc[block.category]!.push(block);
        return acc;
      }, {} as Record<string, typeof blocks>);

      return grouped;
    }),

  // Get single block
  getBlock: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const block = await prisma.siteBlock.findUnique({
        where: { id: input.id },
      });

      if (!block) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Block not found",
        });
      }

      return block;
    }),

  // List pages for a website
  listPages: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      const pages = await prisma.sitePage.findMany({
        where: { websiteId: input.websiteId },
        orderBy: [{ isHomePage: "desc" }, { sortOrder: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          title: true,
          isPublished: true,
          isHomePage: true,
          sortOrder: true,
          updatedAt: true,
        },
      });

      return pages;
    }),

  // Get page content
  getPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await prisma.sitePage.findUnique({
        where: { id: input.pageId },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: page.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return page;
    }),

  // Create page
  createPage: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        templateId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id, deletedAt: null },
      });

      if (!website) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      // Check slug uniqueness
      const existing = await prisma.sitePage.findUnique({
        where: {
          websiteId_slug: {
            websiteId: input.websiteId,
            slug: input.slug,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A page with this URL already exists",
        });
      }

      // Get template content if specified
      let content = { blocks: [] };
      if (input.templateId) {
        const block = await prisma.siteBlock.findUnique({
          where: { id: input.templateId },
        });
        if (block) {
          content = block.content as any;
        }
      }

      // Get next sort order
      const lastPage = await prisma.sitePage.findFirst({
        where: { websiteId: input.websiteId },
        orderBy: { sortOrder: "desc" },
      });

      const page = await prisma.sitePage.create({
        data: {
          websiteId: input.websiteId,
          name: input.name,
          slug: input.slug,
          content,
          templateId: input.templateId,
          sortOrder: (lastPage?.sortOrder || 0) + 1,
        },
      });

      return page;
    }),

  // Update page content
  updatePage: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
        content: z.any().optional(),
        title: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
        ogImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, ...data } = input;

      const page = await prisma.sitePage.findUnique({
        where: { id: pageId },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: page.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== page.slug) {
        const existing = await prisma.sitePage.findUnique({
          where: {
            websiteId_slug: {
              websiteId: page.websiteId,
              slug: data.slug,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A page with this URL already exists",
          });
        }
      }

      const updated = await prisma.sitePage.update({
        where: { id: pageId },
        data,
      });

      return updated;
    }),

  // Publish/unpublish page
  togglePublish: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.sitePage.findUnique({
        where: { id: input.pageId },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: page.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const updated = await prisma.sitePage.update({
        where: { id: input.pageId },
        data: {
          isPublished: !page.isPublished,
          publishedAt: !page.isPublished ? new Date() : null,
        },
      });

      return updated;
    }),

  // Set as home page
  setHomePage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.sitePage.findUnique({
        where: { id: input.pageId },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: page.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Unset other home pages
      await prisma.sitePage.updateMany({
        where: { websiteId: page.websiteId, isHomePage: true },
        data: { isHomePage: false },
      });

      // Set this as home
      await prisma.sitePage.update({
        where: { id: input.pageId },
        data: { isHomePage: true },
      });

      return { success: true };
    }),

  // Delete page
  deletePage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.sitePage.findUnique({
        where: { id: input.pageId },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: page.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (page.isHomePage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete home page. Set another page as home first.",
        });
      }

      await prisma.sitePage.delete({
        where: { id: input.pageId },
      });

      return { success: true };
    }),

  // Reorder pages
  reorderPages: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        pageIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Update sort orders
      await Promise.all(
        input.pageIds.map((pageId, index) =>
          prisma.sitePage.update({
            where: { id: pageId },
            data: { sortOrder: index },
          })
        )
      );

      return { success: true };
    }),

  // Admin: Create block template
  adminCreateBlock: adminProcedure
    .input(
      z.object({
        type: z.string(),
        name: z.string(),
        description: z.string().optional(),
        category: z.string(),
        content: z.any(),
        thumbnail: z.string().url().optional(),
        previewUrl: z.string().url().optional(),
        isPremium: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Get next sort order in category
      const lastBlock = await prisma.siteBlock.findFirst({
        where: { category: input.category },
        orderBy: { sortOrder: "desc" },
      });

      const block = await prisma.siteBlock.create({
        data: {
          type: input.type,
          name: input.name,
          description: input.description,
          category: input.category,
          content: input.content ?? {},
          thumbnail: input.thumbnail,
          previewUrl: input.previewUrl,
          isPremium: input.isPremium,
          sortOrder: (lastBlock?.sortOrder || 0) + 1,
        },
      });

      return block;
    }),

  // Admin: Update block
  adminUpdateBlock: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        content: z.any().optional(),
        thumbnail: z.string().url().optional(),
        previewUrl: z.string().url().optional(),
        isPremium: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const block = await prisma.siteBlock.update({
        where: { id },
        data,
      });

      return block;
    }),

  // Admin: Delete block
  adminDeleteBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.siteBlock.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Admin: List all blocks
  adminListBlocks: adminProcedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const { category, page, limit } = input;

      const where: any = {};
      if (category) where.category = category;

      const [blocks, total] = await Promise.all([
        prisma.siteBlock.findMany({
          where,
          orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.siteBlock.count({ where }),
      ]);

      return {
        blocks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});

// Form Builder Router
export const formBuilderRouter = createTRPCRouter({
  // List forms for a website
  list: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const forms = await prisma.formBuilder.findMany({
        where: { websiteId: input.websiteId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          submissionCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return forms;
    }),

  // Get form
  get: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await prisma.formBuilder.findUnique({
        where: { id: input.formId },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return form;
    }),

  // Create form
  create: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        fields: z.array(
          z.object({
            id: z.string(),
            type: z.enum([
              "text",
              "email",
              "phone",
              "textarea",
              "select",
              "checkbox",
              "radio",
              "file",
              "date",
              "number",
            ]),
            label: z.string(),
            placeholder: z.string().optional(),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(), // For select/radio
            validation: z.any().optional(),
          })
        ),
        submitButtonText: z.string().default("Gönder"),
        successMessage: z.string().optional(),
        redirectUrl: z.string().url().optional(),
        enableCaptcha: z.boolean().default(true),
        notifyEmail: z.string().email().optional(),
        notifyWebhook: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const form = await prisma.formBuilder.create({
        data: input,
      });

      return form;
    }),

  // Update form
  update: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        fields: z
          .array(
            z.object({
              id: z.string(),
              type: z.enum([
                "text",
                "email",
                "phone",
                "textarea",
                "select",
                "checkbox",
                "radio",
                "file",
                "date",
                "number",
              ]),
              label: z.string(),
              placeholder: z.string().optional(),
              required: z.boolean().default(false),
              options: z.array(z.string()).optional(),
              validation: z.any().optional(),
            })
          )
          .optional(),
        submitButtonText: z.string().optional(),
        successMessage: z.string().optional(),
        redirectUrl: z.string().url().optional(),
        enableCaptcha: z.boolean().optional(),
        notifyEmail: z.string().email().optional(),
        notifyWebhook: z.string().url().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { formId, ...data } = input;

      const form = await prisma.formBuilder.findUnique({
        where: { id: formId },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const updated = await prisma.formBuilder.update({
        where: { id: formId },
        data,
      });

      return updated;
    }),

  // Delete form
  delete: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const form = await prisma.formBuilder.findUnique({
        where: { id: input.formId },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      await prisma.formBuilder.delete({
        where: { id: input.formId },
      });

      return { success: true };
    }),

  // Submit form (public)
  submit: publicProcedure
    .input(
      z.object({
        formId: z.string(),
        data: z.record(z.any()),
        captchaToken: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const form = await prisma.formBuilder.findUnique({
        where: { id: input.formId, isActive: true },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify captcha if enabled
      if (form.enableCaptcha && !input.captchaToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Captcha verification required",
        });
      }

      // In production, verify captcha token with Turnstile/reCAPTCHA

      // Simple spam detection (example)
      let spamScore = 0;
      const dataStr = JSON.stringify(input.data).toLowerCase();
      if (dataStr.includes("http") || dataStr.includes("www")) spamScore += 0.3;
      if (dataStr.includes("crypto") || dataStr.includes("bitcoin")) spamScore += 0.5;

      const submission = await prisma.formSubmission.create({
        data: {
          formId: input.formId,
          data: input.data,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          referrer: input.referrer,
          isSpam: spamScore > 0.7,
          spamScore,
        },
      });

      // Increment submission count
      await prisma.formBuilder.update({
        where: { id: input.formId },
        data: { submissionCount: { increment: 1 } },
      });

      // In production: send notification email, trigger webhook

      return { success: true, submissionId: submission.id };
    }),

  // Get submissions
  getSubmissions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        isRead: z.boolean().optional(),
        isSpam: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const form = await prisma.formBuilder.findUnique({
        where: { id: input.formId },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { isRead, isSpam, page, limit } = input;

      const where: any = { formId: input.formId };
      if (isRead !== undefined) where.isRead = isRead;
      if (isSpam !== undefined) where.isSpam = isSpam;

      const [submissions, total] = await Promise.all([
        prisma.formSubmission.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.formSubmission.count({ where }),
      ]);

      return {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Mark submission as read
  markAsRead: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const submission = await prisma.formSubmission.findUnique({
        where: { id: input.submissionId },
        include: { form: true },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: submission.form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      await prisma.formSubmission.update({
        where: { id: input.submissionId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  // Delete submission
  deleteSubmission: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const submission = await prisma.formSubmission.findUnique({
        where: { id: input.submissionId },
        include: { form: true },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: submission.form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      await prisma.formSubmission.delete({
        where: { id: input.submissionId },
      });

      return { success: true };
    }),

  // Export submissions
  exportSubmissions: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        format: z.enum(["csv", "json"]).default("csv"),
      })
    )
    .query(async ({ ctx, input }) => {
      const form = await prisma.formBuilder.findUnique({
        where: { id: input.formId },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: form.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const submissions = await prisma.formSubmission.findMany({
        where: { formId: input.formId, isSpam: false },
        orderBy: { createdAt: "desc" },
      });

      if (input.format === "json") {
        return {
          format: "json",
          data: submissions.map((s) => ({
            id: s.id,
            data: s.data,
            createdAt: s.createdAt,
          })),
        };
      }

      // CSV format
      const fields = (form.fields as any[]).map((f: any) => f.label);
      const rows = submissions.map((s) => {
        const data = s.data as Record<string, any>;
        return fields.map((field) => data[field] || "");
      });

      return {
        format: "csv",
        headers: fields,
        rows,
      };
    }),
});

// CRM Router
export const crmRouter = createTRPCRouter({
  // List contacts
  listContacts: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        tags: z.array(z.string()).optional(),
        isSubscribed: z.boolean().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const { tags, isSubscribed, search, page, limit } = input;

      const where: any = { websiteId: input.websiteId };

      if (tags && tags.length > 0) {
        where.tags = { hasSome: tags };
      }

      if (isSubscribed !== undefined) {
        where.isSubscribed = isSubscribed;
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ];
      }

      const [contacts, total] = await Promise.all([
        prisma.crmContact.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.crmContact.count({ where }),
      ]);

      return {
        contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get contact
  getContact: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await prisma.crmContact.findUnique({
        where: { id: input.contactId },
        include: {
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: contact.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return contact;
    }),

  // Create contact
  createContact: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        isSubscribed: z.boolean().default(false),
        customFields: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Check for existing contact
      const existing = await prisma.crmContact.findUnique({
        where: {
          websiteId_email: {
            websiteId: input.websiteId,
            email: input.email,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Contact with this email already exists",
        });
      }

      const contact = await prisma.crmContact.create({
        data: {
          ...input,
          source: "manual",
          subscribedAt: input.isSubscribed ? new Date() : null,
        },
      });

      // Log activity
      await prisma.crmActivity.create({
        data: {
          contactId: contact.id,
          type: "note",
          description: "Contact created manually",
        },
      });

      return contact;
    }),

  // Update contact
  updateContact: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        isSubscribed: z.boolean().optional(),
        customFields: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contactId, ...data } = input;

      const contact = await prisma.crmContact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: contact.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Handle subscription status change
      const updateData: any = { ...data };
      if (data.isSubscribed !== undefined) {
        if (data.isSubscribed && !contact.isSubscribed) {
          updateData.subscribedAt = new Date();
          updateData.unsubscribedAt = null;
        } else if (!data.isSubscribed && contact.isSubscribed) {
          updateData.unsubscribedAt = new Date();
        }
      }

      const updated = await prisma.crmContact.update({
        where: { id: contactId },
        data: updateData,
      });

      return updated;
    }),

  // Delete contact
  deleteContact: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await prisma.crmContact.findUnique({
        where: { id: input.contactId },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: contact.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      await prisma.crmContact.delete({
        where: { id: input.contactId },
      });

      return { success: true };
    }),

  // Add activity/note
  addActivity: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        type: z.enum(["note", "email", "call", "meeting", "task"]),
        description: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await prisma.crmContact.findUnique({
        where: { id: input.contactId },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      // Verify ownership
      const website = await prisma.website.findFirst({
        where: { id: contact.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const activity = await prisma.crmActivity.create({
        data: {
          contactId: input.contactId,
          type: input.type,
          description: input.description,
          metadata: input.metadata,
        },
      });

      // Update last activity
      await prisma.crmContact.update({
        where: { id: input.contactId },
        data: { lastActivityAt: new Date() },
      });

      return activity;
    }),

  // Import contacts
  importContacts: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        contacts: z.array(
          z.object({
            email: z.string().email(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            phone: z.string().optional(),
            company: z.string().optional(),
            tags: z.array(z.string()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      let imported = 0;
      let skipped = 0;

      for (const contactData of input.contacts) {
        try {
          await prisma.crmContact.create({
            data: {
              websiteId: input.websiteId,
              ...contactData,
              source: "import",
            },
          });
          imported++;
        } catch (error) {
          // Likely duplicate email
          skipped++;
        }
      }

      return { imported, skipped };
    }),

  // Get CRM stats
  getStats: protectedProcedure
    .input(z.object({ websiteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const website = await prisma.website.findFirst({
        where: { id: input.websiteId, userId: ctx.user.id },
      });

      if (!website) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [
        totalContacts,
        subscribedContacts,
        recentContacts,
        topTags,
      ] = await Promise.all([
        prisma.crmContact.count({ where: { websiteId: input.websiteId } }),
        prisma.crmContact.count({
          where: { websiteId: input.websiteId, isSubscribed: true },
        }),
        prisma.crmContact.count({
          where: {
            websiteId: input.websiteId,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
        // Get tag distribution
        prisma.crmContact.findMany({
          where: { websiteId: input.websiteId },
          select: { tags: true },
        }),
      ]);

      // Calculate tag counts
      const tagCounts: Record<string, number> = {};
      topTags.forEach((contact) => {
        contact.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      return {
        totalContacts,
        subscribedContacts,
        recentContacts,
        topTags: sortedTags,
      };
    }),
});

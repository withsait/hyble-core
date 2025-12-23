// CMS (Content Management) tRPC Router
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

export const cmsRouter = createTRPCRouter({
  // Public: Get page by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await prisma.cmsPage.findUnique({
        where: { slug: input.slug, status: "PUBLISHED" },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      return page;
    }),

  // Admin: List all pages
  listPages: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { slug: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.status) {
        where.status = input.status;
      }

      const pages = await prisma.cmsPage.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });

      return { pages };
    }),

  // Admin: Get page by ID
  getPage: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const page = await prisma.cmsPage.findUnique({
        where: { id: input.id },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      return page;
    }),

  // Admin: Create page
  createPage: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string(),
        description: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug exists
      const existing = await prisma.cmsPage.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A page with this slug already exists",
        });
      }

      const page = await prisma.cmsPage.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PAGE_CREATE",
          details: { targetType: "CmsPage", targetId: page.id, title: input.title, slug: input.slug },
        },
      });

      return page;
    }),

  // Admin: Update page
  updatePage: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        content: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const page = await prisma.cmsPage.findUnique({
        where: { id },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== page.slug) {
        const existing = await prisma.cmsPage.findUnique({
          where: { slug: data.slug },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A page with this slug already exists",
          });
        }
      }

      const updated = await prisma.cmsPage.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PAGE_UPDATE",
          details: { targetType: "CmsPage", targetId: id, changes: Object.keys(data) },
        },
      });

      return updated;
    }),

  // Admin: Delete page
  deletePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.cmsPage.findUnique({
        where: { id: input.id },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      await prisma.cmsPage.delete({
        where: { id: input.id },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PAGE_DELETE",
          details: { targetType: "CmsPage", targetId: input.id, title: page.title, slug: page.slug },
        },
      });

      return { success: true };
    }),

  // Admin: Publish page
  publishPage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.cmsPage.findUnique({
        where: { id: input.id },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      const updated = await prisma.cmsPage.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PAGE_PUBLISH",
          details: { targetType: "CmsPage", targetId: input.id, title: page.title },
        },
      });

      return updated;
    }),

  // Admin: Unpublish page
  unpublishPage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.cmsPage.findUnique({
        where: { id: input.id },
      });

      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }

      const updated = await prisma.cmsPage.update({
        where: { id: input.id },
        data: {
          status: "DRAFT",
        },
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.user.id,
          action: "PAGE_UNPUBLISH",
          details: { targetType: "CmsPage", targetId: input.id, title: page.title },
        },
      });

      return updated;
    }),
});

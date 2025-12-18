import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  verifiedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

export const reviewRouter = createTRPCRouter({
  // Get reviews for a product (public)
  getProductReviews: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"]).optional(),
        rating: z.number().min(1).max(5).optional(),
        verifiedOnly: z.boolean().optional(),
        sortBy: z.enum(["newest", "oldest", "highest", "lowest", "helpful"]).default("newest"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const { productId, status, rating, verifiedOnly, sortBy, page, limit } = input;

      const where: any = {
        productId,
        status: status || "APPROVED", // Default to approved reviews for public
      };

      if (rating) {
        where.rating = rating;
      }

      if (verifiedOnly) {
        where.isVerifiedPurchase = true;
      }

      const orderBy: any = {};
      switch (sortBy) {
        case "newest":
          orderBy.createdAt = "desc";
          break;
        case "oldest":
          orderBy.createdAt = "asc";
          break;
        case "highest":
          orderBy.rating = "desc";
          break;
        case "lowest":
          orderBy.rating = "asc";
          break;
        case "helpful":
          orderBy.helpfulCount = "desc";
          break;
      }

      const [reviews, total] = await Promise.all([
        prisma.productReview.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            votes: {
              select: {
                userId: true,
                isHelpful: true,
              },
            },
          },
        }),
        prisma.productReview.count({ where }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get product rating summary (public)
  getProductRating: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const rating = await prisma.productRating.findUnique({
        where: { productId: input.productId },
      });

      if (!rating) {
        return {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verifiedPurchaseCount: 0,
        };
      }

      return {
        averageRating: Number(rating.averageRating),
        totalReviews: rating.totalReviews,
        distribution: {
          5: rating.rating5Count,
          4: rating.rating4Count,
          3: rating.rating3Count,
          2: rating.rating2Count,
          1: rating.rating1Count,
        },
        verifiedPurchaseCount: rating.verifiedPurchaseCount,
      };
    }),

  // Create a review (requires verified email)
  create: verifiedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1).max(5),
        title: z.string().max(200).optional(),
        content: z.string().min(10).max(5000),
        pros: z.array(z.string().max(200)).max(10).optional(),
        cons: z.array(z.string().max(200)).max(10).optional(),
        images: z.array(z.string().url()).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if user already reviewed this product
      const existingReview = await prisma.productReview.findUnique({
        where: {
          productId_userId: {
            productId: input.productId,
            userId,
          },
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this product",
        });
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user purchased the product
      const purchase = await prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: {
            userId,
            status: "COMPLETED",
          },
        },
        include: {
          order: true,
        },
      });

      const isVerifiedPurchase = !!purchase;

      // Create the review
      const review = await prisma.productReview.create({
        data: {
          productId: input.productId,
          userId,
          orderId: purchase?.orderId,
          isVerifiedPurchase,
          rating: input.rating,
          title: input.title,
          content: input.content,
          pros: input.pros || [],
          cons: input.cons || [],
          images: input.images || [],
          status: "PENDING", // Requires moderation
        },
      });

      return review;
    }),

  // Update own review
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().max(200).optional(),
        content: z.string().min(10).max(5000).optional(),
        pros: z.array(z.string().max(200)).max(10).optional(),
        cons: z.array(z.string().max(200)).max(10).optional(),
        images: z.array(z.string().url()).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { reviewId, ...updateData } = input;
      const userId = ctx.user.id;

      const review = await prisma.productReview.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (review.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own reviews",
        });
      }

      const updatedReview = await prisma.productReview.update({
        where: { id: reviewId },
        data: {
          ...updateData,
          isEdited: true,
          editedAt: new Date(),
          status: "PENDING", // Re-require moderation after edit
        },
      });

      return updatedReview;
    }),

  // Delete own review
  delete: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await prisma.productReview.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (review.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own reviews",
        });
      }

      await prisma.productReview.delete({
        where: { id: input.reviewId },
      });

      // Update product rating
      await updateProductRating(review.productId);

      return { success: true };
    }),

  // Vote on a review (helpful/not helpful)
  vote: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        isHelpful: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if already voted
      const existingVote = await prisma.reviewVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId: input.reviewId,
            userId,
          },
        },
      });

      if (existingVote) {
        // Update existing vote
        if (existingVote.isHelpful === input.isHelpful) {
          // Remove vote if clicking same button
          await prisma.reviewVote.delete({
            where: { id: existingVote.id },
          });
        } else {
          // Change vote
          await prisma.reviewVote.update({
            where: { id: existingVote.id },
            data: { isHelpful: input.isHelpful },
          });
        }
      } else {
        // Create new vote
        await prisma.reviewVote.create({
          data: {
            reviewId: input.reviewId,
            userId,
            isHelpful: input.isHelpful,
          },
        });
      }

      // Update vote counts
      const [helpfulCount, notHelpfulCount] = await Promise.all([
        prisma.reviewVote.count({
          where: { reviewId: input.reviewId, isHelpful: true },
        }),
        prisma.reviewVote.count({
          where: { reviewId: input.reviewId, isHelpful: false },
        }),
      ]);

      await prisma.productReview.update({
        where: { id: input.reviewId },
        data: { helpfulCount, notHelpfulCount },
      });

      return { helpfulCount, notHelpfulCount };
    }),

  // Report a review
  report: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        reason: z.enum(["spam", "inappropriate", "fake", "offensive", "other"]),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if already reported
      const existingReport = await prisma.reviewReport.findUnique({
        where: {
          reviewId_userId: {
            reviewId: input.reviewId,
            userId,
          },
        },
      });

      if (existingReport) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reported this review",
        });
      }

      await prisma.reviewReport.create({
        data: {
          reviewId: input.reviewId,
          userId,
          reason: input.reason,
          description: input.description,
        },
      });

      return { success: true };
    }),

  // Seller response to a review
  sellerRespond: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        response: z.string().min(10).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await prisma.productReview.findUnique({
        where: { id: input.reviewId },
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Check if user is the seller or admin
      const isSeller = review.product.seller?.userId === ctx.user.id;
      const isAdmin = ctx.user.role === "admin";

      if (!isSeller && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the seller or admin can respond to reviews",
        });
      }

      await prisma.productReview.update({
        where: { id: input.reviewId },
        data: {
          sellerResponse: input.response,
          sellerResponseAt: new Date(),
        },
      });

      return { success: true };
    }),

  // Admin: Moderate a review
  moderate: adminProcedure
    .input(
      z.object({
        reviewId: z.string(),
        status: z.enum(["APPROVED", "REJECTED", "FLAGGED"]),
        note: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await prisma.productReview.update({
        where: { id: input.reviewId },
        data: {
          status: input.status,
          moderatedBy: ctx.user.id,
          moderatedAt: new Date(),
          moderationNote: input.note,
        },
      });

      // Update product rating if approved
      if (input.status === "APPROVED") {
        await updateProductRating(review.productId);
      }

      return review;
    }),

  // Admin: Get pending reviews
  getPendingReviews: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;

      const [reviews, total] = await Promise.all([
        prisma.productReview.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            product: {
              select: {
                id: true,
                nameTr: true,
                nameEn: true,
                slug: true,
              },
            },
            reports: true,
          },
        }),
        prisma.productReview.count({ where: { status: "PENDING" } }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Get review reports
  getReports: adminProcedure
    .input(
      z.object({
        resolved: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { resolved, page, limit } = input;

      const where: any = {};
      if (resolved !== undefined) {
        where.isResolved = resolved;
      }

      const [reports, total] = await Promise.all([
        prisma.reviewReport.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            review: {
              include: {
                product: {
                  select: {
                    id: true,
                    nameTr: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        }),
        prisma.reviewReport.count({ where }),
      ]);

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Resolve a report
  resolveReport: adminProcedure
    .input(
      z.object({
        reportId: z.string(),
        resolution: z.enum(["kept", "removed", "edited"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await prisma.reviewReport.update({
        where: { id: input.reportId },
        data: {
          isResolved: true,
          resolvedBy: ctx.user.id,
          resolvedAt: new Date(),
          resolution: input.resolution,
        },
      });

      // If removed, flag the review
      if (input.resolution === "removed") {
        await prisma.productReview.update({
          where: { id: report.reviewId },
          data: { status: "FLAGGED" },
        });
      }

      return report;
    }),

  // Get user's own reviews
  getMyReviews: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const userId = ctx.user.id;

      const [reviews, total] = await Promise.all([
        prisma.productReview.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            product: {
              select: {
                id: true,
                nameTr: true,
                nameEn: true,
                slug: true,
                media: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        }),
        prisma.productReview.count({ where: { userId } }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: List all reviews with filters
  adminList: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const { status, rating, page, limit } = input;

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (rating) {
        where.rating = rating;
      }

      const [reviews, total] = await Promise.all([
        prisma.productReview.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            product: {
              select: {
                id: true,
                nameTr: true,
                nameEn: true,
                slug: true,
              },
            },
          },
        }),
        prisma.productReview.count({ where }),
      ]);

      // Get user info for each review
      const userIds = reviews.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Transform to match frontend expected format
      const formattedReviews = reviews.map((review) => {
        const user = userMap.get(review.userId);
        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          status: review.status,
          isVerifiedPurchase: review.isVerifiedPurchase,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt.toISOString(),
          product: {
            id: review.product.id,
            name: review.product.nameTr || review.product.nameEn || "Unnamed",
            slug: review.product.slug,
          },
          author: {
            id: user?.id || review.userId,
            name: user?.name || null,
            email: user?.email || "unknown@example.com",
          },
          reports: 0, // Reports table ilişkisi yok, şimdilik 0
        };
      });

      return {
        reviews: formattedReviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Admin: Approve a review
  approve: adminProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await prisma.productReview.update({
        where: { id: input.reviewId },
        data: {
          status: "APPROVED",
          moderatedBy: ctx.user.id,
          moderatedAt: new Date(),
        },
      });

      // Update product rating
      await updateProductRating(review.productId);

      return { success: true };
    }),

  // Admin: Reject a review
  reject: adminProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.productReview.update({
        where: { id: input.reviewId },
        data: {
          status: "REJECTED",
          moderatedBy: ctx.user.id,
          moderatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  // Admin: Reply to a review
  adminReply: adminProcedure
    .input(
      z.object({
        reviewId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.productReview.update({
        where: { id: input.reviewId },
        data: {
          sellerResponse: input.content,
          sellerResponseAt: new Date(),
        },
      });

      return { success: true };
    }),
});

// Helper function to update product rating cache
async function updateProductRating(productId: string) {
  const reviews = await prisma.productReview.findMany({
    where: {
      productId,
      status: "APPROVED",
    },
    select: {
      rating: true,
      isVerifiedPurchase: true,
    },
  });

  if (reviews.length === 0) {
    await prisma.productRating.upsert({
      where: { productId },
      create: {
        productId,
        averageRating: 0,
        totalReviews: 0,
        rating5Count: 0,
        rating4Count: 0,
        rating3Count: 0,
        rating2Count: 0,
        rating1Count: 0,
        verifiedPurchaseCount: 0,
      },
      update: {
        averageRating: 0,
        totalReviews: 0,
        rating5Count: 0,
        rating4Count: 0,
        rating3Count: 0,
        rating2Count: 0,
        rating1Count: 0,
        verifiedPurchaseCount: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  const distribution = {
    rating5Count: reviews.filter((r) => r.rating === 5).length,
    rating4Count: reviews.filter((r) => r.rating === 4).length,
    rating3Count: reviews.filter((r) => r.rating === 3).length,
    rating2Count: reviews.filter((r) => r.rating === 2).length,
    rating1Count: reviews.filter((r) => r.rating === 1).length,
  };

  const verifiedPurchaseCount = reviews.filter((r) => r.isVerifiedPurchase).length;

  await prisma.productRating.upsert({
    where: { productId },
    create: {
      productId,
      averageRating,
      totalReviews: reviews.length,
      ...distribution,
      verifiedPurchaseCount,
    },
    update: {
      averageRating,
      totalReviews: reviews.length,
      ...distribution,
      verifiedPurchaseCount,
    },
  });
}

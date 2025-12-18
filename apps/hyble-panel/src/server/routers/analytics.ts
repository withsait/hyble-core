import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "../trpc/trpc";
import { prisma } from "@hyble/db";

export const analyticsRouter = createTRPCRouter({
  // Get website analytics
  getWebsiteAnalytics: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
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

      // Calculate date range
      const endDate = input.endDate || new Date();
      let startDate = input.startDate;

      if (!startDate) {
        const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : 365;
        startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      }

      const analytics = await prisma.websiteAnalytics.findMany({
        where: {
          websiteId: input.websiteId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      // Aggregate totals
      const totals = analytics.reduce(
        (acc, day) => ({
          pageViews: acc.pageViews + day.pageViews,
          uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
          sessions: acc.sessions + day.sessions,
          avgSessionDuration:
            acc.avgSessionDuration + day.avgSessionDuration / analytics.length,
          bounceRate: acc.bounceRate + Number(day.bounceRate) / analytics.length,
        }),
        {
          pageViews: 0,
          uniqueVisitors: 0,
          sessions: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
        }
      );

      // Aggregate source data
      const sources: Record<string, number> = {};
      const devices: Record<string, number> = {};
      const countries: Record<string, number> = {};
      const pages: Record<string, number> = {};

      analytics.forEach((day) => {
        if (day.sourceData) {
          const data = day.sourceData as Record<string, number>;
          Object.entries(data).forEach(([key, value]) => {
            sources[key] = (sources[key] || 0) + value;
          });
        }

        if (day.deviceData) {
          const data = day.deviceData as Record<string, number>;
          Object.entries(data).forEach(([key, value]) => {
            devices[key] = (devices[key] || 0) + value;
          });
        }

        if (day.countryData) {
          const data = day.countryData as Record<string, number>;
          Object.entries(data).forEach(([key, value]) => {
            countries[key] = (countries[key] || 0) + value;
          });
        }

        if (day.topPages) {
          const data = day.topPages as Array<{ path: string; views: number }>;
          data.forEach(({ path, views }) => {
            pages[path] = (pages[path] || 0) + views;
          });
        }
      });

      // Sort and limit
      const topSources = Object.entries(sources)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const topDevices = Object.entries(devices)
        .sort(([, a], [, b]) => b - a);

      const topCountries = Object.entries(countries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const topPages = Object.entries(pages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20);

      return {
        daily: analytics.map((day) => ({
          date: day.date,
          pageViews: day.pageViews,
          uniqueVisitors: day.uniqueVisitors,
          sessions: day.sessions,
          bounceRate: Number(day.bounceRate),
        })),
        totals,
        sources: topSources,
        devices: topDevices,
        countries: topCountries,
        pages: topPages,
      };
    }),

  // Get SEO audit results
  getSeoAudit: protectedProcedure
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

      // Get latest audit for each page
      const audits = await prisma.seoAudit.findMany({
        where: { websiteId: input.websiteId },
        orderBy: { createdAt: "desc" },
        distinct: ["pageUrl"],
        take: 50,
      });

      // Calculate average scores
      const avgScores = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      };

      let scoreCount = 0;

      audits.forEach((audit) => {
        if (audit.performanceScore !== null) {
          avgScores.performance += audit.performanceScore;
          avgScores.accessibility += audit.accessibilityScore || 0;
          avgScores.bestPractices += audit.bestPracticesScore || 0;
          avgScores.seo += audit.seoScore || 0;
          scoreCount++;
        }
      });

      if (scoreCount > 0) {
        avgScores.performance = Math.round(avgScores.performance / scoreCount);
        avgScores.accessibility = Math.round(avgScores.accessibility / scoreCount);
        avgScores.bestPractices = Math.round(avgScores.bestPractices / scoreCount);
        avgScores.seo = Math.round(avgScores.seo / scoreCount);
      }

      // Collect all issues
      const allIssues: Array<{ type: string; message: string; page: string }> = [];
      const allRecommendations: Array<{ priority: string; message: string; page: string }> = [];

      audits.forEach((audit) => {
        if (audit.issues) {
          const issues = audit.issues as Array<{ type: string; message: string }>;
          issues.forEach((issue) => {
            allIssues.push({ ...issue, page: audit.pageUrl });
          });
        }

        if (audit.recommendations) {
          const recommendations = audit.recommendations as Array<{ priority: string; message: string }>;
          recommendations.forEach((rec) => {
            allRecommendations.push({ ...rec, page: audit.pageUrl });
          });
        }
      });

      return {
        audits,
        averageScores: avgScores,
        issues: allIssues,
        recommendations: allRecommendations,
      };
    }),

  // Run SEO audit
  runSeoAudit: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        pageUrl: z.string().url(),
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

      // In production, this would run actual Lighthouse audit
      // For now, create a mock audit with random scores
      const audit = await prisma.seoAudit.create({
        data: {
          websiteId: input.websiteId,
          pageUrl: input.pageUrl,
          performanceScore: Math.floor(Math.random() * 40) + 60,
          accessibilityScore: Math.floor(Math.random() * 30) + 70,
          bestPracticesScore: Math.floor(Math.random() * 25) + 75,
          seoScore: Math.floor(Math.random() * 20) + 80,
          fcp: Math.floor(Math.random() * 2000) + 500,
          lcp: Math.floor(Math.random() * 3000) + 1000,
          cls: Math.random() * 0.3,
          fid: Math.floor(Math.random() * 100) + 10,
          ttfb: Math.floor(Math.random() * 500) + 100,
          hasTitle: true,
          hasMeta: Math.random() > 0.2,
          hasH1: Math.random() > 0.1,
          hasAltTags: Math.random() > 0.3,
          hasCanonical: Math.random() > 0.4,
          hasRobots: Math.random() > 0.5,
          hasSitemap: Math.random() > 0.4,
          issues: [
            { type: "warning", message: "Images missing alt attributes" },
            { type: "error", message: "Missing meta description" },
          ],
          recommendations: [
            { priority: "high", message: "Add meta description for better SEO" },
            { priority: "medium", message: "Optimize images for faster loading" },
          ],
        },
      });

      return audit;
    }),

  // Record page view (for tracking)
  recordPageView: protectedProcedure
    .input(
      z.object({
        websiteId: z.string(),
        path: z.string(),
        referrer: z.string().optional(),
        device: z.enum(["desktop", "mobile", "tablet"]).optional(),
        country: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get or create today's analytics record
      let analytics = await prisma.websiteAnalytics.findUnique({
        where: {
          websiteId_date: {
            websiteId: input.websiteId,
            date: today,
          },
        },
      });

      if (!analytics) {
        analytics = await prisma.websiteAnalytics.create({
          data: {
            websiteId: input.websiteId,
            date: today,
            pageViews: 0,
            uniqueVisitors: 0,
            sessions: 0,
            sourceData: {},
            deviceData: {},
            countryData: {},
            topPages: [],
          },
        });
      }

      // Update counts
      const sourceData = (analytics.sourceData as Record<string, number>) || {};
      const deviceData = (analytics.deviceData as Record<string, number>) || {};
      const countryData = (analytics.countryData as Record<string, number>) || {};
      const topPages = (analytics.topPages as Array<{ path: string; views: number }>) || [];

      // Update source
      const source = input.referrer ? new URL(input.referrer).hostname : "direct";
      sourceData[source] = (sourceData[source] || 0) + 1;

      // Update device
      if (input.device) {
        deviceData[input.device] = (deviceData[input.device] || 0) + 1;
      }

      // Update country
      if (input.country) {
        countryData[input.country] = (countryData[input.country] || 0) + 1;
      }

      // Update top pages
      const pageIndex = topPages.findIndex((p) => p.path === input.path);
      if (pageIndex >= 0 && topPages[pageIndex]) {
        topPages[pageIndex]!.views++;
      } else {
        topPages.push({ path: input.path, views: 1 });
      }

      await prisma.websiteAnalytics.update({
        where: { id: analytics.id },
        data: {
          pageViews: { increment: 1 },
          sourceData,
          deviceData,
          countryData,
          topPages,
        },
      });

      return { success: true };
    }),

  // Admin: Get platform-wide analytics
  adminGetPlatformStats: adminProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      })
    )
    .query(async ({ input }) => {
      const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        newUsers,
        totalWebsites,
        activeWebsites,
        totalRevenue,
        totalOrders,
        totalDeployments,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
        prisma.website.count({ where: { deletedAt: null } }),
        prisma.website.count({ where: { status: "ACTIVE", deletedAt: null } }),
        prisma.order.aggregate({
          where: { status: "COMPLETED", createdAt: { gte: startDate } },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { status: "COMPLETED", createdAt: { gte: startDate } },
        }),
        prisma.websiteDeployment.count({
          where: { createdAt: { gte: startDate } },
        }),
      ]);

      // Get daily stats
      const dailyStats = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as signups
        FROM "User"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      return {
        totalUsers,
        newUsers,
        totalWebsites,
        activeWebsites,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        totalOrders,
        totalDeployments,
        dailyStats,
      };
    }),

  // Admin: Get top websites
  adminGetTopWebsites: adminProcedure
    .input(
      z.object({
        sortBy: z.enum(["traffic", "disk", "bandwidth"]).default("traffic"),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      let orderBy: any;

      switch (input.sortBy) {
        case "traffic":
          orderBy = { pageViews: "desc" };
          break;
        case "disk":
          orderBy = { diskUsage: "desc" };
          break;
        case "bandwidth":
          orderBy = { bandwidthUsage: "desc" };
          break;
      }

      const websites = await prisma.website.findMany({
        where: { deletedAt: null },
        orderBy,
        take: input.limit,
        select: {
          id: true,
          name: true,
          subdomain: true,
          customDomain: true,
          status: true,
          plan: true,
          pageViews: true,
          uniqueVisitors: true,
          diskUsage: true,
          bandwidthUsage: true,
          createdAt: true,
        },
      });

      return websites;
    }),
});

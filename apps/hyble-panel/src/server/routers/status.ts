/**
 * Status Page Router
 * FAZ3-3: Sistem durumu sayfası
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

export const statusRouter = createTRPCRouter({
  // ==================== PUBLIC PROCEDURES ====================

  /**
   * Get all public services status
   */
  getServices: publicProcedure.query(async () => {
    const services = await prisma.serviceStatus.findMany({
      where: { isPublic: true },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
      ],
    });

    // Group by category
    const grouped = services.reduce(
      (acc, service) => {
        if (!acc[service.category]) {
          acc[service.category] = [];
        }
        acc[service.category]!.push(service);
        return acc;
      },
      {} as Record<string, typeof services>
    );

    // Calculate overall status
    const statuses = services.map((s) => s.status);
    let overallStatus: "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "MAINTENANCE" = "OPERATIONAL";

    if (statuses.includes("MAJOR_OUTAGE")) {
      overallStatus = "MAJOR_OUTAGE";
    } else if (statuses.includes("PARTIAL_OUTAGE")) {
      overallStatus = "PARTIAL_OUTAGE";
    } else if (statuses.includes("DEGRADED")) {
      overallStatus = "DEGRADED";
    } else if (statuses.includes("MAINTENANCE")) {
      overallStatus = "MAINTENANCE";
    }

    return {
      services,
      grouped,
      overallStatus,
      lastUpdated: new Date(),
    };
  }),

  /**
   * Get active incidents
   */
  getIncidents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        includeResolved: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const { limit, includeResolved } = input;

      const incidents = await prisma.incident.findMany({
        where: {
          isPublic: true,
          ...(includeResolved ? {} : { status: { not: "RESOLVED" } }),
        },
        take: limit,
        orderBy: { startedAt: "desc" },
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          services: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return { incidents };
    }),

  /**
   * Get incident by ID
   */
  getIncident: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const incident = await prisma.incident.findFirst({
        where: {
          id: input.id,
          isPublic: true,
        },
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
          },
          services: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      });

      if (!incident) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Olay bulunamadı",
        });
      }

      return { incident };
    }),

  /**
   * Get scheduled maintenances
   */
  getMaintenances: publicProcedure
    .input(
      z.object({
        upcoming: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const { upcoming } = input;

      const now = new Date();

      const maintenances = await prisma.scheduledMaintenance.findMany({
        where: {
          isCancelled: false,
          ...(upcoming
            ? { scheduledEnd: { gte: now } }
            : { scheduledEnd: { lt: now } }),
        },
        orderBy: { scheduledStart: upcoming ? "asc" : "desc" },
        take: 10,
      });

      return { maintenances };
    }),

  /**
   * Get status history (uptime data)
   */
  getHistory: publicProcedure
    .input(
      z.object({
        serviceSlug: z.string().optional(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }) => {
      const { serviceSlug, days } = input;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get incidents in the time range
      const incidents = await prisma.incident.findMany({
        where: {
          isPublic: true,
          startedAt: { gte: startDate },
          ...(serviceSlug && {
            services: {
              some: { slug: serviceSlug },
            },
          }),
        },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          impact: true,
          startedAt: true,
          resolvedAt: true,
        },
      });

      // Calculate uptime percentage
      const totalMinutes = days * 24 * 60;
      let downtimeMinutes = 0;

      for (const incident of incidents) {
        if (incident.impact === "MAJOR" || incident.impact === "CRITICAL") {
          const endTime = incident.resolvedAt || new Date();
          const duration = (endTime.getTime() - incident.startedAt.getTime()) / (1000 * 60);
          downtimeMinutes += duration;
        }
      }

      const uptimePercent = ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;

      return {
        incidents,
        uptimePercent: Math.max(0, Math.min(100, uptimePercent)).toFixed(2),
        days,
      };
    }),

  // ==================== ADMIN PROCEDURES ====================

  /**
   * Create/Update service (Admin)
   */
  upsertService: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50),
        description: z.string().optional(),
        category: z.enum(["CORE", "CLOUD", "GAMING", "API", "BILLING", "AUTH"]),
        status: z.enum([
          "OPERATIONAL",
          "DEGRADED",
          "PARTIAL_OUTAGE",
          "MAJOR_OUTAGE",
          "MAINTENANCE",
        ]).default("OPERATIONAL"),
        statusMessage: z.string().optional(),
        isPublic: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      if (id) {
        const service = await prisma.serviceStatus.update({
          where: { id },
          data: {
            ...data,
            lastCheckedAt: new Date(),
          },
        });
        return { service };
      }

      const service = await prisma.serviceStatus.create({
        data: {
          ...data,
          lastCheckedAt: new Date(),
        },
      });
      return { service };
    }),

  /**
   * Update service status (Admin)
   */
  updateServiceStatus: adminProcedure
    .input(
      z.object({
        serviceId: z.string(),
        status: z.enum([
          "OPERATIONAL",
          "DEGRADED",
          "PARTIAL_OUTAGE",
          "MAJOR_OUTAGE",
          "MAINTENANCE",
        ]),
        statusMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = await prisma.serviceStatus.update({
        where: { id: input.serviceId },
        data: {
          status: input.status,
          statusMessage: input.statusMessage,
          lastCheckedAt: new Date(),
          ...(input.status !== "OPERATIONAL" && {
            lastIncidentAt: new Date(),
          }),
        },
      });

      return { service };
    }),

  /**
   * Delete service (Admin)
   */
  deleteService: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.serviceStatus.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Create incident (Admin)
   */
  createIncident: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        impact: z.enum(["NONE", "MINOR", "MAJOR", "CRITICAL"]),
        serviceIds: z.array(z.string()),
        message: z.string().min(1).max(5000),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create incident with initial update
      const incident = await prisma.incident.create({
        data: {
          title: input.title,
          impact: input.impact,
          serviceIds: input.serviceIds,
          isPublic: input.isPublic,
          createdBy: ctx.session.user.id,
          services: {
            connect: input.serviceIds.map((id) => ({ id })),
          },
          updates: {
            create: {
              status: "INVESTIGATING",
              message: input.message,
              createdBy: ctx.session.user.id,
            },
          },
        },
        include: {
          updates: true,
          services: true,
        },
      });

      // Update affected services status
      if (input.impact === "MAJOR" || input.impact === "CRITICAL") {
        await prisma.serviceStatus.updateMany({
          where: { id: { in: input.serviceIds } },
          data: {
            status: input.impact === "CRITICAL" ? "MAJOR_OUTAGE" : "PARTIAL_OUTAGE",
            lastIncidentAt: new Date(),
          },
        });
      }

      return { incident };
    }),

  /**
   * Update incident (Admin)
   */
  updateIncident: adminProcedure
    .input(
      z.object({
        incidentId: z.string(),
        status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
        message: z.string().min(1).max(5000),
        rootCause: z.string().optional(),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const incident = await prisma.incident.findUnique({
        where: { id: input.incidentId },
        include: { services: true },
      });

      if (!incident) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Olay bulunamadı",
        });
      }

      // Create update
      await prisma.incidentUpdate.create({
        data: {
          incidentId: input.incidentId,
          status: input.status,
          message: input.message,
          createdBy: ctx.session.user.id,
        },
      });

      // Update incident
      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === "RESOLVED") {
        updateData.resolvedAt = new Date();
        updateData.rootCause = input.rootCause;
        updateData.resolution = input.resolution;

        // Restore services to operational
        await prisma.serviceStatus.updateMany({
          where: { id: { in: incident.serviceIds } },
          data: { status: "OPERATIONAL" },
        });
      }

      const updatedIncident = await prisma.incident.update({
        where: { id: input.incidentId },
        data: updateData,
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
          },
          services: true,
        },
      });

      return { incident: updatedIncident };
    }),

  /**
   * Create scheduled maintenance (Admin)
   */
  createMaintenance: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(5000),
        serviceIds: z.array(z.string()),
        scheduledStart: z.date(),
        scheduledEnd: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.scheduledEnd <= input.scheduledStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitiş tarihi başlangıç tarihinden sonra olmalı",
        });
      }

      const maintenance = await prisma.scheduledMaintenance.create({
        data: {
          title: input.title,
          description: input.description,
          serviceIds: input.serviceIds,
          scheduledStart: input.scheduledStart,
          scheduledEnd: input.scheduledEnd,
          createdBy: ctx.session.user.id,
        },
      });

      return { maintenance };
    }),

  /**
   * Cancel maintenance (Admin)
   */
  cancelMaintenance: adminProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.scheduledMaintenance.update({
        where: { id: input.id },
        data: {
          isCancelled: true,
          cancelReason: input.reason,
        },
      });

      return { success: true };
    }),

  /**
   * Start maintenance (Admin)
   */
  startMaintenance: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const maintenance = await prisma.scheduledMaintenance.findUnique({
        where: { id: input.id },
      });

      if (!maintenance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bakım bulunamadı",
        });
      }

      // Update maintenance
      await prisma.scheduledMaintenance.update({
        where: { id: input.id },
        data: { actualStart: new Date() },
      });

      // Set affected services to maintenance
      await prisma.serviceStatus.updateMany({
        where: { id: { in: maintenance.serviceIds } },
        data: { status: "MAINTENANCE" },
      });

      return { success: true };
    }),

  /**
   * End maintenance (Admin)
   */
  endMaintenance: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const maintenance = await prisma.scheduledMaintenance.findUnique({
        where: { id: input.id },
      });

      if (!maintenance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bakım bulunamadı",
        });
      }

      // Update maintenance
      await prisma.scheduledMaintenance.update({
        where: { id: input.id },
        data: { actualEnd: new Date() },
      });

      // Restore services to operational
      await prisma.serviceStatus.updateMany({
        where: { id: { in: maintenance.serviceIds } },
        data: { status: "OPERATIONAL" },
      });

      return { success: true };
    }),

  /**
   * Get admin stats (Admin)
   */
  adminStats: adminProcedure.query(async () => {
    const [
      totalServices,
      operationalServices,
      activeIncidents,
      upcomingMaintenances,
    ] = await Promise.all([
      prisma.serviceStatus.count(),
      prisma.serviceStatus.count({ where: { status: "OPERATIONAL" } }),
      prisma.incident.count({ where: { status: { not: "RESOLVED" } } }),
      prisma.scheduledMaintenance.count({
        where: {
          isCancelled: false,
          scheduledStart: { gte: new Date() },
        },
      }),
    ]);

    return {
      totalServices,
      operationalServices,
      activeIncidents,
      upcomingMaintenances,
      healthPercent: totalServices > 0
        ? ((operationalServices / totalServices) * 100).toFixed(1)
        : "100",
    };
  }),
});

export default statusRouter;

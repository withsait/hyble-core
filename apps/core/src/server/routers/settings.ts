/**
 * Settings Router - Platform Settings Management
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";

// Settings are stored as key-value pairs in a simple table
// For now, we'll use a JSON field in a single record

export const settingsRouter = createTRPCRouter({
  // Get all settings
  getAll: adminProcedure.query(async () => {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to object
    const settingsObject: Record<string, string | number | boolean> = {};
    settings.forEach((setting) => {
      try {
        settingsObject[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObject[setting.key] = setting.value;
      }
    });

    return settingsObject;
  }),

  // Get settings by section
  getBySection: adminProcedure
    .input(z.object({ section: z.string() }))
    .query(async ({ input }) => {
      const settings = await prisma.systemSetting.findMany({
        where: {
          key: { startsWith: `${input.section}.` },
        },
      });

      const settingsObject: Record<string, string | number | boolean> = {};
      settings.forEach((setting) => {
        const key = setting.key.replace(`${input.section}.`, "");
        try {
          settingsObject[key] = JSON.parse(setting.value);
        } catch {
          settingsObject[key] = setting.value;
        }
      });

      return settingsObject;
    }),

  // Get single setting
  get: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: input.key },
      });

      if (!setting) return null;

      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }),

  // Update settings (batch)
  update: adminProcedure
    .input(
      z.object({
        section: z.string(),
        settings: z.record(z.union([z.string(), z.number(), z.boolean()])),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { section, settings } = input;

      // Update each setting
      const updates = Object.entries(settings).map(async ([key, value]) => {
        const fullKey = `${section}.${key}`;
        const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

        await prisma.systemSetting.upsert({
          where: { key: fullKey },
          update: {
            value: stringValue,
            updatedAt: new Date(),
          },
          create: {
            key: fullKey,
            value: stringValue,
          },
        });
      });

      await Promise.all(updates);

      // Log the action
      await prisma.adminAction.create({
        data: {
          adminId: ctx.session.user.id,
          action: "SETTINGS_UPDATE",
          details: {
            message: `Updated ${Object.keys(settings).length} settings in ${section}`,
            section,
            keys: Object.keys(settings),
          },
        },
      });

      return { success: true, updated: Object.keys(settings).length };
    }),

  // Set single setting
  set: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stringValue = typeof input.value === "object" ? JSON.stringify(input.value) : String(input.value);

      await prisma.systemSetting.upsert({
        where: { key: input.key },
        update: {
          value: stringValue,
          updatedAt: new Date(),
        },
        create: {
          key: input.key,
          value: stringValue,
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.session.user.id,
          action: "SETTINGS_UPDATE",
          details: { message: `Updated setting: ${input.key}`, key: input.key },
        },
      });

      return { success: true };
    }),

  // Delete setting
  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.systemSetting.delete({
        where: { key: input.key },
      });

      await prisma.adminAction.create({
        data: {
          adminId: ctx.session.user.id,
          action: "SETTINGS_DELETE",
          details: { message: `Deleted setting: ${input.key}`, key: input.key },
        },
      });

      return { success: true };
    }),

  // Initialize default settings (run once)
  initDefaults: adminProcedure.mutation(async ({ ctx }) => {
    const defaults: Record<string, string | number | boolean> = {
      // General
      "general.site_name": "Hyble",
      "general.site_url": "https://hyble.co",
      "general.maintenance_mode": false,
      "general.default_language": "tr",
      "general.default_currency": "EUR",

      // Auth
      "auth.require_email_verification": true,
      "auth.require_2fa_admin": true,
      "auth.session_duration_hours": 168,
      "auth.max_login_attempts": 5,
      "auth.lockout_duration_minutes": 30,
      "auth.password_min_length": 8,

      // Billing
      "billing.stripe_mode": "test",
      "billing.invoice_prefix": "HYB",
      "billing.invoice_due_days": 14,
      "billing.tax_rate": 20,
      "billing.min_deposit_amount": 5,

      // Email
      "email.from_email": "noreply@hyble.co",
      "email.from_name": "Hyble",
      "email.reply_to_email": "support@hyble.co",

      // Wallet
      "wallet.min_deposit": 5,
      "wallet.max_deposit": 1000,
      "wallet.bonus_enabled": true,
      "wallet.deposit_bonus_percent": 10,
    };

    let created = 0;
    for (const [key, value] of Object.entries(defaults)) {
      const existing = await prisma.systemSetting.findUnique({
        where: { key },
      });

      if (!existing) {
        await prisma.systemSetting.create({
          data: {
            key,
            value: String(value),
          },
        });
        created++;
      }
    }

    await prisma.adminAction.create({
      data: {
        adminId: ctx.session.user.id,
        action: "SETTINGS_INIT",
        details: `Initialized ${created} default settings`,
      },
    });

    return { success: true, created };
  }),
});

export default settingsRouter;

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";
import * as claude from "../../lib/ai/claude";
import * as gemini from "../../lib/ai/gemini";

/**
 * Website Builder Wizard Router
 * AI-powered website creation system
 */

// Schemas
const businessInfoSchema = z.object({
  businessName: z.string().min(1).max(100),
  businessType: z.string().min(1),
  industry: z.string().optional(),
  description: z.string().min(10).max(1000),
  targetAudience: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
});

const designPreferencesSchema = z.object({
  colorScheme: z.enum(["light", "dark", "colorful", "minimal"]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  style: z.enum(["modern", "classic", "playful", "corporate", "artistic"]).optional(),
  layoutPreference: z.enum(["single-page", "multi-page"]).optional(),
  features: z.array(z.string()).optional(),
});

const pageConfigSchema = z.object({
  type: z.enum([
    "home", "about", "services", "products", "portfolio",
    "blog", "contact", "pricing", "faq", "testimonials", "team"
  ]),
  title: z.string().optional(),
  sections: z.array(z.string()).optional(),
  customContent: z.string().optional(),
});

const wizardSessionSchema = z.object({
  step: z.number().min(1).max(10),
  businessInfo: businessInfoSchema.optional(),
  designPreferences: designPreferencesSchema.optional(),
  pages: z.array(pageConfigSchema).optional(),
  generatedContent: z.record(z.any()).optional(),
  selectedTemplate: z.string().optional(),
  domain: z.string().optional(),
});

// Template types
const businessTypes = [
  { id: "restaurant", name: "Restoran / Kafe", icon: "🍽️" },
  { id: "ecommerce", name: "E-Ticaret", icon: "🛍️" },
  { id: "service", name: "Hizmet Sektörü", icon: "🔧" },
  { id: "portfolio", name: "Portfolyo", icon: "🎨" },
  { id: "blog", name: "Blog", icon: "📝" },
  { id: "corporate", name: "Kurumsal", icon: "🏢" },
  { id: "education", name: "Eğitim", icon: "🎓" },
  { id: "health", name: "Sağlık", icon: "🏥" },
  { id: "realestate", name: "Emlak", icon: "🏠" },
  { id: "tech", name: "Teknoloji", icon: "💻" },
  { id: "fitness", name: "Spor / Fitness", icon: "💪" },
  { id: "beauty", name: "Güzellik / SPA", icon: "💅" },
  { id: "event", name: "Etkinlik", icon: "🎉" },
  { id: "nonprofit", name: "STK / Dernek", icon: "🤝" },
  { id: "other", name: "Diğer", icon: "📌" },
];

export const wizardRouter = createTRPCRouter({
  // Get business types
  getBusinessTypes: protectedProcedure.query(async () => {
    return businessTypes;
  }),

  // Start wizard session
  startSession: protectedProcedure
    .input(z.object({
      businessType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create or update wizard session
      const session = await prisma.wizardSession.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        create: {
          userId: ctx.session.user.id,
          step: 1,
          data: {
            businessType: input.businessType,
          },
        },
        update: {
          step: 1,
          data: {
            businessType: input.businessType,
          },
          updatedAt: new Date(),
        },
      });

      return session;
    }),

  // Get current session
  getSession: protectedProcedure.query(async ({ ctx }) => {
    const session = await prisma.wizardSession.findUnique({
      where: { userId: ctx.session.user.id },
    });

    return session;
  }),

  // Update session step
  updateSession: protectedProcedure
    .input(z.object({
      step: z.number().min(1).max(10),
      data: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await prisma.wizardSession.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const updatedSession = await prisma.wizardSession.update({
        where: { userId: ctx.session.user.id },
        data: {
          step: input.step,
          data: {
            ...session.data as object,
            ...input.data,
          },
          updatedAt: new Date(),
        },
      });

      return updatedSession;
    }),

  // Generate AI content for business
  generateContent: protectedProcedure
    .input(z.object({
      businessInfo: businessInfoSchema,
      contentType: z.enum(["full", "hero", "about", "services", "seo"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { businessInfo, contentType } = input;

      try {
        if (contentType === "full" || contentType === "hero" || contentType === "about") {
          const content = await claude.generateWebsiteContent(
            businessInfo.businessType,
            businessInfo.businessName,
            businessInfo.description,
            { temperature: 0.7 }
          );

          // Save generated content
          await prisma.wizardSession.update({
            where: { userId: ctx.session.user.id },
            data: {
              data: {
                generatedContent: content,
              },
            },
          });

          return content;
        }

        if (contentType === "seo") {
          const seo = await claude.generateSEO(
            businessInfo.businessName,
            businessInfo.description,
            { temperature: 0.5 }
          );

          return seo;
        }

        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid content type" });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "İçerik oluşturulamadı",
        });
      }
    }),

  // Generate page content
  generatePageContent: protectedProcedure
    .input(z.object({
      pageType: z.string(),
      businessInfo: businessInfoSchema,
      additionalContext: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompts: Record<string, string> = {
        home: `Ana sayfa içeriği oluştur: Hero section, öne çıkanlar, CTA`,
        about: `Hakkımızda sayfası oluştur: Hikaye, misyon, vizyon, değerler`,
        services: `Hizmetler sayfası oluştur: Hizmet listesi, açıklamalar, fiyatlandırma ipuçları`,
        products: `Ürünler sayfası oluştur: Kategoriler, öne çıkan ürünler`,
        portfolio: `Portfolyo sayfası oluştur: Projeler, başarı hikayeleri`,
        contact: `İletişim sayfası oluştur: Form, harita, sosyal medya, SSS`,
        pricing: `Fiyatlandırma sayfası oluştur: Paketler, karşılaştırma tablosu`,
        faq: `SSS sayfası oluştur: En az 10 soru-cevap`,
        testimonials: `Müşteri yorumları sayfası oluştur: Örnek testimonial'lar`,
        team: `Ekip sayfası oluştur: Takım üyeleri, roller, biyografiler`,
        blog: `Blog sayfası düzeni oluştur: Kategori önerileri, örnek yazı başlıkları`,
      };

      const prompt = prompts[input.pageType] || `${input.pageType} sayfası içeriği oluştur`;

      try {
        const response = await claude.prompt(
          `${input.businessInfo.businessName} için ${prompt}

           İşletme tipi: ${input.businessInfo.businessType}
           Açıklama: ${input.businessInfo.description}
           ${input.additionalContext ? `Ek bilgi: ${input.additionalContext}` : ""}

           Türkçe olarak, JSON formatında yanıt ver.`,
          {
            model: "claude-3-5-haiku-20241022",
            temperature: 0.7,
          }
        );

        return JSON.parse(response.content);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sayfa içeriği oluşturulamadı",
        });
      }
    }),

  // Get recommended templates
  getTemplates: protectedProcedure
    .input(z.object({
      businessType: z.string(),
      style: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const templates = await prisma.template.findMany({
        where: {
          OR: [
            { category: input.businessType },
            { tags: { has: input.businessType } },
          ],
          isActive: true,
        },
        take: 12,
        orderBy: { popularity: "desc" },
      });

      return templates;
    }),

  // Analyze uploaded logo/image
  analyzeImage: protectedProcedure
    .input(z.object({
      imageBase64: z.string(),
      mimeType: z.string().default("image/png"),
    }))
    .mutation(async ({ input }) => {
      try {
        const analysis = await gemini.analyzeImage(
          input.imageBase64,
          input.mimeType,
          `Bu logoyu/görseli analiz et ve şunları belirle:
           - Dominant renkler (hex kodları)
           - Stil (modern, klasik, minimalist, vb.)
           - Önerilen tamamlayıcı renkler
           - Web sitesi tasarımı için öneriler
           JSON formatında yanıt ver.`
        );

        return analysis;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Görsel analizi yapılamadı",
        });
      }
    }),

  // Generate color palette
  generateColorPalette: protectedProcedure
    .input(z.object({
      baseColor: z.string().optional(),
      businessType: z.string(),
      style: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await claude.prompt(
          `${input.businessType} sektörü için ${input.style || "modern"} tarzda bir renk paleti oluştur.
           ${input.baseColor ? `Ana renk: ${input.baseColor}` : ""}

           JSON formatında şunları döndür:
           - primary: Ana renk (hex)
           - secondary: İkincil renk (hex)
           - accent: Vurgu rengi (hex)
           - background: Arkaplan rengi (hex)
           - text: Metin rengi (hex)
           - success, warning, error renkleri (hex)
           - gradient: Önerilen gradient

           Sadece JSON döndür.`,
          {
            model: "claude-3-5-haiku-20241022",
            temperature: 0.6,
          }
        );

        return JSON.parse(response.content);
      } catch (error) {
        // Return default palette on error
        return {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#f59e0b",
          background: "#ffffff",
          text: "#1f2937",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        };
      }
    }),

  // Create website from wizard data
  createWebsite: protectedProcedure
    .input(z.object({
      templateId: z.string().optional(),
      subdomain: z.string().min(3).max(30),
      customDomain: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get wizard session
      const session = await prisma.wizardSession.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!session || !session.data) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Wizard session not found" });
      }

      const wizardData = session.data as any;

      // Check subdomain availability
      const existing = await prisma.website.findFirst({
        where: { subdomain: input.subdomain },
      });

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu subdomain zaten kullanımda" });
      }

      // Create website
      const website = await prisma.website.create({
        data: {
          userId: ctx.session.user.id,
          name: wizardData.businessInfo?.businessName || "Yeni Site",
          subdomain: input.subdomain,
          customDomain: input.customDomain,
          templateId: input.templateId,
          status: "BUILDING",
          settings: {
            businessInfo: wizardData.businessInfo,
            designPreferences: wizardData.designPreferences,
            pages: wizardData.pages,
            generatedContent: wizardData.generatedContent,
          },
        },
      });

      // Create default pages
      const defaultPages = ["home", "about", "contact"];
      const pagesToCreate = wizardData.pages?.map((p: any) => p.type) || defaultPages;

      for (let i = 0; i < pagesToCreate.length; i++) {
        const pageType = pagesToCreate[i];
        await prisma.page.create({
          data: {
            websiteId: website.id,
            title: pageType === "home" ? "Ana Sayfa" : pageType.charAt(0).toUpperCase() + pageType.slice(1),
            slug: pageType === "home" ? "" : pageType,
            type: pageType,
            order: i,
            content: wizardData.generatedContent?.[pageType] || {},
            isPublished: false,
          },
        });
      }

      // Clear wizard session
      await prisma.wizardSession.delete({
        where: { userId: ctx.session.user.id },
      });

      return website;
    }),

  // Check subdomain availability
  checkSubdomain: protectedProcedure
    .input(z.object({ subdomain: z.string().min(3).max(30) }))
    .query(async ({ input }) => {
      const existing = await prisma.website.findFirst({
        where: { subdomain: input.subdomain },
      });

      return {
        available: !existing,
        subdomain: input.subdomain,
        url: `https://${input.subdomain}.hyble.co`,
      };
    }),

  // Get wizard progress
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const session = await prisma.wizardSession.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!session) {
      return {
        hasSession: false,
        step: 0,
        progress: 0,
        data: null,
      };
    }

    const totalSteps = 6;
    const progress = Math.round((session.step / totalSteps) * 100);

    return {
      hasSession: true,
      step: session.step,
      progress,
      data: session.data,
      lastUpdated: session.updatedAt,
    };
  }),

  // Reset wizard
  resetWizard: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.wizardSession.deleteMany({
      where: { userId: ctx.session.user.id },
    });

    return { success: true };
  }),

  // Admin: Get wizard analytics
  adminGetAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const dateFilter = {
        gte: input.startDate,
        lte: input.endDate,
      };

      const [
        totalSessions,
        completedWebsites,
        abandonedSessions,
        popularBusinessTypes,
      ] = await Promise.all([
        prisma.wizardSession.count({
          where: { createdAt: dateFilter },
        }),
        prisma.website.count({
          where: { createdAt: dateFilter },
        }),
        prisma.wizardSession.count({
          where: {
            createdAt: dateFilter,
            step: { lt: 6 },
          },
        }),
        prisma.$queryRaw`
          SELECT data->>'businessType' as business_type, COUNT(*) as count
          FROM wizard_sessions
          WHERE created_at >= ${input.startDate} AND created_at <= ${input.endDate}
          GROUP BY data->>'businessType'
          ORDER BY count DESC
          LIMIT 10
        `,
      ]);

      return {
        totalSessions,
        completedWebsites,
        abandonedSessions,
        conversionRate: totalSessions > 0 ? (completedWebsites / totalSessions) * 100 : 0,
        popularBusinessTypes,
      };
    }),
});

export type WizardRouter = typeof wizardRouter;

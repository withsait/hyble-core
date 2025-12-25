import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";
import * as claude from "../../lib/ai/claude";
import * as gemini from "../../lib/ai/gemini";

/**
 * Hyla AI Assistant Router
 * AI-powered chatbot supporting both Claude and Gemini
 */

// Types
const AIProvider = z.enum(["claude", "gemini"]);
const MessageRole = z.enum(["user", "assistant"]);

// Schemas
const createConversationSchema = z.object({
  title: z.string().optional(),
  provider: AIProvider.default("claude"),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  context: z.record(z.any()).optional(),
});

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(10000),
  attachments: z.array(z.object({
    type: z.enum(["image", "file"]),
    url: z.string(),
    mimeType: z.string(),
  })).optional(),
});

const feedbackSchema = z.object({
  messageId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  category: z.enum(["helpful", "accurate", "fast", "creative", "other"]).optional(),
});

// Default system prompts
const defaultSystemPrompts = {
  general: `Sen Hyla, Hyble platformunun AI asistanısın. Türkçe ve İngilizce konuşabilirsin.
Görevin kullanıcılara yardımcı olmak, soruları cevaplamak ve platformu kullanmalarına destek olmaktır.
Her zaman kibar, profesyonel ve yardımsever ol. Emin olmadığın konularda bunu belirt.`,

  support: `Sen Hyla, Hyble müşteri destek asistanısın.
Kullanıcıların teknik sorunlarını çözmelerine, sipariş takibi yapmalarına ve platform hakkında bilgi almalarına yardımcı ol.
Çözemediğin sorunlar için destek talebi oluşturmalarını öner.`,

  sales: `Sen Hyla, Hyble satış asistanısın.
Kullanıcılara ürünler hakkında bilgi ver, önerilerde bulun ve satın alma sürecinde yardımcı ol.
Her zaman müşteri ihtiyaçlarını anlamaya çalış ve en uygun ürünleri öner.`,

  developer: `Sen Hyla, Hyble geliştirici asistanısın.
API entegrasyonları, teknik dokümantasyon ve kod örnekleri konusunda yardımcı ol.
Kod örnekleri verirken açıklayıcı ol ve best practice'leri takip et.`,
};

export const hylaRouter = router({
  // Create a new conversation
  createConversation: protectedProcedure
    .input(createConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.hylaConversation.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title || "Yeni Konuşma",
          provider: input.provider,
          model: input.model || (input.provider === "claude" ? "claude-sonnet-4-20250514" : "gemini-1.5-flash"),
          systemPrompt: input.systemPrompt || defaultSystemPrompts.general,
          context: input.context || {},
        },
      });

      return conversation;
    }),

  // Get user's conversations
  listConversations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conversations = await prisma.hylaConversation.findMany({
        where: {
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          provider: true,
          model: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (conversations.length > input.limit) {
        const nextItem = conversations.pop();
        nextCursor = nextItem?.id;
      }

      return {
        conversations,
        nextCursor,
      };
    }),

  // Get conversation with messages
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await prisma.hylaConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              role: true,
              content: true,
              attachments: true,
              tokenCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      return conversation;
    }),

  // Send a message and get AI response
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Get conversation
      const conversation = await prisma.hylaConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      // Save user message
      const userMessage = await prisma.hylaMessage.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: input.content,
          attachments: input.attachments || [],
        },
      });

      // Prepare messages for AI
      const hasImages = input.attachments?.some(a => a.type === "image");

      try {
        let aiResponse: string;
        let tokenCount: { input: number; output: number } = { input: 0, output: 0 };

        if (conversation.provider === "claude") {
          // Use Claude
          const messages: claude.ClaudeMessage[] = conversation.messages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
          messages.push({ role: "user", content: input.content });

          const response = await claude.sendMessage(messages, {
            model: conversation.model as claude.ClaudeModel,
            systemPrompt: conversation.systemPrompt || undefined,
            temperature: 0.7,
          });

          aiResponse = response.content;
          tokenCount = {
            input: response.inputTokens,
            output: response.outputTokens,
          };
        } else {
          // Use Gemini
          const messages: gemini.GeminiMessage[] = conversation.messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          }));

          // Handle image attachments for Gemini Vision
          if (hasImages && input.attachments) {
            const imageParts = input.attachments
              .filter(a => a.type === "image")
              .map(a => ({
                inlineData: {
                  mimeType: a.mimeType,
                  data: a.url.replace(/^data:image\/\w+;base64,/, ""),
                },
              }));

            messages.push({
              role: "user",
              parts: [{ text: input.content }, ...imageParts],
            });
          } else {
            messages.push({
              role: "user",
              parts: [{ text: input.content }],
            });
          }

          const response = await gemini.sendMessage(messages, {
            model: conversation.model as gemini.GeminiModel,
            temperature: 0.7,
          });

          aiResponse = response.content;
          tokenCount = {
            input: response.promptTokens || 0,
            output: response.candidateTokens || 0,
          };
        }

        // Save AI response
        const assistantMessage = await prisma.hylaMessage.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: aiResponse,
            tokenCount: tokenCount.output,
          },
        });

        // Update conversation
        await prisma.hylaConversation.update({
          where: { id: conversation.id },
          data: {
            updatedAt: new Date(),
            totalTokens: {
              increment: tokenCount.input + tokenCount.output,
            },
          },
        });

        return {
          userMessage,
          assistantMessage,
          tokenCount,
        };
      } catch (error) {
        // Save error message
        await prisma.hylaMessage.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
            metadata: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI yanıt oluşturulamadı",
        });
      }
    }),

  // Stream message response
  streamMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // This would need to be implemented with SSE or WebSocket
      // For now, return regular response
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Streaming henüz desteklenmiyor",
      });
    }),

  // Update conversation title
  updateConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      title: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.hylaConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return prisma.hylaConversation.update({
        where: { id: input.conversationId },
        data: { title: input.title },
      });
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.hylaConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Soft delete
      return prisma.hylaConversation.update({
        where: { id: input.conversationId },
        data: { deletedAt: new Date() },
      });
    }),

  // Submit feedback for a message
  submitFeedback: protectedProcedure
    .input(feedbackSchema)
    .mutation(async ({ ctx, input }) => {
      const message = await prisma.hylaMessage.findFirst({
        where: { id: input.messageId },
        include: { conversation: true },
      });

      if (!message || message.conversation.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return prisma.hylaFeedback.create({
        data: {
          messageId: input.messageId,
          userId: ctx.session.user.id,
          rating: input.rating,
          feedback: input.feedback,
          category: input.category,
        },
      });
    }),

  // Get available models
  getModels: protectedProcedure.query(async () => {
    return {
      claude: [
        { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5", description: "En güçlü model" },
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Dengeli performans" },
        { id: "claude-3-5-haiku-20241022", name: "Claude Haiku 3.5", description: "Hızlı yanıtlar" },
      ],
      gemini: [
        { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", description: "Deneysel, ücretsiz" },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "En güçlü Gemini" },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Hızlı ve ekonomik" },
      ],
    };
  }),

  // Get usage statistics
  getUsageStats: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        createdAt: {
          gte: input.startDate,
          lte: input.endDate,
        },
      };

      const [conversations, messages, totalTokens] = await Promise.all([
        prisma.hylaConversation.count({ where }),
        prisma.hylaMessage.count({
          where: {
            conversation: { userId: ctx.session.user.id },
            createdAt: {
              gte: input.startDate,
              lte: input.endDate,
            },
          },
        }),
        prisma.hylaConversation.aggregate({
          where,
          _sum: { totalTokens: true },
        }),
      ]);

      return {
        totalConversations: conversations,
        totalMessages: messages,
        totalTokens: totalTokens._sum.totalTokens || 0,
      };
    }),

  // Admin: Get all conversations
  adminListConversations: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      userId: z.string().optional(),
      provider: AIProvider.optional(),
    }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = { deletedAt: null };
      if (input.userId) where.userId = input.userId;
      if (input.provider) where.provider = input.provider;

      const [conversations, total] = await Promise.all([
        prisma.hylaConversation.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { updatedAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            _count: { select: { messages: true } },
          },
        }),
        prisma.hylaConversation.count({ where }),
      ]);

      return {
        conversations,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Admin: Get analytics
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
        totalConversations,
        totalMessages,
        conversationsByProvider,
        averageMessagesPerConversation,
        topUsers,
        dailyUsage,
      ] = await Promise.all([
        prisma.hylaConversation.count({
          where: { createdAt: dateFilter, deletedAt: null },
        }),
        prisma.hylaMessage.count({
          where: { createdAt: dateFilter },
        }),
        prisma.hylaConversation.groupBy({
          by: ["provider"],
          where: { createdAt: dateFilter, deletedAt: null },
          _count: true,
        }),
        prisma.hylaConversation.aggregate({
          where: { createdAt: dateFilter, deletedAt: null },
          _avg: { totalTokens: true },
        }),
        prisma.hylaConversation.groupBy({
          by: ["userId"],
          where: { createdAt: dateFilter, deletedAt: null },
          _count: true,
          orderBy: { _count: { userId: "desc" } },
          take: 10,
        }),
        // This would need a raw query for daily aggregation
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM hyla_messages
          WHERE created_at >= ${input.startDate} AND created_at <= ${input.endDate}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `,
      ]);

      return {
        totalConversations,
        totalMessages,
        conversationsByProvider,
        averageTokensPerConversation: averageMessagesPerConversation._avg.totalTokens || 0,
        topUsers,
        dailyUsage,
      };
    }),

  // Knowledge base management
  addKnowledge: adminProcedure
    .input(z.object({
      category: z.string(),
      title: z.string(),
      content: z.string(),
      keywords: z.array(z.string()).optional(),
      priority: z.number().min(0).max(100).default(50),
    }))
    .mutation(async ({ input }) => {
      return prisma.hylaKnowledgeBase.create({
        data: {
          category: input.category,
          title: input.title,
          content: input.content,
          keywords: input.keywords || [],
          priority: input.priority,
        },
      });
    }),

  listKnowledge: adminProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: any = {};
      if (input.category) where.category = input.category;
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { content: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return prisma.hylaKnowledgeBase.findMany({
        where,
        orderBy: { priority: "desc" },
      });
    }),

  updateKnowledge: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      priority: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.hylaKnowledgeBase.update({
        where: { id },
        data,
      });
    }),

  deleteKnowledge: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.hylaKnowledgeBase.delete({
        where: { id: input.id },
      });
    }),
});

export type HylaRouter = typeof hylaRouter;

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  router,
  publicProcedure,
  protectedProcedure,
  technicianProcedure,
} from '../trpc';
import { prisma } from '@galaxy/db';

export const aiRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: Integrate with OpenAI / Claude API for Layla chatbot
      return {
        reply:
          'مرحباً! أنا ليلى، مستشارة الجمال الخاصة بك. كيف يمكنني مساعدتك اليوم؟',
        conversationId: input.conversationId ?? crypto.randomUUID(),
      };
    }),

  getRecommendations: protectedProcedure
    .input(
      z
        .object({ limit: z.number().optional().default(5) })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      // TODO: Implement ML-based recommendation engine
      // For now, return random active services
      const count = await prisma.service.count({ where: { isActive: true } });
      if (count === 0) return { recommendations: [] };

      // Get some random services
      const take = Math.min(input.limit, count);
      const skip = Math.max(0, Math.floor(Math.random() * (count - take)));

      const services = await prisma.service.findMany({
        where: { isActive: true },
        skip,
        take,
        include: {
          category: { select: { id: true, nameJson: true, slug: true } },
        },
      });

      return {
        recommendations: services.map((s) => ({
          id: s.id,
          titleJson: s.titleJson,
          descriptionJson: s.descriptionJson,
          basePrice: s.basePrice.toNumber(),
          durationMin: s.durationMin,
          imageUrl: s.imageUrl,
          category: s.category,
        })),
      };
    }),

  submitQuiz: protectedProcedure
    .input(
      z.object({
        responses: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.customerQuizResponse.findUnique({
        where: { userId: ctx.user.id },
      });

      if (existing) {
        const updated = await prisma.customerQuizResponse.update({
          where: { userId: ctx.user.id },
          data: { responses: input.responses as any },
        });
        return { id: updated.id, updated: true };
      }

      const created = await prisma.customerQuizResponse.create({
        data: {
          userId: ctx.user.id,
          responses: input.responses as any,
        },
      });

      return { id: created.id, updated: false };
    }),

  getQuiz: protectedProcedure.query(async ({ ctx }) => {
    const quiz = await prisma.customerQuizResponse.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!quiz) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No quiz responses found. Please complete the onboarding quiz first.',
      });
    }

    return {
      id: quiz.id,
      responses: quiz.responses,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }),

  feedback: protectedProcedure
    .input(
      z.object({
        itemType: z.enum(['service', 'technician']),
        itemId: z.number(),
        feedback: z.enum(['thumbs_up', 'thumbs_down']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await prisma.recommendationFeedback.create({
        data: {
          userId: ctx.user.id,
          recommendedItemType: input.itemType,
          recommendedItemId: input.itemId,
          feedback: input.feedback,
        },
      });

      return { id: record.id, feedback: record.feedback };
    }),

  getPlans: publicProcedure.query(async () => {
    const plans = await prisma.aiSubscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    return plans.map((p) => ({
      id: p.id,
      nameJson: p.nameJson,
      feature: p.feature,
      monthlyLimit: p.monthlyLimit,
      priceMonthly: p.priceMonthly.toNumber(),
    }));
  }),

  subscribeToPlan: technicianProcedure
    .input(
      z.object({
        planId: z.number(),
        autoRenew: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const plan = await prisma.aiSubscriptionPlan.findUnique({
        where: { id: input.planId },
      });
      if (!plan || !plan.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription plan not found or inactive',
        });
      }

      // Check for existing active subscription
      const existing = await prisma.customerAiSubscription.findUnique({
        where: { userId: ctx.user.id },
      });
      if (existing && existing.status === 'ACTIVE') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already have an active subscription',
        });
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const subscription = await prisma.customerAiSubscription.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          planId: input.planId,
          status: 'ACTIVE',
          expiresAt,
          autoRenew: input.autoRenew,
        },
        update: {
          planId: input.planId,
          status: 'ACTIVE',
          expiresAt,
          autoRenew: input.autoRenew,
        },
      });

      return {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        autoRenew: subscription.autoRenew,
      };
    }),

  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.customerAiSubscription.findUnique({
      where: { userId: ctx.user.id },
      include: {
        plan: true,
        usage: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active subscription found',
      });
    }

    // Calculate current month usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyUsage = subscription.usage.filter(
      (u) => u.createdAt >= startOfMonth,
    );
    const totalRequests = monthlyUsage.reduce(
      (sum, u) => sum + u.requestCount,
      0,
    );

    return {
      id: subscription.id,
      status: subscription.status,
      plan: {
        id: subscription.plan.id,
        nameJson: subscription.plan.nameJson,
        feature: subscription.plan.feature,
        monthlyLimit: subscription.plan.monthlyLimit,
        priceMonthly: subscription.plan.priceMonthly.toNumber(),
      },
      expiresAt: subscription.expiresAt,
      autoRenew: subscription.autoRenew,
      startedAt: subscription.startedAt,
      usage: {
        currentMonth: totalRequests,
        limit: subscription.plan.monthlyLimit,
        percentage: subscription.plan.monthlyLimit > 0
          ? Math.round((totalRequests / subscription.plan.monthlyLimit) * 100)
          : 0,
      },
      recentActivity: monthlyUsage.slice(0, 10).map((u) => ({
        feature: u.feature,
        tokensUsed: u.tokensUsed,
        requestCount: u.requestCount,
        createdAt: u.createdAt,
      })),
    };
  }),

  cancelAutoRenew: technicianProcedure.mutation(async ({ ctx }) => {
    const subscription = await prisma.customerAiSubscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No subscription found',
      });
    }

    const updated = await prisma.customerAiSubscription.update({
      where: { userId: ctx.user.id },
      data: { autoRenew: false },
    });

    return {
      id: updated.id,
      autoRenew: updated.autoRenew,
      message: 'Auto-renewal has been cancelled',
    };
  }),
});

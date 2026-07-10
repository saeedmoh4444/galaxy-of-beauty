import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, technicianProcedure } from '../trpc';
import { prisma } from '@galaxy/db';

export const subscriptionRouter = router({
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

  purchase: technicianProcedure
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
          message: 'You already have an active subscription. Cancel it first or wait for it to expire.',
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
        message: 'Subscription purchased successfully',
      };
    }),

  getMySubscription: technicianProcedure.query(async ({ ctx }) => {
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
        message: 'No subscription found',
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
        percentage:
          subscription.plan.monthlyLimit > 0
            ? Math.round(
                (totalRequests / subscription.plan.monthlyLimit) * 100,
              )
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

  getUsage: technicianProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.customerAiSubscription.findUnique({
      where: { userId: ctx.user.id },
      include: { plan: true },
    });

    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active subscription found',
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usageRecords = await prisma.aiUsage.findMany({
      where: {
        subscriptionId: subscription.id,
        createdAt: { gte: startOfMonth },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRequests = usageRecords.reduce(
      (sum, u) => sum + u.requestCount,
      0,
    );
    const totalTokens = usageRecords.reduce((sum, u) => sum + u.tokensUsed, 0);

    // Group by feature
    const byFeature = new Map<
      string,
      { requests: number; tokens: number }
    >();
    for (const u of usageRecords) {
      const feature = u.feature;
      const existing = byFeature.get(feature) ?? { requests: 0, tokens: 0 };
      existing.requests += u.requestCount;
      existing.tokens += u.tokensUsed;
      byFeature.set(feature, existing);
    }

    return {
      subscriptionId: subscription.id,
      planName: subscription.plan.nameJson,
      period: {
        start: startOfMonth.toISOString(),
        end: now.toISOString(),
      },
      usage: {
        totalRequests,
        totalTokens,
        limit: subscription.plan.monthlyLimit,
        percentage:
          subscription.plan.monthlyLimit > 0
            ? Math.round(
                (totalRequests / subscription.plan.monthlyLimit) * 100,
              )
            : 0,
      },
      byFeature: Array.from(byFeature.entries()).map(([feature, data]) => ({
        feature,
        ...data,
      })),
      recentRequests: usageRecords.slice(0, 20).map((u) => ({
        feature: u.feature,
        tokensUsed: u.tokensUsed,
        requestCount: u.requestCount,
        createdAt: u.createdAt,
      })),
    };
  }),
});

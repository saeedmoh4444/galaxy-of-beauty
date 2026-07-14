import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  router,
  publicProcedure,
  protectedProcedure,
  technicianProcedure,
} from '../trpc';
import { prisma } from '@galaxy/db';

// ── OpenAI API helper ─────────────────────────────────────
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const LAYLA_SYSTEM_PROMPT = `أنتِ "ليلى"، مستشارة تجميل ذكية لمنصة "جالكسي بيوتي" السعودية. تقدمين نصائح عن:

- العناية بالبشرة والشعر والأظافر
- خدمات التجميل المتوفرة (شعر، مساج، مكياج، عناية بالبشرة، حناء، أظافر)
- اختيار الخدمات المناسبة حسب نوع البشرة، المناسبة، والميزانية
- الإجابة باللغة العربية الفصحى المبسطة أو اللهجة السعودية اللطيفة
- أنتِ خبيرة تجميل أنثى، ودودة، محترفة، وتفهمين احتياجات المرأة السعودية
- لا تجيبين على أسئلة خارج نطاق التجميل والعناية الشخصية. اعتذري بلطف.

معلومات عن المنصة:
- جالكسي بيوتي تربط العميلات بفنيات تجميل محترفات في السعودية
- الخدمات: تصفيف شعر، عناية بالبشرة، مكياج، مساج، حناء، أظافر
- الأسعار تبدأ من 50 ريال وتصل إلى 500+ ريال حسب الخدمة
- الحجز يتم عبر التطبيق أو الموقع`;

async function callOpenAI(messages: Array<{ role: string; content: string }>, maxTokens = 600): Promise<string | null> {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) return null;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: LAYLA_SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, unknown>;
    const content = (data['choices'] as Array<Record<string, unknown>>)?.[0]?.['message'] as Record<string, unknown> | undefined;
    return (content?.['content'] as string) || null;
  } catch {
    return null;
  }
}

async function checkAiQuota(userId: number): Promise<{ allowed: boolean; subscription?: Record<string, unknown> }> {
  const sub = await prisma.customerAiSubscription.findUnique({
    where: { userId },
    include: { plan: true, usage: true },
  });

  if (!sub || sub.status !== 'ACTIVE') {
    return { allowed: false };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRequests = sub.usage
    .filter((u) => u.createdAt >= startOfMonth)
    .reduce((sum, u) => sum + u.requestCount, 0);

  if (monthlyRequests >= sub.plan.monthlyLimit) {
    return { allowed: false, subscription: { planName: sub.plan.nameJson, limit: sub.plan.monthlyLimit, used: monthlyRequests } };
  }

  return { allowed: true, subscription: { id: sub.id, planId: sub.planId } };
}

async function trackAiUsage(subscriptionId: number, feature: 'CHATBOT' | 'RECOMMENDATIONS' | 'ONBOARDING_QUIZ', tokens: number): Promise<void> {
  try {
    await prisma.aiUsage.create({
      data: { subscriptionId, feature, tokensUsed: tokens, requestCount: 1 },
    });
  } catch { /* non-critical */ }
}

// ── Helper: create a unique conversation slug ─────────────
function convSlug(): string {
  return `layla_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const aiRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check AI subscription quota
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        const used = (quota.subscription?.['used'] as number) || 0;
        const limit = (quota.subscription?.['limit'] as number) || 0;
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: quota.subscription
            ? `لقد استنفدت الحد الشهري (${used}/${limit}). انتظري التجديد الشهري أو قومي بالترقية.`
            : 'يلزمك اشتراك في باقة الذكاء الاصطناعي لاستخدام لايلى.',
        });
      }

      const convId = input.conversationId || convSlug();

      // Fetch recent conversation context (last 10 messages)
      const history = await prisma.chatMessage.findMany({
        where: { senderId: userId, isAi: false, metadata: { path: ['convId'], equals: convId } } as never,
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Get AI replies for context
      const aiReplies = await prisma.chatMessage.findMany({
        where: { receiverId: userId, isAi: true, metadata: { path: ['convId'], equals: convId } } as never,
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Interleave user + AI messages chronologically
      const allContext: Array<{ role: string; content: string }> = [];
      const allUser = history.reverse();
      const allAi = aiReplies.reverse();
      const maxLen = Math.max(allUser.length, allAi.length);
      for (let i = 0; i < maxLen; i++) {
        const u = allUser[i];
        const a = allAi[i];
        if (u) allContext.push({ role: 'user', content: u.content });
        if (a) allContext.push({ role: 'assistant', content: a.content });
      }

      // Add current message
      allContext.push({ role: 'user', content: input.message });

      // Call OpenAI
      const aiReply = await callOpenAI(allContext, 600);

      if (!aiReply) {
        // Fallback reply when API is unavailable
        const fallback = 'عذراً، أواجه مشكلة تقنية حالياً. يرجى المحاولة لاحقاً أو التواصل مع خدمة العملاء للمساعدة الفورية. 💜';
        await prisma.chatMessage.create({
          data: {
            senderId: userId,
            content: input.message,
            isAi: false,
            metadata: { convId },
          },
        });
        await prisma.chatMessage.create({
          data: {
            senderId: userId,
            receiverId: userId,
            content: fallback,
            isAi: true,
            metadata: { convId },
          },
        });
        return { reply: fallback, conversationId: convId, fallback: true };
      }

      // Store user message + AI response
      await prisma.chatMessage.create({
        data: {
          senderId: userId,
          content: input.message,
          isAi: false,
          metadata: { convId },
        },
      });
      await prisma.chatMessage.create({
        data: {
          senderId: userId,
          receiverId: userId,
          content: aiReply,
          isAi: true,
          metadata: { convId },
        },
      });

      // Track usage
      const estimatedTokens = Math.ceil((input.message.length + aiReply.length) / 3);
      if (quota.subscription?.['id']) {
        await trackAiUsage(quota.subscription['id'] as number, 'CHATBOT', estimatedTokens);
      }

      return { reply: aiReply, conversationId: convId };
    }),

  getRecommendations: protectedProcedure
    .input(
      z
        .object({ limit: z.number().optional().default(5) })
        .optional()
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const limit = input.limit;

      // 1. Get user's booking history for category preferences
      const recentBookings = await prisma.booking.findMany({
        where: { customerId: userId, status: { in: ['COMPLETED', 'PAID'] } },
        include: { service: { select: { id: true, categoryId: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const bookedServiceIds = new Set(recentBookings.map((b) => b.serviceId));
      const categoryFreq: Record<number, number> = {};
      for (const b of recentBookings) {
        categoryFreq[b.service.categoryId] = (categoryFreq[b.service.categoryId] || 0) + 1;
      }
      const preferredCatIds = Object.entries(categoryFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => Number(id));

      // 2. Get wishlist for signals
      const wishlist = await prisma.wishlistItem.findMany({
        where: { userId },
        include: { service: { select: { id: true, categoryId: true, titleJson: true, basePrice: true } } },
        take: 10,
      });
      const wishedServiceIds = new Set(wishlist.filter((w) => w.service).map((w) => w.service!.id));
      const wishedCatIds = [...new Set(wishlist.filter((w) => w.service).map((w) => w.service!.categoryId))];

      // 3. Get skin analysis profile
      const lastAnalysis = await prisma.skinAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // 4. Build scoring function
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: { category: { select: { id: true, nameJson: true, slug: true } } },
      });

      const scored = services.map((s) => {
        let score = 0;

        // Prefer categories the user has booked before
        if (preferredCatIds.includes(s.categoryId)) score += 30;

        // Boost wishlist categories
        if (wishedCatIds.includes(s.categoryId)) score += 20;

        // Penalize already-booked services
        if (bookedServiceIds.has(s.id)) score -= 15;

        // Boost wishlisted services
        if (wishedServiceIds.has(s.id)) score += 25;

        // Skin-type-aware boosting
        if (lastAnalysis?.skinType && s.titleJson) {
          const titleAr = (s.titleJson as Record<string, string>)?.ar || '';
          const titleEn = (s.titleJson as Record<string, string>)?.en || '';
          const skinType = lastAnalysis.skinType?.toLowerCase() || '';

          if (skinType === 'dry' && (titleAr.includes('ترطيب') || titleEn.toLowerCase().includes('moistur'))) score += 15;
          if (skinType === 'oily' && (titleAr.includes('تنظيف') || titleEn.toLowerCase().includes('deep clean'))) score += 15;
          if (skinType === 'sensitive' && (titleAr.includes('لطيف') || titleEn.toLowerCase().includes('gentle'))) score += 15;
        }

        // Small randomness for diversity
        score += Math.random() * 10;

        return { service: s, score };
      });

      // Sort by score desc and take top N
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, Math.min(limit, scored.length));

      return {
        recommendations: top.map(({ service: s, score }) => ({
          id: s.id,
          titleJson: s.titleJson,
          descriptionJson: s.descriptionJson,
          basePrice: s.basePrice.toNumber(),
          durationMin: s.durationMin,
          imageUrl: s.imageUrl,
          category: s.category,
          relevanceScore: Math.round(score),
        })),
        context: {
          preferredCategories: preferredCatIds.length,
          wishlistItems: wishedServiceIds.size,
          skinProfile: lastAnalysis ? { skinType: lastAnalysis.skinType, concerns: lastAnalysis.concerns } : null,
        },
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

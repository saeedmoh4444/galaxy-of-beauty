/**
 * AI router tests — Beauty Galaxy chatbot (mocked OpenAI fetch, incl. the
 * fallback path), recommendations, onboarding quiz, feedback, plans, and
 * AI subscriptions. Uses factory users for AI state and cleans up after
 * itself. (Coverage ratchet target: src/routers/ai.ts — was 12.5%)
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import { OPENAI_API_URL, OPENAI_MODEL } from '@galaxy/shared';
import type { JwtPayload } from '../lib/jwt';

const FALLBACK_REPLY =
  'عذراً، أواجه مشكلة تقنية حالياً. يرجى المحاولة لاحقاً أو التواصل مع خدمة العملاء للمساعدة الفورية. ';

let customer: JwtPayload;
let chatUser: JwtPayload; // ACTIVE subscription created in beforeAll
let noSubUser: JwtPayload; // never subscribes
let quotaUser: JwtPayload; // subscribes to a 0-limit plan in its own test
let techUser: JwtPayload; // technician who subscribes + cancels auto-renew
let techNoSubUser: JwtPayload; // technician who never subscribes

let chatSubscriptionId = 0;
const createdPlanIds: number[] = [];
const createdSubscriptionIds: number[] = [];
const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function createPlan(monthlyLimit: number, price: number, feature = 'CHATBOT') {
  const plan = await prisma.aiSubscriptionPlan.create({
    data: {
      nameJson: { ar: 'باقة اختبار', en: 'Test Plan' },
      feature: feature as 'CHATBOT',
      monthlyLimit,
      priceMonthly: price,
      isActive: true,
    },
  });
  createdPlanIds.push(plan.id);
  return plan;
}

async function createSubscription(userId: number, planId: number, autoRenew = true) {
  const sub = await prisma.customerAiSubscription.create({
    data: {
      userId,
      planId,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      autoRenew,
    },
  });
  createdSubscriptionIds.push(sub.id);
  return sub;
}

describe('ai router', () => {
  beforeAll(async () => {
    const seededCustomer = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: seededCustomer.id, role: 'CUSTOMER', email: seededCustomer.email };

    const created = [];
    for (const role of ['CUSTOMER', 'CUSTOMER', 'CUSTOMER', 'TECHNICIAN', 'TECHNICIAN']) {
      const u = await prisma.user.create({
        data: buildUser({ role: role as 'CUSTOMER' }),
      });
      createdUserIds.push(u.id);
      created.push(u);
    }
    const [cu, nu, qu, tu, tnu] = created;
    chatUser = { id: cu.id, role: 'CUSTOMER', email: cu.email };
    noSubUser = { id: nu.id, role: 'CUSTOMER', email: nu.email };
    quotaUser = { id: qu.id, role: 'CUSTOMER', email: qu.email };
    techUser = { id: tu.id, role: 'TECHNICIAN', email: tu.email };
    techNoSubUser = { id: tnu.id, role: 'TECHNICIAN', email: tnu.email };

    const plan = await createPlan(500, 49);
    const sub = await createSubscription(chatUser.id, plan.id);
    chatSubscriptionId = sub.id;
  });

  afterEach(() => {
    delete process.env['OPENAI_API_KEY'];
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    delete process.env['OPENAI_API_KEY'];
    if (createdUserIds.length > 0) {
      await prisma.chatMessage.deleteMany({ where: { senderId: { in: createdUserIds } } });
      await prisma.customerQuizResponse.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.recommendationFeedback.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.aiUsage.deleteMany({
        where: { subscriptionId: { in: createdSubscriptionIds } },
      });
      await prisma.customerAiSubscription.deleteMany({
        where: { id: { in: createdSubscriptionIds } },
      });
      await prisma.aiSubscriptionPlan.deleteMany({ where: { id: { in: createdPlanIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
  });

  describe('chat', () => {
    it('replies via mocked OpenAI, persists the conversation, and tracks usage', async () => {
      process.env['OPENAI_API_KEY'] = 'test-key';
      const reply = 'أهلاً بك في مجرة الجمال';
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: { content: reply } }] }), {
          status: 200,
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const c = await caller(chatUser);
      const convId = `ai-test-conv-${Date.now()}`;
      const res = await c.ai.chat({
        message: 'مرحباً، ما هي أفضل خدمة للبشرة الجافة؟',
        conversationId: convId,
      });

      expect(res.reply).toBe(reply);
      expect(res.conversationId).toBe(convId);
      expect(res.fallback).toBeUndefined();

      // Request shape: POST to OpenAI with Bearer auth, model, and message
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(OPENAI_API_URL);
      expect(init.method).toBe('POST');
      expect(String(init.headers?.['Authorization'])).toBe('Bearer test-key');
      const body = JSON.parse(String(init.body)) as {
        model: string;
        messages: Array<{ role: string; content: string }>;
      };
      expect(body.model).toBe(OPENAI_MODEL);
      expect(body.messages[0].role).toBe('system');
      expect(
        body.messages.some(
          (m) => m.role === 'user' && m.content === 'مرحباً، ما هي أفضل خدمة للبشرة الجافة؟',
        ),
      ).toBe(true);

      // User + AI messages persisted with the conversation id
      const msgs = await prisma.chatMessage.findMany({
        where: {
          senderId: chatUser.id,
          metadata: { path: ['convId'], equals: convId },
        } as never,
        orderBy: { id: 'asc' },
      });
      expect(msgs).toHaveLength(2);
      expect(msgs[0].isAi).toBe(false);
      expect(msgs[0].content).toBe('مرحباً، ما هي أفضل خدمة للبشرة الجافة؟');
      expect(msgs[1].isAi).toBe(true);
      expect(msgs[1].content).toBe(reply);
      expect(msgs[1].receiverId).toBe(chatUser.id);

      // Usage tracked against the subscription
      const usage = await prisma.aiUsage.findMany({
        where: { subscriptionId: chatSubscriptionId },
        orderBy: { id: 'desc' },
        take: 1,
      });
      expect(usage).toHaveLength(1);
      expect(usage[0].feature).toBe('CHATBOT');
      expect(usage[0].requestCount).toBe(1);
      expect(usage[0].tokensUsed).toBeGreaterThan(0);
    }, 15000);

    it('includes prior conversation context in follow-up calls', async () => {
      process.env['OPENAI_API_KEY'] = 'test-key';
      const fetchMock = vi.fn();
      fetchMock
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ choices: [{ message: { content: 'جواب أول' } }] }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ choices: [{ message: { content: 'جواب ثانٍ' } }] }), {
            status: 200,
          }),
        );
      vi.stubGlobal('fetch', fetchMock);

      const c = await caller(chatUser);
      const convId = `ai-test-conv2-${Date.now()}`;
      const first = await c.ai.chat({ message: 'سؤال أول', conversationId: convId });
      const second = await c.ai.chat({ message: 'سؤال ثانٍ', conversationId: convId });

      expect(first.reply).toBe('جواب أول');
      expect(second.reply).toBe('جواب ثانٍ');
      expect(second.conversationId).toBe(convId);

      const body = JSON.parse(String(fetchMock.mock.calls[1][1]?.body)) as {
        messages: Array<{ role: string; content: string }>;
      };
      expect(body.messages.some((m) => m.role === 'user' && m.content === 'سؤال أول')).toBe(true);
      expect(body.messages.some((m) => m.role === 'assistant' && m.content === 'جواب أول')).toBe(
        true,
      );
      expect(body.messages[body.messages.length - 1]).toEqual({
        role: 'user',
        content: 'سؤال ثانٍ',
      });

      const msgs = await prisma.chatMessage.findMany({
        where: {
          senderId: chatUser.id,
          metadata: { path: ['convId'], equals: convId },
        } as never,
      });
      expect(msgs).toHaveLength(4);
    }, 15000);

    it('falls back when OpenAI returns a non-ok response', async () => {
      process.env['OPENAI_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));

      const c = await caller(chatUser);
      const usageBefore = await prisma.aiUsage.count({
        where: { subscriptionId: chatSubscriptionId },
      });
      const res = await c.ai.chat({ message: 'اختبار فشل الخادم' });
      const usageAfter = await prisma.aiUsage.count({
        where: { subscriptionId: chatSubscriptionId },
      });

      expect(res.fallback).toBe(true);
      expect(res.reply).toBe(FALLBACK_REPLY);
      expect(typeof res.conversationId).toBe('string');
      // Fallback does not consume quota
      expect(usageAfter).toBe(usageBefore);

      const msgs = await prisma.chatMessage.findMany({
        where: {
          senderId: chatUser.id,
          metadata: { path: ['convId'], equals: res.conversationId },
        } as never,
      });
      expect(msgs).toHaveLength(2);
      expect(msgs.some((m) => m.isAi && m.content === FALLBACK_REPLY)).toBe(true);
    }, 15000);

    it('falls back when the OpenAI fetch throws', async () => {
      process.env['OPENAI_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const c = await caller(chatUser);
      const res = await c.ai.chat({ message: 'اختبار انقطاع الشبكة' });

      expect(res.fallback).toBe(true);
      expect(res.reply).toBe(FALLBACK_REPLY);
      expect(typeof res.conversationId).toBe('string');
    }, 15000);

    it('falls back without calling OpenAI when the API key is missing', async () => {
      delete process.env['OPENAI_API_KEY'];
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const c = await caller(chatUser);
      const res = await c.ai.chat({ message: 'بدون مفتاح' });

      expect(res.fallback).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
    }, 15000);

    it('rejects chat without an active subscription', async () => {
      const c = await caller(noSubUser);
      await expect(c.ai.chat({ message: 'مرحباً' })).rejects.toThrow(/يلزمك اشتراك/);
    }, 15000);

    it('allows chat on a zero-limit plan (unlimited)', async () => {
      // FIXED 2026-08-19: `0 >= 0` made zero-limit plans permanently
      // exhausted; monthlyLimit <= 0 now means unlimited.
      await prisma.customerAiSubscription.deleteMany({ where: { userId: quotaUser.id } });
      const plan = await createPlan(0, 5);
      await createSubscription(quotaUser.id, plan.id);

      process.env['OPENAI_API_KEY'] = 'test-key';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ choices: [{ message: { content: 'رد' } }] }), {
            status: 200,
          }),
        ),
      );

      const c = await caller(quotaUser);
      const res = await c.ai.chat({ message: 'مرحباً' });
      expect(res.fallback).toBeFalsy();
      expect(res.reply).toBe('رد');
    }, 15000);

    it('rejects chat when the monthly quota is exhausted', async () => {
      await prisma.customerAiSubscription.deleteMany({ where: { userId: quotaUser.id } });
      const plan = await createPlan(2, 5);
      const sub = await createSubscription(quotaUser.id, plan.id);
      // Two CHATBOT usage rows this month already consume the limit of 2
      await prisma.aiUsage.createMany({
        data: [
          { subscriptionId: sub.id, feature: 'CHATBOT', requestCount: 1 },
          { subscriptionId: sub.id, feature: 'CHATBOT', requestCount: 1 },
        ],
      });

      const c = await caller(quotaUser);
      await expect(c.ai.chat({ message: 'مرحباً' })).rejects.toThrow(/لقد استنفدت الحد الشهري/);
    }, 15000);

    it('does not count other features against the chat quota', async () => {
      await prisma.customerAiSubscription.deleteMany({ where: { userId: quotaUser.id } });
      const plan = await createPlan(1, 5);
      const sub = await createSubscription(quotaUser.id, plan.id);
      // A RECOMMENDATIONS usage row must not consume the CHATBOT quota
      await prisma.aiUsage.create({
        data: { subscriptionId: sub.id, feature: 'RECOMMENDATIONS', requestCount: 1 },
      });

      process.env['OPENAI_API_KEY'] = 'test-key';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ choices: [{ message: { content: 'رد' } }] }), {
            status: 200,
          }),
        ),
      );

      const c = await caller(quotaUser);
      const res = await c.ai.chat({ message: 'مرحباً' });
      expect(res.fallback).toBeFalsy();
    }, 15000);

    it('rejects chat when the plan covers a different feature', async () => {
      await prisma.customerAiSubscription.deleteMany({ where: { userId: quotaUser.id } });
      const plan = await createPlan(500, 79, 'RECOMMENDATIONS');
      await createSubscription(quotaUser.id, plan.id);

      const c = await caller(quotaUser);
      await expect(c.ai.chat({ message: 'مرحباً' })).rejects.toThrow(/باقتك لا تشمل هذه الميزة/);
    }, 15000);

    it('validates chat input', async () => {
      const c = await caller(noSubUser);
      await expect(c.ai.chat({ message: '' })).rejects.toThrow();
      await expect(c.ai.chat({ message: 'x'.repeat(2001) })).rejects.toThrow();
    }, 15000);

    it('rejects anonymous chat', async () => {
      const c = await caller(null);
      await expect(c.ai.chat({ message: 'مرحباً' })).rejects.toThrow();
    }, 15000);
  });

  describe('getRecommendations', () => {
    it('returns scored recommendations capped at the default limit', async () => {
      const c = await caller(chatUser);
      const res = await c.ai.getRecommendations();

      expect(Array.isArray(res.recommendations)).toBe(true);
      expect(res.recommendations.length).toBeLessThanOrEqual(5);
      for (const r of res.recommendations) {
        expect(typeof r.id).toBe('number');
        expect(r.titleJson).toBeDefined();
        expect(typeof r.basePrice).toBe('number');
        expect(typeof r.durationMin).toBe('number');
        expect(typeof r.relevanceScore).toBe('number');
        expect(r.category).toBeDefined();
      }
      expect(res.context).toMatchObject({
        preferredCategories: expect.any(Number),
        wishlistItems: expect.any(Number),
      });
      // Factory user has never run a skin analysis
      expect(res.context.skinProfile).toBeNull();
    }, 15000);

    it('respects an explicit limit', async () => {
      const c = await caller(chatUser);
      const res = await c.ai.getRecommendations({ limit: 2 });
      expect(res.recommendations.length).toBeLessThanOrEqual(2);
    }, 15000);

    it('validates the limit type and rejects anonymous callers', async () => {
      const c = await caller(chatUser);
      await expect(c.ai.getRecommendations({ limit: '3' as any })).rejects.toThrow();
      const anon = await caller(null);
      await expect(anon.ai.getRecommendations()).rejects.toThrow();
    }, 15000);
  });

  describe('onboarding quiz', () => {
    it('creates then updates quiz responses', async () => {
      const c = await caller(chatUser);
      const first = await c.ai.submitQuiz({ responses: { skin_type: 'oily', budget: 300 } });
      expect(first.updated).toBe(false);
      expect(typeof first.id).toBe('number');

      const second = await c.ai.submitQuiz({ responses: { skin_type: 'dry', budget: 500 } });
      expect(second.updated).toBe(true);
      expect(second.id).toBe(first.id);

      const quiz = await c.ai.getQuiz();
      expect(quiz.id).toBe(first.id);
      expect(quiz.responses).toMatchObject({ skin_type: 'dry', budget: 500 });
      expect(quiz.createdAt).toBeDefined();
      expect(quiz.updatedAt).toBeDefined();
    }, 15000);

    it('returns NOT_FOUND before any quiz is submitted', async () => {
      const c = await caller(noSubUser);
      await expect(c.ai.getQuiz()).rejects.toThrow(/No quiz responses found/);
    }, 15000);

    it('validates quiz input and rejects anonymous callers', async () => {
      const c = await caller(noSubUser);
      await expect(c.ai.submitQuiz({ responses: 'not-an-object' as any })).rejects.toThrow();
      const anon = await caller(null);
      await expect(anon.ai.submitQuiz({ responses: { a: 1 } })).rejects.toThrow();
      await expect(anon.ai.getQuiz()).rejects.toThrow();
    }, 15000);
  });

  describe('feedback', () => {
    it('records thumbs_up and thumbs_down feedback', async () => {
      const c = await caller(chatUser);
      const up = await c.ai.feedback({ itemType: 'service', itemId: 7, feedback: 'thumbs_up' });
      expect(up.feedback).toBe('thumbs_up');
      const down = await c.ai.feedback({
        itemType: 'technician',
        itemId: 9,
        feedback: 'thumbs_down',
      });
      expect(down.feedback).toBe('thumbs_down');

      const rows = await prisma.recommendationFeedback.findMany({
        where: { userId: chatUser.id },
      });
      expect(rows).toHaveLength(2);
    }, 15000);

    it('validates feedback enums and ids', async () => {
      const c = await caller(chatUser);
      await expect(
        c.ai.feedback({ itemType: 'gadget', itemId: 1, feedback: 'thumbs_up' }),
      ).rejects.toThrow();
      await expect(
        c.ai.feedback({ itemType: 'service', itemId: 1, feedback: 'neutral' }),
      ).rejects.toThrow();
      await expect(
        c.ai.feedback({ itemType: 'service', itemId: '1' as any, feedback: 'thumbs_up' }),
      ).rejects.toThrow();
    }, 15000);

    it('rejects anonymous feedback', async () => {
      const c = await caller(null);
      await expect(
        c.ai.feedback({ itemType: 'service', itemId: 1, feedback: 'thumbs_up' }),
      ).rejects.toThrow();
    }, 15000);
  });

  describe('getPlans', () => {
    it('lists active plans sorted by monthly price ascending', async () => {
      const c = await caller(null);
      const plans = await c.ai.getPlans();

      expect(plans.length).toBeGreaterThanOrEqual(3); // seed ships 3 plans
      const prices = plans.map((p) => p.priceMonthly);
      expect([...prices].sort((a, b) => a - b)).toEqual(prices);
      for (const p of plans) {
        expect(typeof p.id).toBe('number');
        expect(p.nameJson).toBeDefined();
        expect(typeof p.monthlyLimit).toBe('number');
        expect(typeof p.priceMonthly).toBe('number');
      }
    }, 15000);
  });

  describe('subscriptions', () => {
    it('subscribes a technician, rejects duplicates, and cancels auto-renew', async () => {
      const plan = await createPlan(50, 20);
      const c = await caller(techUser);

      const sub = await c.ai.subscribeToPlan({ planId: plan.id, autoRenew: true });
      createdSubscriptionIds.push(sub.id);
      expect(sub.status).toBe('ACTIVE');
      expect(sub.planId).toBe(plan.id);
      expect(sub.autoRenew).toBe(true);
      expect(sub.expiresAt).toBeDefined();

      await expect(c.ai.subscribeToPlan({ planId: plan.id })).rejects.toThrow(
        /already have an active subscription/,
      );

      const mySub = await c.ai.getMySubscription();
      expect(mySub.id).toBe(sub.id);
      expect(mySub.status).toBe('ACTIVE');
      expect(mySub.plan.id).toBe(plan.id);
      expect(mySub.usage.limit).toBe(50);
      expect(mySub.usage.currentMonth).toBe(0);
      expect(mySub.usage.percentage).toBe(0);
      expect(Array.isArray(mySub.recentActivity)).toBe(true);
      expect(mySub.startedAt).toBeDefined();

      const cancelled = await c.ai.cancelAutoRenew();
      expect(cancelled.id).toBe(sub.id);
      expect(cancelled.autoRenew).toBe(false);
    }, 15000);

    it('rejects inactive or missing plans', async () => {
      const inactive = await prisma.aiSubscriptionPlan.create({
        data: {
          nameJson: { ar: 'باقة معطلة', en: 'Inactive Plan' },
          feature: 'CHATBOT',
          monthlyLimit: 10,
          priceMonthly: 1,
          isActive: false,
        },
      });
      createdPlanIds.push(inactive.id);

      const c = await caller(techNoSubUser);
      await expect(c.ai.subscribeToPlan({ planId: inactive.id })).rejects.toThrow(
        /not found or inactive/,
      );
      await expect(c.ai.subscribeToPlan({ planId: 99999999 })).rejects.toThrow(
        /not found or inactive/,
      );
    }, 15000);

    it('returns NOT_FOUND for getMySubscription without a subscription', async () => {
      const c = await caller(noSubUser);
      await expect(c.ai.getMySubscription()).rejects.toThrow(/No active subscription found/);
    }, 15000);

    it('returns NOT_FOUND for cancelAutoRenew without a subscription', async () => {
      const c = await caller(techNoSubUser);
      await expect(c.ai.cancelAutoRenew()).rejects.toThrow(/No subscription found/);
    }, 15000);

    it('rejects subscription actions for non-technicians', async () => {
      const c = await caller(customer);
      await expect(c.ai.subscribeToPlan({ planId: 1 })).rejects.toThrow();
      await expect(c.ai.cancelAutoRenew()).rejects.toThrow();
      const anon = await caller(null);
      await expect(anon.ai.subscribeToPlan({ planId: 1 })).rejects.toThrow();
      await expect(anon.ai.cancelAutoRenew()).rejects.toThrow();
    }, 15000);

    it('validates subscribeToPlan input', async () => {
      const c = await caller(techNoSubUser);
      await expect(c.ai.subscribeToPlan({ planId: 'x' as any })).rejects.toThrow();
    }, 15000);
  });
});

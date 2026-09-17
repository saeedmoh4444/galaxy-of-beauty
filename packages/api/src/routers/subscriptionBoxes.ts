import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const subscriptionBoxRouter = router({
  plans: publicProcedure.query(() =>
    prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
  ),

  subscribe: customerProcedure
    .input(
      z.object({
        planId: z.number().int().positive(),
        // 2.2 — auto-renewal (defaults on; the renewal job rolls periods).
        autoRenew: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } });
      if (!plan?.isActive) throw new TRPCError({ code: 'NOT_FOUND' });

      const existing = await prisma.customerSubscription.findUnique({
        where: { userId_planId: { userId: ctx.user.id, planId: input.planId } },
      });
      if (existing?.status === 'ACTIVE')
        throw new TRPCError({ code: 'CONFLICT', message: 'Already subscribed' });

      const now = new Date();
      const end = new Date(now);
      // 2.2 — YEARLY plans run 12 months (annual = 2 months free is baked
      // into the seeded price: 10 × monthly).
      if (plan.interval === 'YEARLY') end.setFullYear(end.getFullYear() + 1);
      else end.setMonth(end.getMonth() + 1);
      return prisma.customerSubscription.create({
        data: {
          userId: ctx.user.id,
          planId: input.planId,
          currentPeriodStart: now,
          currentPeriodEnd: end,
          autoRenew: input.autoRenew ?? true,
        },
        include: { plan: true },
      });
    }),

  mySubscriptions: customerProcedure.query(({ ctx }) =>
    prisma.customerSubscription.findMany({
      where: { userId: ctx.user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
  ),

  pause: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!sub || sub.status !== 'ACTIVE') throw new TRPCError({ code: 'BAD_REQUEST' });
      return prisma.customerSubscription.update({
        where: { id: input.id },
        data: { status: 'PAUSED' },
      });
    }),

  resume: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!sub || sub.status !== 'PAUSED') throw new TRPCError({ code: 'BAD_REQUEST' });
      return prisma.customerSubscription.update({
        where: { id: input.id },
        data: { status: 'ACTIVE' },
      });
    }),

  cancel: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!sub) throw new TRPCError({ code: 'NOT_FOUND' });
      return prisma.customerSubscription.update({
        where: { id: input.id },
        data: { status: 'CANCELLED', cancelledAt: new Date(), autoRenew: false },
      });
    }),

  /** setAutoRenew — 2.2: toggle renewal for an owned subscription. */
  setAutoRenew: customerProcedure
    .input(z.object({ id: z.number().int().positive(), autoRenew: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!sub) throw new TRPCError({ code: 'NOT_FOUND' });
      return prisma.customerSubscription.update({
        where: { id: input.id },
        data: { autoRenew: input.autoRenew },
      });
    }),

  createPlan: adminProcedure
    .input(
      z.object({
        nameAr: z.string(),
        nameEn: z.string(),
        descriptionAr: z.string(),
        descriptionEn: z.string(),
        interval: z.enum(['MONTHLY', 'BIWEEKLY', 'WEEKLY', 'YEARLY']).default('MONTHLY'),
        price: z.number().positive(),
        servicesPerMonth: z.number().int().default(1),
        discountPercent: z.number().int().default(0),
        // 2.2 — VIP perks.
        priorityBooking: z.boolean().optional(),
        freeHomeService: z.boolean().optional(),
        dedicatedTechnician: z.boolean().optional(),
        // E3 — optional gym scope (membership plan for one gym).
        gymId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.gymId) {
        const gym = await prisma.vendor.findUnique({ where: { id: input.gymId } });
        if (!gym || gym.type !== 'GYM') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Plan gym must be a GYM vendor' });
        }
      }
      return prisma.subscriptionPlan.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: { ar: input.descriptionAr, en: input.descriptionEn },
          interval: input.interval,
          price: input.price,
          servicesPerMonth: input.servicesPerMonth,
          discountPercent: input.discountPercent,
          priorityBooking: input.priorityBooking ?? false,
          freeHomeService: input.freeHomeService ?? false,
          dedicatedTechnician: input.dedicatedTechnician ?? false,
          gymId: input.gymId,
        },
      });
    }),

  adminList: adminProcedure.query(() =>
    prisma.customerSubscription.findMany({
      include: { user: { select: { name: true, email: true } }, plan: true },
      orderBy: { createdAt: 'desc' },
    }),
  ),
});

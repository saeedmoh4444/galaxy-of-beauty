import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const subscriptionBoxRouter = router({
  plans: publicProcedure.query(() =>
    prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })
  ),

  subscribe: customerProcedure
    .input(z.object({ planId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } });
      if (!plan?.isActive) throw new TRPCError({ code: 'NOT_FOUND' });

      const existing = await prisma.customerSubscription.findUnique({
        where: { userId_planId: { userId: ctx.user.id, planId: input.planId } },
      });
      if (existing?.status === 'ACTIVE') throw new TRPCError({ code: 'CONFLICT', message: 'Already subscribed' });

      const now = new Date();
      const end = new Date(now); end.setMonth(end.getMonth() + 1);
      return prisma.customerSubscription.create({
        data: { userId: ctx.user.id, planId: input.planId, currentPeriodStart: now, currentPeriodEnd: end },
        include: { plan: true },
      });
    }),

  mySubscriptions: customerProcedure.query(({ ctx }) =>
    prisma.customerSubscription.findMany({ where: { userId: ctx.user.id }, include: { plan: true }, orderBy: { createdAt: 'desc' } })
  ),

  pause: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({ where: { id: input.id, userId: ctx.user.id } });
      if (!sub || sub.status !== 'ACTIVE') throw new TRPCError({ code: 'BAD_REQUEST' });
      return prisma.customerSubscription.update({ where: { id: input.id }, data: { status: 'PAUSED' } });
    }),

  resume: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({ where: { id: input.id, userId: ctx.user.id } });
      if (!sub || sub.status !== 'PAUSED') throw new TRPCError({ code: 'BAD_REQUEST' });
      return prisma.customerSubscription.update({ where: { id: input.id }, data: { status: 'ACTIVE' } });
    }),

  cancel: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.customerSubscription.findFirst({ where: { id: input.id, userId: ctx.user.id } });
      if (!sub) throw new TRPCError({ code: 'NOT_FOUND' });
      return prisma.customerSubscription.update({ where: { id: input.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    }),

  createPlan: adminProcedure
    .input(z.object({
      nameAr: z.string(), nameEn: z.string(), descriptionAr: z.string(), descriptionEn: z.string(),
      interval: z.enum(['MONTHLY','BIWEEKLY','WEEKLY']).default('MONTHLY'),
      price: z.number().positive(), servicesPerMonth: z.number().int().default(1), discountPercent: z.number().int().default(0),
    }))
    .mutation(async ({ input }) => prisma.subscriptionPlan.create({
      data: {
        nameJson: { ar: input.nameAr, en: input.nameEn },
        descriptionJson: { ar: input.descriptionAr, en: input.descriptionEn },
        interval: input.interval, price: input.price, servicesPerMonth: input.servicesPerMonth, discountPercent: input.discountPercent,
      },
    })),

  adminList: adminProcedure.query(() =>
    prisma.customerSubscription.findMany({ include: { user: { select: { name: true, email: true } }, plan: true }, orderBy: { createdAt: 'desc' } })
  ),
});

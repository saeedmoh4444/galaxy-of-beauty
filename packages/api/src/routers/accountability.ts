import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const accountabilityRouter = router({
  myPartners: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      return prisma.accountabilityPartner.findMany({ where: { userId: ctx.user.id }, take: input.limit, orderBy: { createdAt: 'desc' } });
    }),

  findPartner: customerProcedure
    .input(z.object({ goal: z.string().min(3).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const match = await prisma.accountabilityPartner.findFirst({ where: { goal: { contains: input.goal }, userId: { not: ctx.user.id } } });
      if (!match) {
        return prisma.accountabilityPartner.create({ data: { userId: ctx.user.id, goal: input.goal, status: 'SEEKING' } });
      }
      await prisma.accountabilityPartner.create({ data: { userId: ctx.user.id, goal: input.goal, partnerUserId: match.userId, status: 'MATCHED' } });
      return { matched: true, partnerId: match.userId };
    }),

  checkIn: customerProcedure
    .input(z.object({ partnerId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const partner = await prisma.accountabilityPartner.findFirst({ where: { id: input.partnerId, userId: ctx.user.id } });
      if (!partner) throw notFound('Accountability partner');
      await prisma.accountabilityPartner.update({ where: { id: partner.id }, data: { streak: { increment: 1 }, lastCheckIn: new Date() } });
      return { success: true, streak: (partner.streak ?? 0) + 1 };
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const [total, active] = await Promise.all([
      prisma.accountabilityPartner.count({ where: { userId: ctx.user.id } }),
      prisma.accountabilityPartner.count({ where: { userId: ctx.user.id, status: 'MATCHED' } }),
    ]);
    const best = await prisma.accountabilityPartner.findFirst({ where: { userId: ctx.user.id }, orderBy: { streak: 'desc' }, select: { streak: true } });
    return { total, active, bestStreak: best?.streak ?? 0 };
  }),
});

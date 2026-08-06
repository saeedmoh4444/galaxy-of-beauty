import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';
import { notFound, forbidden } from '../lib/errors';

export const beautyCirclesRouter = router({
  list: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(10), topic: z.string().optional() }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input.topic) where.topic = input.topic;
      const [items, total] = await Promise.all([
        prisma.beautyCircle.findMany({ where, orderBy: { members: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit, include: { _count: { select: { members: true } } } }),
        prisma.beautyCircle.count({ where }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getById: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const circle = await prisma.beautyCircle.findUnique({ where: { id: input.id }, include: { members: { select: { user: { select: { id: true, name: true, avatarUrl: true } } } } } });
      if (!circle) throw notFound('Beauty circle', input.id);
      return circle;
    }),

  create: customerProcedure
    .input(z.object({ name: z.string().min(3).max(100), topic: z.string().min(1), city: z.string().optional(), cover: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyCircle.create({ data: { name: input.name, topic: input.topic, city: input.city ?? null, cover: input.cover ?? '🌸', creatorId: ctx.user.id } });
    }),

  join: customerProcedure
    .input(z.object({ circleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const circle = await prisma.beautyCircle.findUnique({ where: { id: input.circleId } });
      if (!circle) throw notFound('Beauty circle', input.circleId);
      const existing = await prisma.beautyCircleMember.findUnique({ where: { circleId_userId: { circleId: input.circleId, userId: ctx.user.id } } });
      if (!existing) {
        await prisma.beautyCircleMember.create({ data: { circleId: input.circleId, userId: ctx.user.id } });
        await prisma.beautyCircle.update({ where: { id: input.circleId }, data: { members: { increment: 1 } } });
      }
      return { success: true };
    }),

  leave: customerProcedure
    .input(z.object({ circleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.beautyCircleMember.findUnique({ where: { circleId_userId: { circleId: input.circleId, userId: ctx.user.id } } });
      if (!member) throw notFound('Membership');
      await prisma.beautyCircleMember.delete({ where: { id: member.id } });
      await prisma.beautyCircle.update({ where: { id: input.circleId }, data: { members: { decrement: 1 } } });
      return { success: true };
    }),

  myCircles: customerProcedure.query(async ({ ctx }) => {
    return prisma.beautyCircleMember.findMany({ where: { userId: ctx.user.id }, include: { circle: true }, take: 20 });
  }),
});

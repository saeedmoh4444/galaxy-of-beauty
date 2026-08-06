import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const communityEventsRouter = router({
  list: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(10), city: z.string().optional() }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { date: { gte: new Date() } };
      if (input.city) where.city = input.city;
      const [items, total] = await Promise.all([
        prisma.communityEvent.findMany({ where, orderBy: { date: 'asc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
        prisma.communityEvent.count({ where }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  register: customerProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const event = await prisma.communityEvent.findUnique({ where: { id: input.eventId } });
      if (!event) throw notFound('Community event', input.eventId);
      await prisma.communityEventAttendee.create({ data: { eventId: input.eventId, userId: ctx.user.id } });
      return { success: true };
    }),

  myEvents: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.communityEventAttendee.findMany({ where: { userId: ctx.user.id }, include: { event: true }, take: input.limit, orderBy: { createdAt: 'desc' } });
    }),

  create: customerProcedure
    .input(z.object({ title: z.string().min(3).max(200), date: z.string(), city: z.string(), time: z.string().optional(), maxAttendees: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.communityEvent.create({ data: { title: input.title, date: input.date, city: input.city, time: input.time ?? null, maxAttendees: input.maxAttendees ?? null, hostId: ctx.user.id } });
    }),
});

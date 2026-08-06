import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const STAGES = ['discovery', 'first_booking', 'regular', 'loyal', 'advocate'] as const;

export const customerJourneyRouter = router({
  myStage: customerProcedure.query(async ({ ctx }) => {
    const bookings = await prisma.booking.count({ where: { customerId: ctx.user.id } });
    const stage = bookings === 0 ? 'discovery' : bookings === 1 ? 'first_booking' : bookings < 5 ? 'regular' : bookings < 15 ? 'loyal' : 'advocate';
    return { stage, bookings, nextStage: STAGES[Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1)] };
  }),

  milestones: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => prisma.customerMilestone.findMany({ where: { userId: ctx.user.id }, take: input.limit, orderBy: { achievedAt: 'desc' } })),

  recordMilestone: customerProcedure
    .input(z.object({ type: z.string(), description: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => prisma.customerMilestone.create({ data: { userId: ctx.user.id, type: input.type, description: input.description ?? null } })),
});

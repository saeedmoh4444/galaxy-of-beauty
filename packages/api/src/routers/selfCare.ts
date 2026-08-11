import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const selfCareRouter = router({
  checkin: customerProcedure
    .input(
      z.object({
        mood: z.number().min(1).max(5),
        energy: z.number().min(1).max(5).optional(),
        sleepHours: z.number().optional(),
        waterGlasses: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.selfCareCheckin.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  history: customerProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ ctx, input }) =>
      db.selfCareCheckin.findMany({
        where: {
          userId: ctx.user.id,
          createdAt: { gte: new Date(Date.now() - input.days * 86400000) },
        },
        orderBy: { createdAt: 'desc' },
        take: input.days,
      }),
    ),
  todayMood: customerProcedure.query(async ({ ctx }) =>
    db.selfCareCheckin.findFirst({
      where: { userId: ctx.user.id, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { createdAt: 'desc' },
    }),
  ),
});

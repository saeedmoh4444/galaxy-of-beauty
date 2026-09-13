import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { customerProcedure, router, requireFeatureFlag } from '../trpc';

const db = prisma;

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.BRIDAL_CONCIERGE);

export const bridalConciergeRouter = router({
  get: customerProcedure.use(flag).query(async ({ ctx }) => {
    const c = await db.bridalConcierge.findUnique({
      where: { userId: ctx.user.id },
      include: { services: true },
    });
    return c;
  }),
  upsert: customerProcedure
    .use(flag)
    .input(
      z.object({
        weddingDate: z.string().datetime().optional(),
        venue: z.string().optional(),
        guestCount: z.number().optional(),
        budget: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.bridalConcierge.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, ...input },
        update: input,
      });
    }),
  addService: customerProcedure
    .use(flag)
    .input(
      z.object({
        serviceId: z.number(),
        trialDate: z.string().datetime().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const c = await db.bridalConcierge.findUnique({ where: { userId: ctx.user.id } });
      if (!c) throw new Error('Create a bridal concierge first');
      return db.bridalService.create({ data: { conciergeId: c.id, ...input } });
    }),
  markTrialDone: customerProcedure
    .use(flag)
    .input(z.object({ serviceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.bridalService.updateMany({
        where: { id: input.serviceId, concierge: { userId: ctx.user.id } },
        data: { isTrialDone: true },
      });
    }),
});

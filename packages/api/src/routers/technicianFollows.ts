import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const technicianFollowRouter = router({
  myFollows: customerProcedure.query(async ({ ctx }) => {
    const follows = await db.technicianFollow.findMany({ where: { customerId: ctx.user.id } });
    return follows;
  }),
  follow: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .mutation(async ({ ctx, input }) =>
      db.technicianFollow.create({
        data: { customerId: ctx.user.id, technicianId: input.technicianId },
      }),
    ),
  unfollow: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.technicianFollow.deleteMany({
        where: { customerId: ctx.user.id, technicianId: input.technicianId },
      });
      return { success: true };
    }),
  isFollowing: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ ctx, input }) => {
      const f = await db.technicianFollow.findUnique({
        where: {
          customerId_technicianId: { customerId: ctx.user.id, technicianId: input.technicianId },
        },
      });
      return { following: !!f };
    }),
});

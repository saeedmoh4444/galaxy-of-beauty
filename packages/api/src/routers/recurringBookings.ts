import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const recurringBookingRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    db.recurringBooking.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ),
  create: customerProcedure
    .input(
      z.object({
        serviceId: z.number(),
        technicianId: z.number().optional(),
        addressId: z.number(),
        frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
        nextDate: z.string().datetime(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.recurringBooking.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  pause: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.recurringBooking.updateMany({
      where: { id: input.id, userId: ctx.user.id },
      data: { status: 'PAUSED' },
    });
    return { success: true };
  }),
  cancel: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.recurringBooking.updateMany({
      where: { id: input.id, userId: ctx.user.id },
      data: { status: 'CANCELLED' },
    });
    return { success: true };
  }),
});

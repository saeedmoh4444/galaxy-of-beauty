import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const notificationPrefsRouter = router({
  get: customerProcedure.query(async ({ ctx }) => {
    const prefs = await db.notificationPreference.findUnique({ where: { userId: ctx.user.id } });
    return (
      prefs || {
        bookingReminders: true,
        promotions: true,
        tips: true,
        community: true,
        emailDigest: false,
        smsAlerts: false,
      }
    );
  }),
  update: customerProcedure
    .input(
      z.object({
        bookingReminders: z.boolean().optional(),
        promotions: z.boolean().optional(),
        tips: z.boolean().optional(),
        community: z.boolean().optional(),
        emailDigest: z.boolean().optional(),
        smsAlerts: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.notificationPreference.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, ...input },
        update: input,
      }),
    ),
});

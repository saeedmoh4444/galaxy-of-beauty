import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const waitlists: Array<{
  id: number;
  userId: number;
  technicianId: number;
  technicianName: string;
  preferredDate: string;
  status: string;
  createdAt: string;
}> = [];
let wId = 1;

const POPULAR_TECHS = [
  { id: 1, name: 'نورة العمري', emoji: '💄', waitlistCount: 12, avgWait: '٣-٥ أيام' },
  { id: 2, name: 'سارة الحربي', emoji: '💇‍♀️', waitlistCount: 8, avgWait: '١-٣ أيام' },
  { id: 3, name: 'د. ليلى القحطاني', emoji: '✨', waitlistCount: 15, avgWait: '٥-٧ أيام' },
];

export const techWaitlistRouter = router({
  popular: customerProcedure.query(() => POPULAR_TECHS),
  myWaitlists: customerProcedure.query(async ({ ctx }) =>
    waitlists.filter((w) => w.userId === ctx.user.id),
  ),
  join: customerProcedure
    .input(
      z.object({
        technicianId: z.number(),
        technicianName: z.string(),
        preferredDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const w = {
        id: wId++,
        userId: ctx.user.id,
        technicianId: input.technicianId,
        technicianName: input.technicianName,
        preferredDate: input.preferredDate ?? '',
        status: 'WAITING',
        createdAt: new Date().toISOString(),
      };
      waitlists.push(w);
      return w;
    }),
  leave: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const idx = waitlists.findIndex((w) => w.id === input.id && w.userId === ctx.user.id);
    if (idx >= 0) waitlists.splice(idx, 1);
    return { success: true };
  }),
});

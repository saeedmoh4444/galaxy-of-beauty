import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const currentMonth = () => new Date().toISOString().slice(0, 7);

export const beautyBudgetRouter = router({
  get: customerProcedure.query(async ({ ctx }) => {
    const month = currentMonth();
    const budget = await db.beautyBudget.findUnique({ where: { userId_month: { userId: ctx.user.id, month } } });
    const bookings = await db.booking.findMany({ where: { customerId: ctx.user.id, createdAt: { gte: new Date(`${month}-01`) } } });
    const spent = bookings.reduce((sum: number, b: any) => sum + Number(b.totalAmount || 0), 0);
    return { month, budget: budget ? Number(budget.budget) : 0, spent, remaining: budget ? Number(budget.budget) - spent : 0 };
  }),
  set: customerProcedure
    .input(z.object({ budget: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => db.beautyBudget.upsert({ where: { userId_month: { userId: ctx.user.id, month: currentMonth() } }, create: { userId: ctx.user.id, month: currentMonth(), budget: input.budget }, update: { budget: input.budget } })),
});

import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyBudgetPlannerRouter = router({
  myBudgets: customerProcedure
    .input(z.object({ month: z.string().optional(), year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return prisma.beautyBudgetItem.findMany({ where: { userId: ctx.user.id, ...(input.month ? { month: input.month } : {}), ...(input.year ? { year: input.year } : {}) }, orderBy: { category: 'asc' } });
    }),
  setBudget: customerProcedure
    .input(z.object({ category: z.string(), monthlyLimit: z.number(), month: z.string(), year: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyBudgetItem.upsert({
        where: { id: 0 },
        create: { userId: ctx.user.id, ...input, spent: 0 },
        update: { monthlyLimit: input.monthlyLimit },
      }).catch(() => prisma.beautyBudgetItem.create({ data: { userId: ctx.user.id, ...input, spent: 0 } }));
    }),
  addSpending: customerProcedure
    .input(z.object({ category: z.string(), amount: z.number(), month: z.string(), year: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.beautyBudgetItem.findFirst({ where: { userId: ctx.user.id, category: input.category, month: input.month, year: input.year } });
      if (existing) {
        return prisma.beautyBudgetItem.update({ where: { id: existing.id }, data: { spent: { increment: input.amount } } });
      }
      return prisma.beautyBudgetItem.create({ data: { userId: ctx.user.id, ...input, monthlyLimit: input.amount * 2, spent: input.amount } });
    }),
});

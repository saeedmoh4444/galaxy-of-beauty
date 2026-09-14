import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const savingsGoalRouter = router({
  list: customerProcedure.query(async ({ ctx }) => {
    const goals = await db.savingsGoal.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { bnplPlan: true },
    });
    return goals.map((g: any) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      savedAmount: Number(g.savedAmount),
      bnplPlan: g.bnplPlan
        ? {
            ...g.bnplPlan,
            totalAmount: Number(g.bnplPlan.totalAmount),
            monthlyPayment: Number(g.bnplPlan.monthlyPayment),
          }
        : null,
    }));
  }),
  create: customerProcedure
    .input(
      z.object({
        title: z.string().min(2).max(200),
        targetAmount: z.number().positive(),
        serviceId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      db.savingsGoal.create({ data: { userId: ctx.user.id, ...input } }),
    ),
  addFunds: customerProcedure
    .input(z.object({ goalId: z.number(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const goal = await db.savingsGoal.findUnique({ where: { id: input.goalId } });
      if (!goal || goal.userId !== ctx.user.id) throw new Error('الهدف غير موجود');
      const newAmount = Number(goal.savedAmount) + input.amount;
      const completed = newAmount >= Number(goal.targetAmount);
      return db.savingsGoal.update({
        where: { id: input.goalId },
        data: { savedAmount: newAmount, status: completed ? 'COMPLETED' : 'ACTIVE' },
      });
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await db.savingsGoal.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
  // C3 (Tier 3 #8): attach a persisted BnplPlan to a savings goal
  // ("laser course by wedding day" — goal-funded installments).
  attachBnpl: customerProcedure
    .input(z.object({ goalId: z.number(), bnplPlanId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [goal, plan] = await Promise.all([
        db.savingsGoal.findUnique({ where: { id: input.goalId } }),
        db.bnplPlan.findUnique({ where: { id: input.bnplPlanId } }),
      ]);
      if (!goal || goal.userId !== ctx.user.id) throw new Error('الهدف غير موجود');
      if (!plan || plan.userId !== ctx.user.id) throw new Error('خطة التقسيط غير موجودة');
      return db.savingsGoal.update({
        where: { id: input.goalId },
        data: { bnplPlanId: input.bnplPlanId },
      });
    }),
});

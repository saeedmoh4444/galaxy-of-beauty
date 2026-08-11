import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyHabitsRouter = router({
  myHabits: customerProcedure.query(async ({ ctx }) => {
    return prisma.beautyHabit.findMany({
      where: { userId: ctx.user.id },
      orderBy: { sortOrder: 'asc' },
      take: 20,
    });
  }),

  toggle: customerProcedure
    .input(z.object({ habitId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await prisma.beautyHabit.findFirst({
        where: { id: input.habitId, userId: ctx.user.id },
      });
      if (!habit)
        return prisma.beautyHabit.create({
          data: { userId: ctx.user.id, name: 'عادة جديدة', emoji: '✅', doneToday: true },
        });

      await prisma.beautyHabit.update({
        where: { id: habit.id },
        data: {
          doneToday: !habit.doneToday,
          streak: habit.doneToday ? Math.max(0, habit.streak - 1) : habit.streak + 1,
        },
      });
      return prisma.beautyHabit.findUnique({ where: { id: habit.id } });
    }),

  create: customerProcedure
    .input(z.object({ name: z.string().min(1).max(100), emoji: z.string().default('✅') }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyHabit.create({
        data: { userId: ctx.user.id, name: input.name, emoji: input.emoji },
      });
    }),

  delete: customerProcedure
    .input(z.object({ habitId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await prisma.beautyHabit.findFirst({
        where: { id: input.habitId, userId: ctx.user.id },
      });
      if (habit) await prisma.beautyHabit.delete({ where: { id: habit.id } });
      return { success: true };
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const habits = await prisma.beautyHabit.count({ where: { userId: ctx.user.id } });
    const doneToday = await prisma.beautyHabit.count({
      where: { userId: ctx.user.id, doneToday: true },
    });
    const bestStreak = await prisma.beautyHabit.findFirst({
      where: { userId: ctx.user.id },
      orderBy: { streak: 'desc' },
      select: { streak: true },
    });
    return { total: habits, doneToday, bestStreak: bestStreak?.streak ?? 0 };
  }),
});

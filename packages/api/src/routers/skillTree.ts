import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const skillTreeRouter = router({
  mySkills: customerProcedure.query(async ({ ctx }) => {
    return prisma.beautySkill.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });
  }),

  updateLevel: customerProcedure
    .input(
      z.object({ skillId: z.number().int().positive(), level: z.number().int().min(0).max(5) }),
    )
    .mutation(async ({ ctx, input }) => {
      const skill = await prisma.beautySkill.findFirst({
        where: { id: input.skillId, userId: ctx.user.id },
      });
      if (skill) {
        await prisma.beautySkill.update({ where: { id: skill.id }, data: { level: input.level } });
      }
      return { success: true };
    }),

  create: customerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        emoji: z.string().default('⭐'),
        maxLevel: z.number().int().min(1).max(5).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.beautySkill.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          emoji: input.emoji,
          maxLevel: input.maxLevel,
          level: 0,
        },
      });
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const skills = await prisma.beautySkill.findMany({ where: { userId: ctx.user.id } });
    const total = skills.length;
    const totalLevels = skills.reduce((s, sk) => s + sk.level, 0);
    const maxLevels = skills.reduce((s, sk) => s + sk.maxLevel, 0);
    return {
      total,
      totalLevels,
      maxLevels,
      pct: maxLevels > 0 ? Math.round((totalLevels / maxLevels) * 100) : 0,
    };
  }),
});

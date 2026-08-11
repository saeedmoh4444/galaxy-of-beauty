import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const pricingRulesRouter = router({
  // Public: get active pricing modifier for a service at current time
  getMultiplier: publicProcedure
    .input(z.object({ serviceId: z.number().optional(), categoryId: z.number().optional() }))
    .query(async ({ input }) => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();

      const rules = await prisma.pricingRule.findMany({
        where: {
          isActive: true,
          OR: [
            input.serviceId ? { serviceId: input.serviceId } : {},
            input.categoryId ? { categoryId: input.categoryId } : {},
            { serviceId: null, categoryId: null },
          ],
        },
      });

      // Find best matching rule
      let multiplier = 1.0;
      for (const rule of rules) {
        if (rule.dayOfWeek !== null && rule.dayOfWeek !== dayOfWeek) continue;
        if (rule.hourStart !== null && rule.hourStart !== undefined && hour < rule.hourStart)
          continue;
        if (rule.hourEnd !== null && rule.hourEnd !== undefined && hour > rule.hourEnd) continue;
        multiplier = Number(rule.priceMultiplier);
      }

      return { multiplier, dayOfWeek, hour };
    }),

  // Admin: list all rules
  adminList: adminProcedure.query(async () => {
    return prisma.pricingRule.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure
    .input(
      z.object({
        serviceId: z.number().optional(),
        categoryId: z.number().optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        hourStart: z.number().min(0).max(23).optional(),
        hourEnd: z.number().min(0).max(23).optional(),
        priceMultiplier: z.number().min(0.5).max(3.0),
        technicianTier: z.string().optional(),
        labelJson: z.object({ ar: z.string(), en: z.string() }).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.pricingRule.create({ data: input });
    }),

  // Admin: toggle
  toggle: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      return prisma.pricingRule.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
    }),
});

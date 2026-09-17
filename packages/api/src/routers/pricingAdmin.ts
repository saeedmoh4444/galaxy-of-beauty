/**
 * 1.1 Dynamic pricing — admin CRUD for ServicePricing rules and the
 * per-service opt-in flag (Service.dynamicPricingEnabled).
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

const ruleInput = z.object({
  serviceId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  technicianTier: z.enum(['NEW', 'EXPERIENCED', 'PREMIUM', 'CELEBRITY']).nullable().optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  hourStart: z.number().int().min(0).max(23).nullable().optional(),
  hourEnd: z.number().int().min(0).max(24).nullable().optional(),
  priceMultiplier: z.number().min(0.1).max(5),
  isActive: z.boolean().optional(),
});

export const pricingAdminRouter = router({
  /** list — all rules with their service/category names. */
  list: adminProcedure.query(() =>
    prisma.servicePricing.findMany({
      orderBy: [{ isActive: 'desc' }, { id: 'desc' }],
      include: {
        service: { select: { id: true, titleJson: true } },
        category: { select: { id: true, nameJson: true } },
      },
    }),
  ),

  /** create — a new peak/off-peak rule. */
  create: adminProcedure.input(ruleInput).mutation(({ input }) =>
    prisma.servicePricing.create({
      data: {
        serviceId: input.serviceId ?? null,
        categoryId: input.categoryId ?? null,
        technicianTier: input.technicianTier ?? null,
        dayOfWeek: input.dayOfWeek ?? null,
        hourStart: input.hourStart ?? null,
        hourEnd: input.hourEnd ?? null,
        priceMultiplier: input.priceMultiplier,
        isActive: input.isActive ?? true,
      },
    }),
  ),

  /** update — edit a rule (partial). */
  update: adminProcedure
    .input(ruleInput.partial().extend({ id: z.number().int().positive() }))
    .mutation(({ input }) => {
      const { id, ...fields } = input;
      return prisma.servicePricing.update({
        where: { id },
        data: {
          ...(fields.serviceId !== undefined ? { serviceId: fields.serviceId ?? null } : {}),
          ...(fields.categoryId !== undefined ? { categoryId: fields.categoryId ?? null } : {}),
          ...(fields.technicianTier !== undefined
            ? { technicianTier: fields.technicianTier ?? null }
            : {}),
          ...(fields.dayOfWeek !== undefined ? { dayOfWeek: fields.dayOfWeek ?? null } : {}),
          ...(fields.hourStart !== undefined ? { hourStart: fields.hourStart ?? null } : {}),
          ...(fields.hourEnd !== undefined ? { hourEnd: fields.hourEnd ?? null } : {}),
          ...(fields.priceMultiplier !== undefined
            ? { priceMultiplier: fields.priceMultiplier }
            : {}),
          ...(fields.isActive !== undefined ? { isActive: fields.isActive } : {}),
        },
      });
    }),

  /** delete — remove a rule. */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => prisma.servicePricing.delete({ where: { id: input.id } })),

  /** setServiceFlag — opt a service in/out of dynamic pricing. */
  setServiceFlag: adminProcedure
    .input(z.object({ serviceId: z.number().int().positive(), enabled: z.boolean() }))
    .mutation(({ input }) =>
      prisma.service.update({
        where: { id: input.serviceId },
        data: { dynamicPricingEnabled: input.enabled },
      }),
    ),
});

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { buildBundleQuote } from '@galaxy/shared';

const serviceSelect = {
  id: true,
  titleJson: true,
  basePrice: true,
  durationMin: true,
  slug: true,
} as const;

const bundleInput = z.object({
  titleJson: z.object({ ar: z.string(), en: z.string() }),
  descriptionJson: z.object({ ar: z.string(), en: z.string() }).optional(),
  serviceIds: z.array(z.number()).min(2),
  discountPct: z.number().min(5).max(50),
  totalPrice: z.number().positive(),
  originalPrice: z.number().positive(),
  imageUrl: z.string().optional(),
  isSeasonal: z.boolean().default(false),
  season: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  sortOrder: z.number().default(0),
});

export const beautyBundlesRouter = router({
  // Public: list active bundles
  list: publicProcedure
    .input(z.object({ season: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isActive: true };
      if (input?.season) where.season = input.season;
      return prisma.beautyBundle.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: 20,
      });
    }),

  // Detail with services hydrated in the bundle's declared order.
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const bundle = await prisma.beautyBundle.findUnique({ where: { id: input.id } });
    if (!bundle) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bundle not found' });
    const services = await prisma.service.findMany({
      where: { id: { in: bundle.serviceIds } },
      select: serviceSelect,
    });
    const ordered = bundle.serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is (typeof services)[number] => Boolean(s));
    return { ...bundle, services: ordered };
  }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.beautyBundle.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure.input(bundleInput).mutation(async ({ input }) => {
    return prisma.beautyBundle.create({ data: input });
  }),

  // Admin: update (partial)
  update: adminProcedure
    .input(z.object({ id: z.number() }).merge(bundleInput.partial()))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.beautyBundle.update({ where: { id }, data });
    }),

  // Admin: soft delete — bundle history survives on bookings (Slice 2).
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const bundle = await prisma.beautyBundle.findUnique({ where: { id: input.id } });
    if (!bundle) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bundle not found' });
    return prisma.beautyBundle.update({
      where: { id: input.id },
      data: { isActive: false },
    });
  }),

  // Custom bundle preview — 3+ services, progressive tiers (1.2).
  quote: publicProcedure
    .input(z.object({ serviceIds: z.array(z.number()).min(3) }))
    .query(async ({ input }) => {
      const services = await prisma.service.findMany({
        where: { id: { in: input.serviceIds } },
        select: serviceSelect,
      });
      if (services.length !== input.serviceIds.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'One or more services not found' });
      }
      const byId = new Map(services.map((s) => [s.id, Number(s.basePrice)]));
      const prices = input.serviceIds.map((id) => byId.get(id) as number);
      return { ...buildBundleQuote(prices), services };
    }),
});

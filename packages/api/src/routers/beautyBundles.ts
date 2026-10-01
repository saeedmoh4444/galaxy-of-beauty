import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, adminProcedure, router } from '../trpc';
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
        include: { services: { orderBy: { sortOrder: 'asc' } } },
      });
    }),

  // Detail with services hydrated in the bundle's declared order.
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const bundle = await prisma.beautyBundle.findUnique({
      where: { id: input.id },
      include: { services: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!bundle) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bundle not found' });
    const { services: links, ...rest } = bundle;
    const serviceRows = await prisma.service.findMany({
      where: { id: { in: links.map((l) => l.serviceId) } },
      select: serviceSelect,
    });
    const ordered = links
      .map((l) => serviceRows.find((s) => s.id === l.serviceId))
      .filter((s): s is (typeof serviceRows)[number] => Boolean(s));
    return { ...rest, services: ordered };
  }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.beautyBundle.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create — serviceIds now live in the bundle_services join table.
  create: adminProcedure.input(bundleInput).mutation(async ({ input }) => {
    const { serviceIds, ...data } = input;
    return prisma.beautyBundle.create({
      data: {
        ...data,
        services: {
          create: serviceIds.map((serviceId, sortOrder) => ({ serviceId, sortOrder })),
        },
      },
    });
  }),

  // Admin: update (partial)
  update: adminProcedure
    .input(z.object({ id: z.number() }).merge(bundleInput.partial()))
    .mutation(async ({ input }) => {
      const { id, serviceIds, ...data } = input;
      return prisma.beautyBundle.update({
        where: { id },
        data: {
          ...data,
          ...(serviceIds
            ? {
                services: {
                  deleteMany: {},
                  create: serviceIds.map((serviceId, sortOrder) => ({ serviceId, sortOrder })),
                },
              }
            : {}),
        },
      });
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

  // Audit stage 12 — persist a custom-bundle wizard selection (web wizard
  // tiers: 2=10%, 3=15%, 4=20%, 5=25%). Prices are computed server-side
  // from live basePrice — the client never supplies money math. Booking
  // create picks the result up via ?beautyBundleId=.
  createCustom: customerProcedure
    .input(
      z.object({
        serviceIds: z.array(z.number().int().positive()).min(2).max(5),
      }),
    )
    .mutation(async ({ input }) => {
      const unique = [...new Set(input.serviceIds)];
      if (unique.length !== input.serviceIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Duplicate services in bundle' });
      }
      const services = await prisma.service.findMany({
        where: { id: { in: unique } },
        select: serviceSelect,
      });
      if (services.length !== unique.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'One or more services not found' });
      }

      const WIZARD_TIERS: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };
      const discountPct = WIZARD_TIERS[unique.length] ?? 0;
      const byId = new Map(services.map((s) => [s.id, Number(s.basePrice)]));
      const originalPrice =
        Math.round(unique.reduce((sum, id) => sum + (byId.get(id) as number), 0) * 100) / 100;
      const totalPrice = Math.round(originalPrice * (1 - discountPct / 100) * 100) / 100;

      const bundle = await prisma.$transaction(async (tx) => {
        const created = await tx.beautyBundle.create({
          data: {
            titleJson: { ar: 'باقتي المخصصة', en: 'My Custom Bundle' },
            discountPct,
            originalPrice,
            totalPrice,
            isActive: true,
          },
        });
        await tx.bundleService.createMany({
          data: unique.map((serviceId, sortOrder) => ({
            bundleId: created.id,
            serviceId,
            sortOrder,
          })),
        });
        return created;
      });

      return {
        bundleId: bundle.id,
        quote: {
          originalPrice,
          discountPct,
          totalPrice,
          savings: Math.round((originalPrice - totalPrice) * 100) / 100,
        },
      };
    }),
});

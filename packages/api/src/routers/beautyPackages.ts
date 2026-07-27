import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const beautyPackageRouter = router({
  // List all active packages (public)
  list: publicProcedure.query(async () => {
    const packages = await prisma.beautyPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          include: {
            package: false,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return packages;
  }),

  // Get package by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const pkg = await prisma.beautyPackage.findUnique({
        where: { id: input.id },
        include: {
          services: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      return pkg;
    }),

  // Admin: create package
  create: adminProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
      descriptionAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      imageUrl: z.string().optional(),
      discountPercent: z.number().min(0).max(100).default(15),
      serviceIds: z.array(z.number().int().positive()).min(2),
    }))
    .mutation(async ({ input }) => {
      const pkg = await prisma.beautyPackage.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: input.descriptionAr ? { ar: input.descriptionAr, en: input.descriptionEn || input.descriptionAr } : undefined,
          imageUrl: input.imageUrl,
          discountPercent: input.discountPercent,
          services: {
            create: input.serviceIds.map((serviceId, i) => ({ serviceId, sortOrder: i })),
          },
        },
        include: { services: true },
      });
      return pkg;
    }),

  // Admin: list all (including inactive)
  listAll: adminProcedure.query(async () => {
    const packages = await prisma.beautyPackage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return packages;
  }),
});

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, technicianProcedure, router } from '../trpc';

const db = prisma;

export const beautyPackageRouter = router({
  // List active APPROVED packages (public). B.6: provider-proposed
  // packages only appear after admin approval.
  list: publicProcedure.query(async () => {
    const packages = await db.beautyPackage.findMany({
      where: { isActive: true, status: 'APPROVED' },
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
      const pkg = await db.beautyPackage.findUnique({
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
    .input(
      z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        discountPercent: z.number().min(0).max(100).default(15),
        serviceIds: z.array(z.number().int().positive()).min(2),
      }),
    )
    .mutation(async ({ input }) => {
      const pkg = await db.beautyPackage.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: input.descriptionAr
            ? { ar: input.descriptionAr, en: input.descriptionEn || input.descriptionAr }
            : undefined,
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
    const packages = await db.beautyPackage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return packages;
  }),

  // ---------------------------------------------------------------------------
  // B.6 — provider-proposed packages (technician only)
  // ---------------------------------------------------------------------------

  /**
   * propose — submit a package for admin review. Own-services rule: every
   * bundled service must be in the technician's own offerings (ownership/
   * commission accounting breaks otherwise). Creates the package row in
   * PENDING_REVIEW plus a ProviderSubmission for the shared admin queue.
   */
  propose: technicianProcedure
    .input(
      z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        discountPercent: z.number().min(0).max(100).default(15),
        serviceIds: z.array(z.number().int().positive()).min(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const technician = await db.technician.findUnique({ where: { userId: ctx.user.id } });
      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician profile not found' });
      }

      // Own-services rule.
      const owned = await db.technicianService.findMany({
        where: { technicianId: technician.id, serviceId: { in: input.serviceIds }, isActive: true },
        select: { serviceId: true },
      });
      const ownedIds = new Set(owned.map((m) => m.serviceId));
      const foreign = input.serviceIds.find((id) => !ownedIds.has(id));
      if (foreign !== undefined) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Service #${foreign} is not one of your own services`,
        });
      }

      const pkg = await db.beautyPackage.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: input.descriptionAr
            ? { ar: input.descriptionAr, en: input.descriptionEn || input.descriptionAr }
            : undefined,
          imageUrl: input.imageUrl,
          discountPercent: input.discountPercent,
          status: 'PENDING_REVIEW',
          createdByUserId: ctx.user.id,
          services: {
            create: input.serviceIds.map((serviceId, i) => ({ serviceId, sortOrder: i })),
          },
        },
        include: { services: true },
      });

      await db.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'package',
          status: 'PENDING_REVIEW',
          payload: {
            packageId: pkg.id,
            nameJson: { ar: input.nameAr, en: input.nameEn },
            serviceIds: input.serviceIds,
            discountPercent: input.discountPercent,
          },
        },
      });

      return pkg;
    }),

  /** myPackages — the technician's own proposals (any status). */
  myPackages: technicianProcedure.query(async ({ ctx }) => {
    return db.beautyPackage.findMany({
      where: { createdByUserId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      include: { services: { orderBy: { sortOrder: 'asc' } } },
    });
  }),
});

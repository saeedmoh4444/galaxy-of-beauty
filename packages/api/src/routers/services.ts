import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';
import {
  createServiceSchema,
  updateServiceSchema,
  createVariantSchema,
  createTagSchema,
  serviceQuerySchema,
} from '../validators/catalog';

export const serviceRouter = router({
  /**
   * list — paginated service listing with filters.
   * Public.
   * Supports: categoryId, search (in titleJson), price range, sorting.
   */
  list: publicProcedure
    .input(serviceQuerySchema)
    .query(async ({ input }) => {
      const { search, categoryId, minPrice, maxPrice, sort, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { isActive: true };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter: Record<string, unknown> = {};
        if (minPrice !== undefined) priceFilter.gte = minPrice;
        if (maxPrice !== undefined) priceFilter.lte = maxPrice;
        where.basePrice = priceFilter;
      }

      if (search) {
        where.OR = [
          { titleJson: { path: ['en'], string_contains: search } },
          { titleJson: { path: ['ar'], string_contains: search } },
        ];
      }

      const orderBy: Record<string, unknown> | Record<string, unknown>[] = (() => {
        switch (sort) {
          case 'price_asc':
            return { basePrice: 'asc' as const };
          case 'price_desc':
            return { basePrice: 'desc' as const };
          case 'popular':
            return [{ isPopular: 'desc' as const }, { sortOrder: 'asc' as const }];
          case 'duration':
            return { durationMin: 'asc' as const };
          case 'newest':
          default:
            return { createdAt: 'desc' as const };
        }
      })();

      const [items, total] = await Promise.all([
        prisma.service.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: { select: { id: true, nameJson: true, slug: true } },
            variants: { where: { isActive: true } },
            tags: { include: { tag: true } },
          },
        }),
        prisma.service.count({ where }),
      ]);

      return { items, total, page, limit };
    }),

  /**
   * surpriseMe — pick a random active service, optionally filtered by budget / category.
   * Returns null when no matching service exists.
   * Public.
   */
  surpriseMe: publicProcedure
    .input(
      z.object({
        budget: z.number().positive().optional(),
        categoryId: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isActive: true };
      if (input.categoryId) where.categoryId = input.categoryId;
      if (input.budget) where.basePrice = { lte: input.budget };

      const count = await prisma.service.count({ where });
      if (count === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * count);
      const [service] = await prisma.service.findMany({
        where,
        skip: randomIndex,
        take: 1,
        include: {
          category: { select: { id: true, nameJson: true, slug: true } },
          variants: { where: { isActive: true } },
          tags: { include: { tag: true } },
        },
      });

      return service ?? null;
    }),

  /**
   * getById — full service detail with variants, addons, technician mappings, and tags.
   * Public.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const service = await prisma.service.findUnique({
        where: { id: input.id },
        include: {
          category: { select: { id: true, nameJson: true, slug: true } },
          variants: { where: { isActive: true } },
          servicesWithAddon: {
            where: { isActive: true },
            include: {
              addon: {
                select: {
                  id: true,
                  titleJson: true,
                  basePrice: true,
                  durationMin: true,
                  imageUrl: true,
                },
              },
            },
          },
          technicianServices: {
            where: { isActive: true },
            include: {
              technician: {
                select: {
                  id: true,
                  ratingAvg: true,
                  totalReviews: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      return service;
    }),

  /**
   * create — create a new service.
   * Builds titleJson / descriptionJson from ar/en fields.
   * Admin only.
   */
  create: adminProcedure
    .input(createServiceSchema)
    .mutation(async ({ input }) => {
      const { titleAr, titleEn, descriptionAr, descriptionEn, ...rest } = input;

      const data: Record<string, unknown> = {
        ...rest,
        titleJson: { ar: titleAr, en: titleEn },
      };
      if (descriptionAr !== undefined || descriptionEn !== undefined) {
        data.descriptionJson = {
          ar: descriptionAr ?? '',
          en: descriptionEn ?? '',
        };
      }

      const service = await prisma.service.create({ data: data as Parameters<typeof prisma.service.create>[0]['data'] });
      return service;
    }),

  /**
   * update — update an existing service.
   * Rebuilds titleJson / descriptionJson if their ar/en counterparts are provided.
   * Admin only.
   */
  update: adminProcedure
    .input(z.object({ id: z.number().int().positive() }).merge(updateServiceSchema))
    .mutation(async ({ input }) => {
      const { id, titleAr, titleEn, descriptionAr, descriptionEn, ...rest } = input;

      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const data: Record<string, unknown> = { ...rest };

      if (titleAr !== undefined || titleEn !== undefined) {
        const currentTitle = existing.titleJson as { ar: string; en: string };
        data.titleJson = {
          ar: titleAr ?? currentTitle.ar,
          en: titleEn ?? currentTitle.en,
        };
      }

      if (descriptionAr !== undefined || descriptionEn !== undefined) {
        const currentDesc = existing.descriptionJson
          ? (existing.descriptionJson as { ar?: string; en?: string })
          : {};
        data.descriptionJson = {
          ar: descriptionAr ?? currentDesc.ar ?? '',
          en: descriptionEn ?? currentDesc.en ?? '',
        };
      }

      const service = await prisma.service.update({ where: { id }, data });
      return service;
    }),

  /**
   * delete — soft-delete a service (set isActive = false).
   * Admin only.
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Variants
  // ---------------------------------------------------------------------------

  /**
   * createVariant — add a variant to a service.
   * Admin only.
   */
  createVariant: adminProcedure
    .input(z.object({ serviceId: z.number().int().positive() }).merge(createVariantSchema))
    .mutation(async ({ input }) => {
      const { serviceId, nameAr, nameEn, ...rest } = input;

      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const variant = await prisma.serviceVariant.create({
        data: {
          serviceId,
          nameJson: { ar: nameAr, en: nameEn },
          ...rest,
        },
      });

      return variant;
    }),

  /**
   * updateVariant — update a variant's name, pricing, duration, or active state.
   * Admin only.
   */
  updateVariant: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        priceDelta: z.number().optional(),
        durationDelta: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, nameAr, nameEn, ...rest } = input;

      const existing = await prisma.serviceVariant.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Variant not found',
        });
      }

      const data: Record<string, unknown> = { ...rest };
      if (nameAr !== undefined || nameEn !== undefined) {
        const currentName = existing.nameJson as { ar: string; en: string };
        data.nameJson = {
          ar: nameAr ?? currentName.ar,
          en: nameEn ?? currentName.en,
        };
      }

      const variant = await prisma.serviceVariant.update({ where: { id }, data });
      return variant;
    }),

  /**
   * deleteVariant — soft-delete a variant (set isActive = false).
   * Admin only.
   */
  deleteVariant: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const existing = await prisma.serviceVariant.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Variant not found',
        });
      }

      await prisma.serviceVariant.update({
        where: { id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Add-ons
  // ---------------------------------------------------------------------------

  /**
   * addAddon — link an existing service as an add-on to another service.
   * Admin only.
   */
  addAddon: adminProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        addonId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const [service, addon] = await Promise.all([
        prisma.service.findUnique({ where: { id: input.serviceId } }),
        prisma.service.findUnique({ where: { id: input.addonId } }),
      ]);

      if (!service) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }
      if (!addon) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Addon service not found' });
      }

      const existingAddon = await prisma.serviceAddon.findUnique({
        where: {
          serviceId_addonId: {
            serviceId: input.serviceId,
            addonId: input.addonId,
          },
        },
      });
      if (existingAddon) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Addon is already linked to this service',
        });
      }

      const serviceAddon = await prisma.serviceAddon.create({
        data: { serviceId: input.serviceId, addonId: input.addonId },
      });

      return serviceAddon;
    }),

  /**
   * removeAddon — unlink an addon from a service.
   * Admin only.
   */
  removeAddon: adminProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        addonId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.serviceAddon.findUnique({
        where: {
          serviceId_addonId: {
            serviceId: input.serviceId,
            addonId: input.addonId,
          },
        },
      });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Addon link not found',
        });
      }

      await prisma.serviceAddon.delete({
        where: {
          serviceId_addonId: {
            serviceId: input.serviceId,
            addonId: input.addonId,
          },
        },
      });

      return { success: true };
    }),

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------

  /**
   * createTag — create a new service tag.
   * Admin only.
   */
  createTag: adminProcedure
    .input(createTagSchema)
    .mutation(async ({ input }) => {
      const { nameAr, nameEn, slug } = input;

      const tag = await prisma.serviceTag.create({
        data: {
          nameJson: { ar: nameAr, en: nameEn },
          slug,
        },
      });

      return tag;
    }),

  /**
   * assignTag — assign a tag to a service.
   * Admin only.
   */
  assignTag: adminProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        tagId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const [service, tag] = await Promise.all([
        prisma.service.findUnique({ where: { id: input.serviceId } }),
        prisma.serviceTag.findUnique({ where: { id: input.tagId } }),
      ]);

      if (!service) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }
      if (!tag) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tag not found' });
      }

      const existing = await prisma.serviceTagAssignment.findUnique({
        where: {
          serviceId_tagId: {
            serviceId: input.serviceId,
            tagId: input.tagId,
          },
        },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Tag is already assigned to this service',
        });
      }

      const assignment = await prisma.serviceTagAssignment.create({
        data: { serviceId: input.serviceId, tagId: input.tagId },
      });

      return assignment;
    }),

  /**
   * unassignTag — remove a tag assignment from a service.
   * Admin only.
   */
  unassignTag: adminProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        tagId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.serviceTagAssignment.findUnique({
        where: {
          serviceId_tagId: {
            serviceId: input.serviceId,
            tagId: input.tagId,
          },
        },
      });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag assignment not found',
        });
      }

      await prisma.serviceTagAssignment.delete({
        where: {
          serviceId_tagId: {
            serviceId: input.serviceId,
            tagId: input.tagId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * listTags — return all tags with assignment counts.
   * Public.
   */
  listTags: publicProcedure.query(async () => {
    const tags = await prisma.serviceTag.findMany({
      include: { _count: { select: { assignments: true } } },
      orderBy: { id: 'asc' },
    });
    return tags;
  }),
});

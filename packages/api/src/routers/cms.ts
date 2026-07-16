import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';

export const cmsRouter = router({
  // ── Categories CRUD ────────────────────────────────────
  listCategories: adminProcedure.query(() =>
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { services: true } } } })
  ),

  upsertCategory: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      nameAr: z.string(), nameEn: z.string(),
      slug: z.string(), parentId: z.number().optional(),
      imageUrl: z.string().optional(), sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const data = {
        nameJson: { ar: input.nameAr, en: input.nameEn },
        slug: input.slug,
        parentId: input.parentId ?? null,
        imageUrl: input.imageUrl ?? null,
        sortOrder: input.sortOrder,
      };
      if (input.id) {
        return prisma.category.update({ where: { id: input.id }, data });
      }
      return prisma.category.create({ data });
    }),

  deleteCategory: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await prisma.category.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ── Services CRUD ──────────────────────────────────────
  listServices: adminProcedure.query(() =>
    prisma.service.findMany({ orderBy: { createdAt: 'desc' }, include: { category: { select: { nameJson: true } } } })
  ),

  upsertService: adminProcedure
    .input(z.object({
      id: z.number().optional(), categoryId: z.number(),
      titleAr: z.string(), titleEn: z.string(),
      descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
      basePrice: z.number().positive(), durationMin: z.number().int().positive(),
      slug: z.string().optional(), imageUrl: z.string().optional(),
      isPopular: z.boolean().default(false), sortOrder: z.number().default(0),
      variants: z.array(z.object({
        nameAr: z.string(), nameEn: z.string(),
        priceDelta: z.number().default(0), durationDelta: z.number().int().default(0),
      })).optional(),
      tagIds: z.array(z.number().int().positive()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, titleAr, titleEn, descriptionAr, descriptionEn, variants, tagIds, ...rest } = input;
      const data = {
        ...rest,
        titleJson: { ar: titleAr, en: titleEn },
        descriptionJson: descriptionAr || descriptionEn ? { ar: descriptionAr || '', en: descriptionEn || '' } : undefined,
        slug: input.slug || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      };

      let service;
      if (id) {
        service = await prisma.service.update({ where: { id }, data });
        // Delete old variants and recreate
        await prisma.serviceVariant.deleteMany({ where: { serviceId: id } });
        // Delete old tag assignments
        await prisma.serviceTagAssignment.deleteMany({ where: { serviceId: id } });
      } else {
        service = await prisma.service.create({ data });
      }

      // Create variants if provided
      if (variants && variants.length > 0) {
        await prisma.serviceVariant.createMany({
          data: variants.map((v) => ({
            serviceId: service.id,
            nameJson: { ar: v.nameAr, en: v.nameEn },
            priceDelta: v.priceDelta,
            durationDelta: v.durationDelta,
          })),
        });
      }

      // Assign tags if provided
      if (tagIds && tagIds.length > 0) {
        await prisma.serviceTagAssignment.createMany({
          data: tagIds.map((tagId) => ({ serviceId: service.id, tagId })),
          skipDuplicates: true,
        });
      }

      return { success: true, id: service.id };
    }),

  // ── Banners ────────────────────────────────────────────
  listBanners: adminProcedure.query(async () => {
    // Banners stored as platform configs with key prefix "banner:"
    return prisma.platformConfig.findMany({
      where: { key: { startsWith: 'banner:' } },
      orderBy: { key: 'asc' },
    });
  }),

  upsertBanner: adminProcedure
    .input(z.object({ id: z.string(), titleAr: z.string(), titleEn: z.string(), imageUrl: z.string(), link: z.string().optional(), active: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.platformConfig.upsert({
        where: { key: `banner:${input.id}` },
        update: { value: JSON.stringify({ titleAr: input.titleAr, titleEn: input.titleEn, imageUrl: input.imageUrl, link: input.link, active: input.active }) },
        create: { key: `banner:${input.id}`, value: JSON.stringify({ titleAr: input.titleAr, titleEn: input.titleEn, imageUrl: input.imageUrl, link: input.link, active: input.active }), updatedBy: ctx.user.id },
      });
      return { success: true };
    }),

  deleteBanner: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.platformConfig.delete({ where: { key: `banner:${input.id}` } }).catch(() => null);
      return { success: true };
    }),
});

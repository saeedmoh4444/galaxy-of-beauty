import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { createCategorySchema, updateCategorySchema } from '../validators/catalog';

/** Simple slugify helper for auto-generating slugs from English names. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const categoryRouter = router({
  /**
   * list — return all active root categories with their active children.
   * Public (no auth required).
   */
  list: publicProcedure.query(async () => {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return categories;
  }),

  /**
   * tree — return the full active category tree (nested children).
   * Public.
   */
  tree: publicProcedure.query(async () => {
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const map = new Map<number, (typeof allCategories)[number] & { children: any[] }>();
    const roots: any[] = [];

    for (const cat of allCategories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of map.values()) {
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        roots.push(cat);
      }
    }

    return roots;
  }),

  /**
   * all — return EVERY category including inactive ones.
   * Admin only.
   */
  all: adminProcedure.query(async () => {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        parent: { select: { id: true, nameJson: true, slug: true } },
        _count: { select: { services: true } },
      },
    });
    return categories;
  }),

  /**
   * getBySlug — find a single category by its slug.
   * Public.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await prisma.category.findUnique({
        where: { slug: input.slug },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: { select: { services: true } },
            },
          },
          _count: { select: { services: true } },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return category;
    }),

  /**
   * create — create a new category.
   * Builds nameJson from the ar/en name fields.
   * Auto-generates slug from the English name if slug is omitted.
   * Admin only.
   */
  create: adminProcedure
    .input(createCategorySchema.extend({ slug: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { nameAr, nameEn, slug, ...rest } = input;

      const category = await prisma.category.create({
        data: {
          nameJson: { ar: nameAr, en: nameEn },
          slug: slug || slugify(nameEn),
          ...rest,
        },
      });

      return category;
    }),

  /**
   * update — update an existing category.
   * Rebuilds nameJson if ar/en names are provided.
   * Admin only.
   */
  update: adminProcedure
    .input(z.object({ id: z.number().int().positive() }).merge(updateCategorySchema))
    .mutation(async ({ input }) => {
      const { id, nameAr, nameEn, ...rest } = input;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
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

      const category = await prisma.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  /**
   * delete — soft-delete a category (set isActive = false).
   * Admin only.
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      return { success: true };
    }),
});

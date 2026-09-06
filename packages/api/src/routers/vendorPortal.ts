import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

/** B.3: vendor portal is DB-backed (was an in-memory array). */

/** Resolve the caller's Vendor row, auto-creating a minimal one on first use. */
async function ensureVendor(userId: number, userName: string) {
  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.vendor.create({
    data: {
      userId,
      storeName: userName || 'متجري',
      storeSlug: `store-${userId}-${Math.random().toString(36).slice(2, 8)}`,
    },
  });
}

/** Fallback category for products added without a category. */
async function generalCategoryId(): Promise<number> {
  const general = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
  if (general) return general.id;
  // Last resort: any category.
  const any = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  if (any) return any.id;
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'No product categories available',
  });
}

/** Map a Product row to the vendor-portal UI shape. */
function toPortalProduct(p: {
  id: number;
  nameJson: unknown;
  price: unknown;
  stock: number;
  sales: number;
  emoji: string;
  isActive: boolean;
}) {
  return {
    id: p.id,
    nameAr: (p.nameJson as { ar?: string }).ar ?? '',
    nameEn: (p.nameJson as { en?: string }).en ?? '',
    price: Number(p.price),
    stock: p.stock,
    sales: p.sales,
    emoji: p.emoji,
    active: p.isActive,
  };
}

export const vendorPortalRouter = router({
  dashboard: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });

    if (!vendor) {
      return { totalProducts: 0, totalSales: 0, revenue: 0, rating: 4.8 };
    }

    const agg = await prisma.product.aggregate({
      where: { vendorId: vendor.id },
      _sum: { sales: true },
      _count: true,
    });
    // Revenue = Σ price × sales
    const rows = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { price: true, sales: true },
    });
    const revenue = rows.reduce((sum, r) => sum + Number(r.price) * r.sales, 0);

    // Real rating: average of this vendor's product reviews.
    const reviewsAgg = await prisma.productReview.aggregate({
      where: { product: { vendorId: vendor.id } },
      _avg: { rating: true },
    });

    return {
      totalProducts: agg._count,
      totalSales: agg._sum.sales ?? 0,
      revenue,
      rating: Number(reviewsAgg._avg.rating?.toFixed(1) ?? 4.8),
    };
  }),

  myProducts: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) return [];

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(toPortalProduct);
  }),

  addProduct: customerProcedure
    .input(
      z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        price: z.number().min(1),
        stock: z.number().min(0).default(10),
        emoji: z.string().default(''),
        categoryId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true },
      });
      const vendor = await ensureVendor(ctx.user.id, user?.name ?? '');

      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: input.categoryId ?? (await generalCategoryId()),
          nameJson: { ar: input.nameAr, en: input.nameEn || input.nameAr },
          descriptionJson: { ar: '', en: '' },
          price: input.price,
          stock: input.stock,
          sales: 0,
          emoji: input.emoji,
          isActive: true,
        },
      });

      return toPortalProduct(product);
    }),

  deleteProduct: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) return { success: true };

      // Ownership-guarded soft delete.
      await prisma.product.updateMany({
        where: { id: input.id, vendorId: vendor.id },
        data: { isActive: false },
      });
      return { success: true };
    }),
});

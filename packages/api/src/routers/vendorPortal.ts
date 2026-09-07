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

    // Store plan Phase 1 — pending order count (store-managed fulfillment).
    const pendingOrders = await prisma.storeOrder.count({
      where: { vendorId: vendor.id, status: 'PENDING_FULFILLMENT' },
    });

    // Phase 4b — analytics P1: top products by sales.
    const topProducts = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { sales: 'desc' },
      take: 5,
      select: { id: true, nameJson: true, price: true, sales: true },
    });

    return {
      totalProducts: agg._count,
      totalSales: agg._sum.sales ?? 0,
      revenue,
      rating: Number(reviewsAgg._avg.rating?.toFixed(1) ?? 4.8),
      pendingOrders,
      topProducts,
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

  // ---------------------------------------------------------------------------
  // Store plan Phase 1 — store registration state + orders
  // ---------------------------------------------------------------------------

  /** myStore — the caller's store (or null when not registered yet). */
  myStore: customerProcedure.query(async ({ ctx }) => {
    return prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
  }),

  /** orders — the store's orders, newest first. */
  orders: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) return [];

    return prisma.storeOrder.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });
  }),

  /** fulfillOrder — mark a store order fulfilled (ownership-guarded).
   *  Store plan Phase 3: accrues a PENDING payout — net = total minus the
   *  store's commission rate. */
  fulfillOrder: customerProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      const order = await prisma.storeOrder.findUnique({
        where: { id: input.orderId },
        select: { vendorId: true, status: true, totalAmount: true },
      });
      if (!order || order.vendorId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }
      if (order.status === 'FULFILLED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order already fulfilled' });
      }

      return prisma.$transaction(async (tx) => {
        const fulfilled = await tx.storeOrder.update({
          where: { id: input.orderId },
          data: { status: 'FULFILLED' },
        });

        // Phase 3 — accrual: net payout for the store.
        const total = Number(order.totalAmount);
        const commission = Math.round(total * Number(vendor.commissionRate)) / 100;
        const net = Math.round((total - commission) * 100) / 100;
        await tx.payout.create({
          data: {
            technicianId: null,
            vendorId: vendor.id,
            periodStart: new Date(),
            periodEnd: new Date(),
            amount: net,
            fee: commission,
            status: 'PENDING',
          },
        });

        return fulfilled;
      });
    }),

  // ---------------------------------------------------------------------------
  // Store plan Phase 4b — store-proposed product deals
  // ---------------------------------------------------------------------------

  /**
   * proposeDeal — a store discounts one of its OWN products. Guardrails:
   * own-product rule and a 40% floor. Snapshot rides the shared
   * provider-submission queue (kind 'store_promotion').
   */
  proposeDeal: customerProcedure
    .input(
      z
        .object({
          productId: z.number().int().positive(),
          dealPrice: z.number().positive(),
          startsAt: z.string().datetime(),
          endsAt: z.string().datetime(),
        })
        .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
          message: 'endAt must be after startAt',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      const product = await prisma.product.findUnique({ where: { id: input.productId } });
      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      }
      if (product.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product is not one of your own products',
        });
      }

      const originalPrice = Number(product.price);
      const floor = (originalPrice * 40) / 100;
      if (input.dealPrice >= originalPrice) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Deal price must be lower than the regular price',
        });
      }
      if (input.dealPrice < floor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Deal price below the 40% floor (${floor} SAR)`,
        });
      }

      return prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'store_promotion',
          status: 'PENDING_REVIEW',
          payload: {
            productId: product.id,
            vendorId: vendor.id,
            titleAr: (product.nameJson as { ar?: string }).ar ?? '',
            originalPrice,
            dealPrice: input.dealPrice,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
          },
        },
      });
    }),

  /** myDeals — the store's own deal proposals (any status). */
  myDeals: customerProcedure.query(async ({ ctx }) => {
    return prisma.providerSubmission.findMany({
      where: { providerId: ctx.user.id, kind: 'store_promotion' },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** earnings — the store's payout statements (Phase 3). */
  earnings: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) return [];

    return prisma.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  }),
});

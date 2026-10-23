import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';
import { notifyUser } from '../lib/notify';

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
  descriptionJson?: unknown;
  price: unknown;
  stock: number;
  sales: number;
  emoji: string;
  isActive: boolean;
  isDraft?: boolean | null;
  isFeatured?: boolean;
  images?: string[];
  lowStockThreshold?: number | null;
  approvalStatus?: string | null;
  reviewNotes?: string | null;
}) {
  const nameAr = (p.nameJson as { ar?: string }).ar ?? '';
  const nameEn = (p.nameJson as { en?: string }).en ?? '';
  const descAr = (p.descriptionJson as { ar?: string } | undefined)?.ar ?? '';
  const descEn = (p.descriptionJson as { en?: string } | undefined)?.en ?? '';

  // C1 — bilingual completeness meter: 25 per filled ar/en name+description.
  const completeness = [nameAr, nameEn, descAr, descEn].filter((v) => v.trim() !== '').length * 25;

  return {
    id: p.id,
    nameAr,
    nameEn,
    descAr,
    descEn,
    price: Number(p.price),
    stock: p.stock,
    sales: p.sales,
    emoji: p.emoji,
    active: p.isActive,
    draft: p.isDraft ?? false,
    // C6 — featured picker (storefront profile ordering).
    featured: p.isFeatured ?? false,
    images: p.images ?? [],
    // C1 — listing completeness (editor meter + C2 approval readiness).
    completeness,
    // B3b — low-stock threshold (products list badge + C1 editor).
    threshold: p.lowStockThreshold ?? 5,
    // C2 — listing approval state (PENDING | LIVE | REJECTED) + admin note.
    approvalStatus: p.approvalStatus ?? 'LIVE',
    reviewNotes: p.reviewNotes ?? null,
  };
}

export const vendorPortalRouter = router({
  dashboard: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });

    if (!vendor) {
      // A store with no vendor and no reviews has no rating — never invent
      // a 4.8 default.
      return {
        totalProducts: 0,
        totalSales: 0,
        revenue: 0,
        rating: 0,
        ordersByStatus: {},
        revenue30d: 0,
        ordersCount: 0,
        aov: 0,
        customerCount: 0,
        lowStockProducts: [],
      };
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

    // B3b — low-stock surface: active products at or below their own
    // threshold (field-to-field comparison), stock-ascending so the most
    // urgent restocks lead.
    const lowStockProducts = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
        isActive: true,
        stock: { lte: prisma.product.fields.lowStockThreshold },
      },
      orderBy: { stock: 'asc' },
      take: 8,
      select: { id: true, nameJson: true, stock: true, lowStockThreshold: true },
    });

    // S5 — order-based analytics (beyond top-products): 30-day revenue,
    // order count, AOV, distinct customers, and a per-status breakdown.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const statusGroups = await prisma.storeOrder.groupBy({
      by: ['status'],
      where: { vendorId: vendor.id },
      _count: true,
    });
    const ordersByStatus = Object.fromEntries(statusGroups.map((g) => [g.status, g._count]));
    const recentAgg = await prisma.storeOrder.aggregate({
      where: { vendorId: vendor.id, createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    });
    const allAgg = await prisma.storeOrder.aggregate({
      where: { vendorId: vendor.id },
      _sum: { totalAmount: true },
      _count: true,
    });
    const ordersCount = allAgg._count;
    const totalOrderValue = Number(allAgg._sum.totalAmount ?? 0);
    const aov = ordersCount ? Math.round((totalOrderValue / ordersCount) * 100) / 100 : 0;
    const distinctCustomers = await prisma.storeOrder.findMany({
      where: { vendorId: vendor.id },
      select: { customerId: true },
      distinct: ['customerId'],
    });

    return {
      totalProducts: agg._count,
      totalSales: agg._sum.sales ?? 0,
      revenue,
      rating: Number(reviewsAgg._avg.rating?.toFixed(1) ?? 0),
      pendingOrders,
      topProducts,
      ordersByStatus,
      revenue30d: Number(recentAgg._sum.totalAmount ?? 0),
      ordersCount,
      aov,
      customerCount: distinctCustomers.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        nameAr: (p.nameJson as { ar?: string }).ar ?? '',
        nameEn: (p.nameJson as { en?: string }).en ?? '',
        stock: p.stock,
        threshold: p.lowStockThreshold,
      })),
    };
  }),

  myProducts: customerProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) return { items: [], nextCursor: null, total: 0 };

      // A5 — cursor pagination on the stable id (autoincrement) instead of
      // createdAt: equal timestamps can't page deterministically.
      const where = {
        vendorId: vendor.id,
        isActive: true,
        ...(input.cursor ? { id: { lt: input.cursor } } : {}),
      };
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { id: 'desc' },
          take: input.limit + 1, // peek one row for nextCursor
        }),
        prisma.product.count({ where: { vendorId: vendor.id, isActive: true } }),
      ]);
      const hasMore = products.length > input.limit;
      const page = hasMore ? products.slice(0, input.limit) : products;
      return {
        items: page.map(toPortalProduct),
        nextCursor: hasMore ? page[page.length - 1]!.id : null,
        total,
      };
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
        // E7 — real product shots instead of emojis.
        imageUrl: z.string().url().optional(),
        // B3b — vendor-set low-stock alert threshold.
        lowStockThreshold: z.number().int().min(0).max(10000).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { name: true },
      });
      const vendor = await ensureVendor(ctx.user.id, user?.name ?? '');

      // C2 — strict listing approval: when the flag is on, new products
      // start PENDING and wait for the admin review queue. Off (relaxed,
      // the default): products publish LIVE immediately as before.
      const strict = await prisma.featureFlag.findUnique({
        where: { key: 'LISTING_APPROVAL_STRICT' },
      });

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
          imageUrl: input.imageUrl,
          isActive: true,
          lowStockThreshold: input.lowStockThreshold,
          approvalStatus: strict?.enabled ? 'PENDING' : 'LIVE',
        },
      });

      if (strict?.enabled) {
        await prisma.providerSubmission.create({
          data: {
            providerId: ctx.user.id,
            kind: 'product',
            payload: {
              productId: product.id,
              vendorId: vendor.id,
              nameJson: { ar: input.nameAr, en: input.nameEn || input.nameAr },
              price: input.price,
            },
          },
        });
      }

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
  // C1 — product editor pro
  // ---------------------------------------------------------------------------

  /** updateProduct — ownership-guarded edit; partial fields merge into the
   *  existing bilingual JSON columns (never clobber the other language). */
  updateProduct: customerProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        descAr: z.string().optional(),
        descEn: z.string().optional(),
        price: z.number().min(1).optional(),
        stock: z.number().int().min(0).optional(),
        emoji: z.string().optional(),
        categoryId: z.number().int().positive().optional(),
        imageUrl: z.string().url().optional(),
        images: z.array(z.string().url()).max(8).optional(),
        lowStockThreshold: z.number().int().min(0).max(10000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      const existing = await prisma.product.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      if (existing.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product is not one of your own products',
        });
      }

      const nameJson = {
        ar: input.nameAr ?? (existing.nameJson as { ar?: string }).ar ?? '',
        en: input.nameEn ?? (existing.nameJson as { en?: string }).en ?? '',
      };
      const descriptionJson = {
        ar: input.descAr ?? (existing.descriptionJson as { ar?: string }).ar ?? '',
        en: input.descEn ?? (existing.descriptionJson as { en?: string }).en ?? '',
      };

      const updated = await prisma.product.update({
        where: { id: input.id },
        data: {
          nameJson,
          descriptionJson,
          price: input.price ?? existing.price,
          stock: input.stock ?? existing.stock,
          emoji: input.emoji ?? existing.emoji,
          categoryId: input.categoryId ?? existing.categoryId,
          imageUrl: input.imageUrl ?? existing.imageUrl,
          images: input.images ?? existing.images,
          lowStockThreshold: input.lowStockThreshold ?? existing.lowStockThreshold,
        },
      });

      return toPortalProduct(updated);
    }),

  /** setDraft — draft products stay in the portal but leave the
   *  storefront (marketplace.products / vendorDetail exclude them). */
  setDraft: customerProcedure
    .input(z.object({ id: z.number().int().positive(), draft: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      const existing = await prisma.product.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      if (existing.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product is not one of your own products',
        });
      }

      const updated = await prisma.product.update({
        where: { id: input.id },
        data: { isDraft: input.draft },
      });
      return toPortalProduct(updated);
    }),

  /**
   * setProductFeatured — C6: the vendor picks which of their own products
   * lead the public storefront profile (vendorDetail orders featured
   * first). Ownership-guarded like every other product mutation.
   */
  setProductFeatured: customerProcedure
    .input(z.object({ id: z.number().int().positive(), featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      const existing = await prisma.product.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      if (existing.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product is not one of your own products',
        });
      }

      const updated = await prisma.product.update({
        where: { id: input.id },
        data: { isFeatured: input.featured },
      });
      return toPortalProduct(updated);
    }),

  /** duplicateProduct — "create similar": copies the catalog fields into a
   *  fresh draft (stock 0, sales 0) so nothing goes live by accident. */
  duplicateProduct: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      const existing = await prisma.product.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      if (existing.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Product is not one of your own products',
        });
      }

      const nameJson = existing.nameJson as { ar?: string; en?: string };
      const copy = await prisma.product.create({
        data: {
          vendorId: existing.vendorId,
          categoryId: existing.categoryId,
          nameJson: {
            ar: `${nameJson.ar ?? ''} (نسخة)`,
            en: `${nameJson.en ?? ''} (copy)`,
          },
          descriptionJson: existing.descriptionJson as unknown as Prisma.InputJsonValue,
          price: existing.price,
          stock: 0,
          sales: 0,
          emoji: existing.emoji,
          imageUrl: existing.imageUrl,
          images: existing.images,
          brand: existing.brand,
          tags: existing.tags,
          attributes: existing.attributes
            ? (existing.attributes as unknown as Prisma.InputJsonValue)
            : undefined,
          isActive: true,
          isDraft: true,
          lowStockThreshold: existing.lowStockThreshold,
        },
      });

      return toPortalProduct(copy);
    }),

  // ---------------------------------------------------------------------------
  // Store plan Phase 1 — store registration state + orders
  // ---------------------------------------------------------------------------

  /** myStore — the caller's store (or null when not registered yet). */
  myStore: customerProcedure.query(async ({ ctx }) => {
    return prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
  }),

  /**
   * updateStoreProfile — C6: the About editor for the public storefront.
   * Bilingual merge into descriptionJson (partial edits keep the other
   * language — same pattern as updateProduct).
   */
  updateStoreProfile: customerProcedure
    .input(
      z.object({
        aboutAr: z.string().optional(),
        aboutEn: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      const existing = (vendor.descriptionJson as { ar?: string; en?: string } | null) ?? {};
      const descriptionJson = {
        ar: input.aboutAr ?? existing.ar ?? '',
        en: input.aboutEn ?? existing.en ?? '',
      };

      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { descriptionJson: descriptionJson as unknown as Prisma.InputJsonValue },
      });
    }),

  /** orders — the store's orders, newest first, cursor-paginated (A5). */
  orders: customerProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) return { items: [], nextCursor: null, total: 0 };

      // A5 — id-desc cursor: stable pagination (createdAt ties can't page).
      const where = {
        vendorId: vendor.id,
        ...(input.cursor ? { id: { lt: input.cursor } } : {}),
      };
      const [orders, total] = await Promise.all([
        prisma.storeOrder.findMany({
          where,
          orderBy: { id: 'desc' },
          take: input.limit + 1, // peek one row for nextCursor
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            // B1 — line-item snapshots for the order drawer.
            items: { orderBy: { id: 'asc' } },
            // B5 — the dispute rides along so the drawer renders it without
            // a second query (1:1 — storeOrderId is unique).
            dispute: true,
          },
        }),
        prisma.storeOrder.count({ where: { vendorId: vendor.id } }),
      ]);
      const hasMore = orders.length > input.limit;
      const page = hasMore ? orders.slice(0, input.limit) : orders;
      return {
        items: page,
        nextCursor: hasMore ? page[page.length - 1]!.id : null,
        total,
      };
    }),

  /** fulfillOrder — mark a store order fulfilled (ownership-guarded).
   *  H0 — the status transition is a conditional update inside the
   *  transaction: concurrent fulfillments serialize on the row lock and only
   *  one accrues the payout; a repeat call with the same idempotency key
   *  returns the fulfilled order instead of failing.
   *  Store plan Phase 3: accrues a PENDING payout — net = total minus the
   *  store's commission rate. */
  fulfillOrder: customerProcedure
    .input(
      z.object({
        orderId: z.number().int().positive(),
        idempotencyKey: z.string().min(8).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      return prisma.$transaction(async (tx) => {
        const order = await tx.storeOrder.findUnique({
          where: { id: input.orderId },
          select: { id: true, vendorId: true, status: true, totalAmount: true },
        });
        if (!order || order.vendorId !== vendor.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }

        // Atomic transition — the WHERE pins the old status, so a concurrent
        // fulfill loses the race cleanly instead of double-accruing.
        const claimed = await tx.storeOrder.updateMany({
          where: { id: input.orderId, status: 'PENDING_FULFILLMENT' },
          data: { status: 'FULFILLED' },
        });

        if (claimed.count === 0) {
          if (input.idempotencyKey) {
            return tx.storeOrder.findUniqueOrThrow({ where: { id: input.orderId } });
          }
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order already fulfilled' });
        }

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

        return tx.storeOrder.findUniqueOrThrow({ where: { id: input.orderId } });
      });
    }),

  /** cancelOrder — cancel a pending store order (ownership-guarded).
   *  B2 — restores stock/sales (reversing the checkout-time decrement in
   *  placeStoreOrders) using the B0 line-item snapshots, and refunds
   *  wallet-paid customers immediately. Online-paid orders stay CANCELLED
   *  with the refund deferred to the live Fatoorah API (B5, user-gated) —
   *  mirroring the dispute refund convention. */
  cancelOrder: customerProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      return prisma.$transaction(async (tx) => {
        const order = await tx.storeOrder.findUnique({
          where: { id: input.orderId },
          select: {
            id: true,
            vendorId: true,
            status: true,
            totalAmount: true,
            customerId: true,
            checkoutId: true,
          },
        });
        if (!order || order.vendorId !== vendor.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }

        // Atomic transition — only PENDING_FULFILLMENT orders can cancel;
        // concurrent cancels/fulfills serialize on the row lock.
        const claimed = await tx.storeOrder.updateMany({
          where: { id: input.orderId, status: 'PENDING_FULFILLMENT' },
          data: { status: 'CANCELLED' },
        });
        if (claimed.count === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order cannot be cancelled' });
        }

        // B2 — restore stock + sales, reversing the checkout-time effects.
        const items = await tx.storeOrderItem.findMany({ where: { orderId: input.orderId } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sales: { decrement: item.quantity },
            },
          });
        }
        await tx.vendor.update({
          where: { id: vendor.id },
          data: { totalSales: { decrement: Number(order.totalAmount) } },
        });

        // Money (audit #3): wallet-paid orders refund the customer
        // immediately. Online-paid orders keep their money with the platform
        // until the live Fatoorah refund API — the settlement run only counts
        // FULFILLED orders, so the deferred refund is not double-paid.
        const checkout = order.checkoutId
          ? await tx.storeCheckout.findUnique({
              where: { id: order.checkoutId },
              select: { method: true },
            })
          : null;
        if (!checkout || checkout.method === 'wallet') {
          const wallet = await tx.wallet.findUnique({ where: { userId: order.customerId } });
          if (wallet) {
            const amount = Number(order.totalAmount);
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: amount } },
            });
            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'CREDIT',
                source: 'REFUND',
                amount,
                description: `Cancelled store order #${order.id}`,
                referenceId: String(order.id),
                idempotencyKey: `store_order_cancel_${order.id}`,
              },
            });
          }
        }

        return tx.storeOrder.findUniqueOrThrow({ where: { id: input.orderId } });
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

  /**
   * myDeals — the store's own deal proposals (any status), enriched with
   * the derived lifecycle (C3): pending / upcoming / active / ended /
   * rejected, the materialized StoreDeal id, and per-deal sales during the
   * window. Submission → deal is matched by the proposal window (productId
   * + startsAt + endsAt — the materialized row copies them, id-desc so a
   * re-proposal of the same window maps to its own row); endDeal only
   * flips isActive, so the match survives an early end.
   */
  myDeals: customerProcedure.query(async ({ ctx }) => {
    const subs = await prisma.providerSubmission.findMany({
      where: { providerId: ctx.user.id, kind: 'store_promotion' },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    return Promise.all(
      subs.map(async (sub) => {
        const p = sub.payload as {
          productId: number;
          startsAt: string;
          endsAt: string;
        };
        const starts = new Date(p.startsAt).getTime();
        const ends = new Date(p.endsAt).getTime();

        const deal = await prisma.storeDeal.findFirst({
          where: {
            productId: p.productId,
            startsAt: new Date(p.startsAt),
            endsAt: new Date(p.endsAt),
          },
          orderBy: { id: 'desc' },
        });

        let lifecycle: 'pending' | 'upcoming' | 'active' | 'ended' | 'rejected';
        if (sub.status === 'PENDING_REVIEW') lifecycle = 'pending';
        else if (sub.status === 'REJECTED') lifecycle = 'rejected';
        else if (deal && !deal.isActive)
          lifecycle = 'ended'; // ended early
        else if (now < starts) lifecycle = 'upcoming';
        else if (now > ends) lifecycle = 'ended';
        else lifecycle = 'active';

        // C3 — per-deal sales: order items for the product whose order was
        // created inside the deal window.
        let salesInWindow = 0;
        if (deal) {
          const agg = await prisma.storeOrderItem.aggregate({
            where: {
              productId: p.productId,
              order: { createdAt: { gte: deal.startsAt, lte: deal.endsAt } },
            },
            _sum: { quantity: true },
          });
          salesInWindow = agg._sum.quantity ?? 0;
        }

        return { ...sub, lifecycle, dealId: deal?.id ?? null, salesInWindow };
      }),
    );
  }),

  /**
   * endDeal — the owner ends one of their active deals early. The window
   * dates stay untouched (myDeals matches submissions to deals by window),
   * only isActive flips — which also drops the deal from the public
   * listing, since marketplace.products filters on isActive + window.
   */
  endDeal: customerProcedure
    .input(z.object({ dealId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' });
      }

      const deal = await prisma.storeDeal.findUnique({ where: { id: input.dealId } });
      if (!deal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' });
      }
      if (deal.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Deal is not one of your own deals',
        });
      }
      if (!deal.isActive) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deal already ended' });
      }

      return prisma.storeDeal.update({
        where: { id: deal.id },
        data: { isActive: false },
      });
    }),

  /**
   * editPendingDeal — tweak the window/price of a proposal that the admin
   * has not decided yet. Same guardrails as proposeDeal (under the regular
   * price, at/above the 40% floor, endsAt after startsAt).
   */
  editPendingDeal: customerProcedure
    .input(
      z.object({
        submissionId: z.number().int().positive(),
        dealPrice: z.number().positive().optional(),
        endsAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.providerSubmission.findUnique({
        where: { id: input.submissionId },
      });
      if (!sub || sub.kind !== 'store_promotion') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal proposal not found' });
      }
      if (sub.providerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Deal proposal is not one of your own',
        });
      }
      if (sub.status !== 'PENDING_REVIEW') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Submission already decided' });
      }

      const p = sub.payload as {
        productId: number;
        originalPrice: number;
        dealPrice: number;
        startsAt: string;
        endsAt: string;
      };
      const dealPrice = input.dealPrice ?? p.dealPrice;
      const endsAt = input.endsAt ?? p.endsAt;

      const originalPrice = Number(p.originalPrice);
      const floor = (originalPrice * 40) / 100;
      if (dealPrice >= originalPrice) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Deal price must be lower than the regular price',
        });
      }
      if (dealPrice < floor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Deal price below the 40% floor (${floor} SAR)`,
        });
      }
      if (new Date(endsAt) <= new Date(p.startsAt)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'endAt must be after startAt',
        });
      }

      return prisma.providerSubmission.update({
        where: { id: sub.id },
        data: {
          payload: { ...p, dealPrice, endsAt } as unknown as Prisma.InputJsonValue,
        },
      });
    }),

  /**
   * earnings — B4 statement view: summary cards (pending/processed net +
   * total fees, commissionRate visible) and payout rows with gross =
   * net + fee. Reuses the Phase 3 payout rows; `payouts.listStorePayouts`
   * stays the paginated/filtered surface for heavier histories.
   */
  earnings: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) {
      return {
        commissionRate: 0,
        summary: { pendingNet: 0, processedNet: 0, totalFee: 0 },
        rows: [],
      };
    }

    const payouts = await prisma.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    let pendingNet = 0;
    let processedNet = 0;
    let totalFee = 0;
    const rows = payouts.map((p) => {
      const net = Number(p.amount);
      const fee = Number(p.fee);
      totalFee += fee;
      if (p.status === 'COMPLETED') processedNet += net;
      else pendingNet += net;
      return {
        id: p.id,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        gross: net + fee,
        net,
        fee,
        status: p.status,
        reference: p.reference,
        processedAt: p.processedAt,
      };
    });

    return {
      commissionRate: Number(vendor.commissionRate),
      summary: { pendingNet, processedNet, totalFee },
      rows,
    };
  }),

  /**
   * earningsCsv — B4 statement download with bilingual headers (RFC 4180
   * quoting for values containing commas/quotes/newlines).
   */
  earningsCsv: customerProcedure
    .input(z.object({ locale: z.enum(['ar', 'en']).default('en') }))
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      const payouts = vendor
        ? await prisma.payout.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
          })
        : [];

      const headers =
        input.locale === 'ar'
          ? ['بداية الفترة', 'نهاية الفترة', 'الإجمالي', 'الرسوم', 'الصافي', 'الحالة', 'المرجع']
          : ['Period start', 'Period end', 'Gross', 'Fee', 'Net', 'Status', 'Reference'];

      const esc = (v: string | number) => {
        const s = String(v);
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = payouts.map((p) =>
        [
          p.periodStart.toISOString().slice(0, 10),
          p.periodEnd.toISOString().slice(0, 10),
          (Number(p.amount) + Number(p.fee)).toFixed(2),
          Number(p.fee).toFixed(2),
          Number(p.amount).toFixed(2),
          p.status,
          esc(p.reference ?? ''),
        ].join(','),
      );

      return { csv: [headers.join(','), ...lines].join('\r\n') };
    }),

  // ---------------------------------------------------------------------------
  // E2 — medical clinics dashboard (same provider shell)
  // ---------------------------------------------------------------------------

  /** myClinic — the caller's clinic (null unless type CLINIC). */
  myClinic: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    return vendor && vendor.type === 'CLINIC' ? vendor : null;
  }),

  /** setConsultationPrice — the clinic's per-visit consultation fee. */
  setConsultationPrice: customerProcedure
    .input(z.object({ price: z.number().min(0).max(100000) }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { consultationPrice: input.price },
      });
    }),

  /** clinicSlots.add — open a consultation slot for the clinic. */
  'clinicSlots.add': customerProcedure
    .input(z.object({ startAt: z.string().datetime(), endAt: z.string().datetime() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      if (new Date(input.endAt) <= new Date(input.startAt)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'endAt must be after startAt' });
      }
      return prisma.clinicSlot.create({
        data: {
          clinicId: vendor.id,
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
        },
      });
    }),

  /** clinicSlots.remove — drop an unbooked slot (own clinic). */
  'clinicSlots.remove': customerProcedure
    .input(z.object({ slotId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      await prisma.clinicSlot.deleteMany({
        where: { id: input.slotId, clinicId: vendor.id, isBooked: false },
      });
      return { success: true };
    }),

  /** clinicSlots.list — the clinic's own upcoming slots. */
  'clinicSlots.list': customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'CLINIC') return [];

    return prisma.clinicSlot.findMany({
      where: { clinicId: vendor.id },
      orderBy: { startAt: 'asc' },
    });
  }),

  /** clinicConsultations — incoming consultations (own clinic). */
  clinicConsultations: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'CLINIC') return [];

    return prisma.clinicConsultation.findMany({
      where: { clinicId: vendor.id },
      include: { customer: { select: { id: true, name: true, phone: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }),

  /** confirmConsultation — clinic accepts a REQUESTED consultation. */
  confirmConsultation: customerProcedure
    .input(z.object({ consultationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      const consultation = await prisma.clinicConsultation.findUnique({
        where: { id: input.consultationId },
      });
      if (!consultation || consultation.clinicId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Consultation not found' });
      }
      if (consultation.status !== 'REQUESTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Consultation already decided' });
      }

      const updated = await prisma.clinicConsultation.update({
        where: { id: input.consultationId },
        data: { status: 'CONFIRMED' },
      });

      try {
        await notifyUser({
          userId: consultation.customerId,
          templateKey: 'consultation_confirmed',
          vars: {
            clinicName: vendor.storeName,
            when: consultation.scheduledAt.toISOString().slice(0, 16),
            code: consultation.code,
          },
        });
      } catch {
        // Notification failure must never fail the confirmation.
      }
      return updated;
    }),

  /** clinicCancelConsultation — clinic rejects a REQUESTED consultation. */
  clinicCancelConsultation: customerProcedure
    .input(z.object({ consultationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      const consultation = await prisma.clinicConsultation.findUnique({
        where: { id: input.consultationId },
      });
      if (!consultation || consultation.clinicId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Consultation not found' });
      }
      if (consultation.status !== 'REQUESTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Consultation already decided' });
      }

      return prisma.$transaction(async (tx) => {
        const updated = await tx.clinicConsultation.update({
          where: { id: input.consultationId },
          data: { status: 'CANCELLED' },
        });
        await tx.clinicSlot.updateMany({
          where: { consultationId: input.consultationId },
          data: { isBooked: false, consultationId: null },
        });
        try {
          await notifyUser({
            userId: consultation.customerId,
            templateKey: 'consultation_cancelled',
            vars: {
              clinicName: vendor.storeName,
              when: consultation.scheduledAt.toISOString().slice(0, 16),
              code: consultation.code,
            },
          });
        } catch {
          // Notification failure must never fail the cancellation.
        }
        return updated;
      });
    }),

  // ---------------------------------------------------------------------------
  // E3 — gym dashboard (same provider shell)
  // ---------------------------------------------------------------------------

  /** myGym — the caller's gym (null unless type GYM). */
  myGym: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    return vendor && vendor.type === 'GYM' ? vendor : null;
  }),

  /** gymClasses.add — schedule a capacity-based class. */
  'gymClasses.add': customerProcedure
    .input(
      z.object({
        nameAr: z.string().min(2),
        nameEn: z.string().min(2),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        capacity: z.number().int().min(1).max(100),
        price: z.number().min(0).max(100000).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'GYM') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
      }
      if (new Date(input.endsAt) <= new Date(input.startsAt)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'endAt must be after startAt' });
      }
      return prisma.gymClass.create({
        data: {
          gymId: vendor.id,
          nameJson: { ar: input.nameAr, en: input.nameEn },
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          capacity: input.capacity,
          price: input.price,
        },
      });
    }),

  /** gymClasses.remove — delete an un-enrolled class (own gym). */
  'gymClasses.remove': customerProcedure
    .input(z.object({ classId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'GYM') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
      }
      await prisma.gymClass.deleteMany({
        where: { id: input.classId, gymId: vendor.id, enrolledCount: 0 },
      });
      return { success: true };
    }),

  /** gymClasses.list — the gym's own upcoming classes. */
  'gymClasses.list': customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'GYM') return [];

    return prisma.gymClass.findMany({
      where: { gymId: vendor.id },
      orderBy: { startsAt: 'asc' },
    });
  }),

  /** gymClassBookings — incoming bookings (own gym). */
  gymClassBookings: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'GYM') return [];

    return prisma.gymClassBooking.findMany({
      where: { class: { gymId: vendor.id } },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        class: { select: { nameJson: true, startsAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // ── E5 — nail bars ──────────────────────────────────────

  /** setTrustFlags — E6d: the vendor toggles its own trust badges. */
  setTrustFlags: customerProcedure
    .input(
      z.object({
        womenOnlyStaff: z.boolean().optional(),
        privateSuite: z.boolean().optional(),
        // K3 (kids plan, W9) — child-friendly corner in salons.
        childFriendlyCorner: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'FORBIDDEN', message: 'Vendor not found' });
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          ...(input.womenOnlyStaff !== undefined ? { womenOnlyStaff: input.womenOnlyStaff } : {}),
          ...(input.privateSuite !== undefined ? { privateSuite: input.privateSuite } : {}),
          ...(input.childFriendlyCorner !== undefined
            ? { childFriendlyCorner: input.childFriendlyCorner }
            : {}),
        },
      });
    }),

  /** setBanner — E7 follow-up: the venue's hero banner (null clears it). */
  setBanner: customerProcedure
    .input(z.object({ bannerUrl: z.string().url().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) throw new TRPCError({ code: 'FORBIDDEN', message: 'Vendor not found' });
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { bannerUrl: input.bannerUrl },
      });
    }),

  /** myNailBar — the caller's nail bar (null unless type NAIL_BAR). */
  myNailBar: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    return vendor && vendor.type === 'NAIL_BAR' ? vendor : null;
  }),

  /** nailBarSlots.add — open a station-capacity slot for the nail bar. */
  'nailBarSlots.add': customerProcedure
    .input(
      z.object({
        startAt: z.string().datetime(),
        endAt: z.string().datetime(),
        capacity: z.number().int().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'NAIL_BAR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Nail bar not found' });
      }
      if (new Date(input.endAt) <= new Date(input.startAt)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'endAt must be after startAt' });
      }
      return prisma.nailBarSlot.create({
        data: {
          nailBarId: vendor.id,
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
          capacity: input.capacity,
        },
      });
    }),

  /** nailBarSlots.remove — delete an empty slot (own nail bar). */
  'nailBarSlots.remove': customerProcedure
    .input(z.object({ slotId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'NAIL_BAR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Nail bar not found' });
      }
      await prisma.nailBarSlot.deleteMany({
        where: { id: input.slotId, nailBarId: vendor.id, bookedCount: 0 },
      });
      return { success: true };
    }),

  /** nailBarSlots.list — the nail bar's own upcoming slots. */
  'nailBarSlots.list': customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'NAIL_BAR') return [];

    return prisma.nailBarSlot.findMany({
      where: { nailBarId: vendor.id },
      orderBy: { startAt: 'asc' },
    });
  }),

  /** nailBarBookings — incoming station bookings (own nail bar). */
  nailBarBookings: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'NAIL_BAR') return [];

    const bookings = await prisma.nailBarBooking.findMany({
      where: { slot: { nailBarId: vendor.id } },
      orderBy: { createdAt: 'desc' },
    });
    // No relation fields on NailBarBooking — join manually.
    const users = await prisma.user.findMany({
      where: { id: { in: bookings.map((b) => b.customerId) } },
      select: { id: true, name: true, phone: true },
    });
    const slots = await prisma.nailBarSlot.findMany({
      where: { id: { in: bookings.map((b) => b.slotId) } },
      select: { id: true, nailBarId: true, startAt: true, endAt: true },
    });
    return bookings.map((b) => ({
      ...b,
      customer: users.find((u) => u.id === b.customerId) ?? null,
      slot: slots.find((s) => s.id === b.slotId) ?? null,
    }));
  }),

  // ── E5 — at-home salons ─────────────────────────────────

  /** myAthomeSalon — the caller's at-home salon (null unless type ATHOME). */
  myAthomeSalon: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    return vendor && vendor.type === 'ATHOME' ? vendor : null;
  }),

  /** homeRequests.list — requests assigned to the caller's ATHOME vendor. */
  'homeRequests.list': customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'ATHOME') return [];

    const requests = await prisma.homeServiceRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
    // homeServiceRequest has no relation fields — join manually.
    const users = await prisma.user.findMany({
      where: { id: { in: requests.map((r) => r.userId) } },
      select: { id: true, name: true, phone: true },
    });
    const services = await prisma.service.findMany({
      where: { id: { in: requests.map((r) => r.serviceId) } },
      select: { id: true, titleJson: true },
    });
    return requests.map((r) => ({
      ...r,
      customer: users.find((u) => u.id === r.userId) ?? null,
      service: services.find((s) => s.id === r.serviceId) ?? null,
    }));
  }),

  /** homeRequests.complete — mark an assigned request COMPLETED (own vendor). */
  'homeRequests.complete': customerProcedure
    .input(z.object({ requestId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'ATHOME') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'At-home salon not found' });
      }
      const request = await prisma.homeServiceRequest.findFirst({
        where: { id: input.requestId, vendorId: vendor.id },
      });
      if (!request) throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
      if (request.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request already completed' });
      }
      return prisma.homeServiceRequest.update({
        where: { id: input.requestId },
        data: { status: 'COMPLETED' },
      });
    }),

  /** gymCancelBooking — gym cancels a member's BOOKED seat. */
  gymCancelBooking: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'GYM') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
      }
      const booking = await prisma.gymClassBooking.findUnique({
        where: { id: input.bookingId },
        include: { class: true },
      });
      if (!booking || booking.class.gymId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }
      if (booking.status !== 'BOOKED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking already cancelled' });
      }

      return prisma.$transaction(async (tx) => {
        const updated = await tx.gymClassBooking.update({
          where: { id: input.bookingId },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        await tx.gymClass.update({
          where: { id: booking.classId },
          data: { enrolledCount: { decrement: 1 } },
        });
        return updated;
      });
    }),
});

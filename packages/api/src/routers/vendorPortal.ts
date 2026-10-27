import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';
import { notifyUser } from '../lib/notify';
import { getCsvImportQueue } from '../queues';
// D1 gotcha: value-import from '../workers/handlers' (side-effect free) —
// importing from '../workers' would evaluate the BullMQ worker instances
// (real Redis connections) inside the web build's page-data workers.
import type { CsvImportReport } from '../workers/handlers';
import { noonUtcDay, advisorRulesForVendor } from '../workers/handlers';
import { KSA_SEASONS, seasonMarkers } from '../lib/ksaCalendar';
import { computeStoreHealthScore, gatherStoreHealthFactors } from '../lib/storeHealth';
import { forecastFromSales, type StockForecast } from '../lib/stockForecast';
import { weekBucketStart, weeklyTrendLabels } from '../lib/reviewTrend';
import { requestProductReviews } from '../lib/storeReviewRequests';

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

/** E4 — map a ProductReview row to the vendor-portal UI shape. */
function toReviewRow(r: {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  replyJson: unknown;
  repliedAt: Date | null;
  product: { id: number; nameJson: unknown };
  user: { name: string | null };
}) {
  const reply = (r.replyJson as { ar?: string; en?: string } | null) ?? {};
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? '',
    createdAt: r.createdAt.toISOString(),
    replied: r.repliedAt !== null,
    repliedAt: r.repliedAt?.toISOString() ?? null,
    replyAr: reply.ar ?? '',
    replyEn: reply.en ?? '',
    productId: r.product.id,
    productNameAr:
      (r.product.nameJson as { ar?: string } | undefined)?.ar ?? `منتج #${r.product.id}`,
    customerName: r.user.name ?? 'عميل',
  };
}

// ── A1 store staff accounts ──────────────────────────────────────────
// (VENDOR_PROFESSIONALIZATION_PLAN Wave A). The role-less ownership
// invariant governs: staff are CUSTOMER-role users linked to a vendor
// via VendorStaff — a capability list, never a UserRole.

/** Capability strings stored in VendorStaff.permissions. */
export const STAFF_CAPABILITIES = [
  'ORDERS_MANAGE',
  'PRODUCTS_MANAGE',
  'COUPONS_MANAGE',
  'DEALS_MANAGE',
  'REVIEWS_MANAGE',
  'PAYOUTS_VIEW',
  'CUSTOMERS_VIEW',
  'ANALYTICS_VIEW',
  'STAFF_MANAGE',
] as const;

type StaffCapability = (typeof STAFF_CAPABILITIES)[number];

type VendorActor =
  | { kind: 'owner'; vendor: { id: number; userId: number; storeName: string; storeSlug: string } }
  | {
      kind: 'staff';
      vendor: { id: number; userId: number; storeName: string; storeSlug: string };
      staff: { id: number; role: string; permissions: string[] };
    }
  | null;

/** The caller's relationship to a vendor: owner (Vendor row) or ACTIVE staff. */
async function resolveVendorActor(userId: number): Promise<VendorActor> {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (vendor) return { kind: 'owner', vendor };
  const staff = await prisma.vendorStaff.findUnique({
    where: { userId },
    include: { vendor: true },
  });
  if (staff && staff.status === 'ACTIVE') {
    return { kind: 'staff', vendor: staff.vendor, staff };
  }
  return null;
}

function staffHasCapability(actor: VendorActor, cap: StaffCapability): boolean {
  if (!actor) return false;
  if (actor.kind === 'owner') return true;
  if (actor.staff.role === 'MANAGER') return true;
  return actor.staff.permissions.includes(cap);
}

/** Resolve the actor and require STAFF_MANAGE (owners always pass). */
async function requireStaffManager(userId: number) {
  const actor = await resolveVendorActor(userId);
  if (!actor) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a store owner or staff member' });
  }
  if (!staffHasCapability(actor, 'STAFF_MANAGE')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Staff management requires STAFF_MANAGE' });
  }
  return actor;
}

/**
 * A1 — staff-scoped vendor lookup. Owners and ACTIVE staff resolve to the
 * same Vendor row; an optional capability gates staff (owners pass always,
 * MANAGER role passes implicitly). Non-vendors get NOT_FOUND — the same
 * signal the old per-procedure lookups produced for owner-less callers.
 */
async function vendorForStaff(ctx: { user: { id: number } | null }, capability?: StaffCapability) {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Login required' });
  }
  const actor = await resolveVendorActor(ctx.user.id);
  if (!actor) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
  }
  if (capability && !staffHasCapability(actor, capability)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: `Requires ${capability}` });
  }
  return prisma.vendor.findUniqueOrThrow({ where: { id: actor.vendor.id } });
}

/**
 * A1 — the QUERY variant: owner-less callers keep the legacy empty-shape
 * contract (the portal renders zeroes for them), staff are capability-
 * gated (FORBIDDEN), owners and capable staff get the row. Returns null
 * for owner-less callers so each query can render its own legacy shape.
 */
async function vendorForStaffQuery(
  ctx: { user: { id: number } | null },
  capability?: StaffCapability,
) {
  const actor = await resolveVendorActor(ctx.user?.id ?? -1);
  if (!actor) return null;
  if (capability && !staffHasCapability(actor, capability)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: `Requires ${capability}` });
  }
  return prisma.vendor.findUnique({ where: { id: actor.vendor.id } });
}

/** Vendor-scoped audit row — every staff-management mutation logs here. */
async function logStaffAction(
  vendorId: number,
  actorUserId: number | null,
  action: string,
  targetId: number,
  metadata?: Record<string, unknown>,
) {
  await prisma.staffActivityLog.create({
    data: {
      vendorId,
      actorUserId,
      action,
      targetType: 'VendorStaff',
      targetId: String(targetId),
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** The client-facing staff row shape (email+name are owner-visible only). */
function staffRowShape(
  row: { id: number; role: string; permissions: string[]; status: string; createdAt: Date },
  user: { id: number; name: string; email: string; avatarUrl: string | null },
) {
  return {
    id: row.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: row.role,
    permissions: row.permissions,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export const vendorPortalRouter = router({
  dashboard: customerProcedure.query(async ({ ctx }) => {
    const vendor = await vendorForStaffQuery(ctx);

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

    // A3 — fulfillment SLA: 30-day breach count + on-time rate over the
    // fulfilled orders (fulfilledAt within the vendor's promised window).
    const slaWindowMs = vendor.fulfillmentSlaHours * 3_600_000;
    const breachedOrders = await prisma.storeOrder.findMany({
      where: {
        vendorId: vendor.id,
        slaBreachedAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, fulfilledAt: true, slaBreachedAt: true },
    });
    const fulfilledOrders = await prisma.storeOrder.findMany({
      where: {
        vendorId: vendor.id,
        status: 'FULFILLED',
        fulfilledAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, fulfilledAt: true },
    });
    const onTime = fulfilledOrders.filter(
      (o) => o.fulfilledAt!.getTime() - o.createdAt.getTime() <= slaWindowMs,
    ).length;
    const sla = {
      breached30d: breachedOrders.length,
      onTimeRate: fulfilledOrders.length
        ? Math.round((onTime / fulfilledOrders.length) * 100)
        : 100,
      windowHours: vendor.fulfillmentSlaHours,
    };

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
      // D2 — store health score (0–100) + top improvement hints.
      health: computeStoreHealthScore(await gatherStoreHealthFactors(prisma, vendor.id)),
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        nameAr: (p.nameJson as { ar?: string }).ar ?? '',
        nameEn: (p.nameJson as { en?: string }).en ?? '',
        stock: p.stock,
        threshold: p.lowStockThreshold,
      })),
      // A3 — fulfillment SLA metrics for the Overview card.
      sla,
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
      const vendor = await vendorForStaffQuery(ctx, 'PRODUCTS_MANAGE');
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
      // A1: staff are capability-gated; owner-less callers keep the legacy
      // B.3 auto-create path (minimal vendor row on first product).
      const actor = await resolveVendorActor(ctx.user.id);
      let vendor;
      if (actor) {
        if (!staffHasCapability(actor, 'PRODUCTS_MANAGE')) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Requires PRODUCTS_MANAGE' });
        }
        vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: actor.vendor.id } });
      } else {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: { name: true },
        });
        vendor = await ensureVendor(ctx.user.id, user?.name ?? '');
      }

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
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');

      // Ownership-guarded soft delete.
      await prisma.product.updateMany({
        where: { id: input.id, vendorId: vendor.id },
        data: { isActive: false },
      });
      return { success: true };
    }),

  // C1 — product variants (Wave C)
  // ---------------------------------------------------------------------------

  /** variants — the caller's variants for one of their products. */
  variants: customerProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const vendor = await vendorForStaffQuery(ctx, 'PRODUCTS_MANAGE');
      if (!vendor) return [];
      const product = await prisma.product.findFirst({
        where: { id: input.productId, vendorId: vendor.id },
        select: { id: true },
      });
      if (!product) return [];
      return prisma.productVariant.findMany({
        where: { productId: input.productId },
        orderBy: { id: 'asc' },
      });
    }),

  /** addVariant — create a size/shade/pack option. Ownership-guarded via
   *  the product; the price delta must keep the final price non-negative. */
  addVariant: customerProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        nameAr: z.string().min(1).max(120),
        nameEn: z.string().min(1).max(120),
        sku: z.string().max(60).optional(),
        priceDelta: z.number().default(0),
        stock: z.number().int().min(0).default(0),
        lowStockThreshold: z.number().int().min(1).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');
      const product = await prisma.product.findFirst({
        where: { id: input.productId, vendorId: vendor.id },
        select: { id: true, price: true },
      });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

      if (Number(product.price) + input.priceDelta < 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Price delta below product price' });
      }

      return prisma.productVariant.create({
        data: {
          productId: input.productId,
          nameJson: { ar: input.nameAr, en: input.nameEn },
          sku: input.sku,
          priceDelta: input.priceDelta,
          stock: input.stock,
          lowStockThreshold: input.lowStockThreshold,
        },
      });
    }),

  /** updateVariant — partial edit; nameJson merges per language. */
  updateVariant: customerProcedure
    .input(
      z.object({
        variantId: z.number().int().positive(),
        nameAr: z.string().min(1).max(120).optional(),
        nameEn: z.string().min(1).max(120).optional(),
        sku: z.string().max(60).optional(),
        priceDelta: z.number().optional(),
        stock: z.number().int().min(0).optional(),
        lowStockThreshold: z.number().int().min(1).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');
      const variant = await prisma.productVariant.findFirst({
        where: { id: input.variantId, product: { vendorId: vendor.id } },
        include: { product: { select: { price: true } } },
      });
      if (!variant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Variant not found' });

      if (input.priceDelta !== undefined && Number(variant.product.price) + input.priceDelta < 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Price delta below product price' });
      }

      const existing = (variant.nameJson as { ar?: string; en?: string } | null) ?? {};
      return prisma.productVariant.update({
        where: { id: input.variantId },
        data: {
          nameJson: {
            ar: input.nameAr ?? existing.ar ?? '',
            en: input.nameEn ?? existing.en ?? '',
          },
          sku: input.sku,
          priceDelta: input.priceDelta,
          stock: input.stock,
          lowStockThreshold: input.lowStockThreshold,
          isActive: input.isActive,
        },
      });
    }),

  /** deleteVariant — hard delete (cart lines cascade; order items keep
   *  their snapshots via SetNull). */
  deleteVariant: customerProcedure
    .input(z.object({ variantId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');
      const deleted = await prisma.productVariant.deleteMany({
        where: { id: input.variantId, product: { vendorId: vendor.id } },
      });
      if (deleted.count === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Variant not found' });
      }
      return { success: true };
    }),
  // ---------------------------------------------------------------------------
  // C2 — inventory v2 (Wave C)
  // ---------------------------------------------------------------------------

  /** bulkStockUpdate — spreadsheet-style stock editor. All-or-nothing: a
   *  foreign product in the batch rejects the WHOLE batch (NOT_FOUND), so
   *  a mixed selection can never half-apply. */
  bulkStockUpdate: customerProcedure
    .input(
      z.object({
        updates: z
          .array(
            z.object({ productId: z.number().int().positive(), stock: z.number().int().min(0) }),
          )
          .min(1)
          .max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');
      const ids = input.updates.map((u) => u.productId);
      const owned = await prisma.product.count({
        where: { id: { in: ids }, vendorId: vendor.id },
      });
      if (owned !== ids.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'One or more products not found' });
      }
      await prisma.$transaction(
        input.updates.map((u) =>
          prisma.product.update({ where: { id: u.productId }, data: { stock: u.stock } }),
        ),
      );
      return input.updates;
    }),

  /** stockForecasts — 30-day sales velocity + days-at-stock per product
   *  from VendorDailyStat.productSales. Foreign ids are ignored (the UI
   *  sends only its own rows). */
  stockForecasts: customerProcedure
    .input(z.object({ productIds: z.array(z.number().int().positive()).min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const vendor = await vendorForStaffQuery(ctx, 'PRODUCTS_MANAGE');
      if (!vendor) return {};
      const owned = await prisma.product.findMany({
        where: { id: { in: input.productIds }, vendorId: vendor.id },
        select: { id: true, stock: true },
      });
      if (owned.length === 0) return {};

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const stats = await prisma.vendorDailyStat.findMany({
        where: { vendorId: vendor.id, day: { gte: since } },
        select: { productSales: true },
      });
      const quantities = new Map<number, number>();
      for (const row of stats) {
        const sales = (row.productSales as Array<{ productId?: number; quantity?: number }>) ?? [];
        for (const sale of sales) {
          if (sale.productId) {
            quantities.set(
              sale.productId,
              (quantities.get(sale.productId) ?? 0) + (sale.quantity ?? 0),
            );
          }
        }
      }
      const forecasts: Record<number, StockForecast> = {};
      for (const p of owned) {
        // The helper divides by the 30-day window — passing the summed
        // quantity is equivalent to summing per-day quantities.
        forecasts[p.id] = forecastFromSales([quantities.get(p.id) ?? 0], p.stock);
      }
      return forecasts;
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
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');

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
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');

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
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');

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
      const vendor = await vendorForStaff(ctx, 'PRODUCTS_MANAGE');

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

  /** myStore — the caller's store (or null when not registered yet).
   *  A1: staff members resolve to their vendor too — the shell routes
   *  them to the portal instead of the registration wizard. */
  myStore: customerProcedure.query(async ({ ctx }) => {
    const actor = await resolveVendorActor(ctx.user.id);
    if (!actor) return null;
    return prisma.vendor.findUnique({ where: { id: actor.vendor.id } });
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
      const vendor = await vendorForStaffQuery(ctx, 'ORDERS_MANAGE');
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

  /** orderDetail — one store order with line items, customer summary and
   *  its dispute (1:1). E2: the mobile detail screen and the push-notification
   *  deep link fetch by id (the web drawer reuses the list row instead).
   *  Staff-guarded exactly like orders — ORDERS_MANAGE. */
  orderDetail: customerProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const vendor = await vendorForStaffQuery(ctx, 'ORDERS_MANAGE');
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });

      const order = await prisma.storeOrder.findUnique({
        where: { id: input.orderId },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          items: { orderBy: { id: 'asc' } },
          dispute: true,
        },
      });
      // Cross-store reads must be indistinguishable from missing rows.
      if (!order || order.vendorId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }
      return order;
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
      const vendor = await vendorForStaff(ctx, 'ORDERS_MANAGE');

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.storeOrder.findUnique({
          where: { id: input.orderId },
          select: { id: true, vendorId: true, status: true, totalAmount: true, customerId: true },
        });
        if (!order || order.vendorId !== vendor.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }

        // Atomic transition — the WHERE pins the old status, so a concurrent
        // fulfill loses the race cleanly instead of double-accruing.
        // A3 — fulfilledAt feeds the SLA on-time rate.
        const claimed = await tx.storeOrder.updateMany({
          where: { id: input.orderId, status: 'PENDING_FULFILLMENT' },
          data: { status: 'FULFILLED', fulfilledAt: new Date() },
        });

        if (claimed.count === 0) {
          if (input.idempotencyKey) {
            // Idempotent re-fulfill: return the current row, no re-accrual,
            // and no review-request re-emission (items: []).
            return {
              order: await tx.storeOrder.findUniqueOrThrow({ where: { id: input.orderId } }),
              customerId: order.customerId,
              items: [],
            };
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

        return {
          order: await tx.storeOrder.findUniqueOrThrow({ where: { id: input.orderId } }),
          customerId: order.customerId,
          items: await tx.storeOrderItem.findMany({
            where: { orderId: input.orderId },
            select: { productId: true },
          }),
        };
      });

      // F5 — post-fulfillment review requests (post-commit, swallowed).
      try {
        await requestProductReviews({
          customerId: result.customerId,
          vendorId: vendor.id,
          items: result.items,
        });
      } catch {
        // Never fail fulfillment on review-request errors.
      }
      return result.order;
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
      const vendor = await vendorForStaff(ctx, 'ORDERS_MANAGE');

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
      // A2 — payout automation state for the schedule card.
      payoutSchedule: vendor.payoutSchedule,
      lastPayoutRunAt: vendor.lastPayoutRunAt?.toISOString() ?? null,
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

  /**
   * D4 — one-click CSV exports (orders / products / analytics), same
   * bilingual-headers + RFC 4180 + toFixed(2) discipline as earningsCsv.
   */
  exportCsv: customerProcedure
    .input(
      z.object({
        kind: z.enum(['orders', 'products', 'analytics']),
        locale: z.enum(['ar', 'en']).default('en'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      const esc = (v: string | number) => {
        const s = String(v);
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const ar = input.locale === 'ar';
      if (!vendor) return { csv: '' };

      if (input.kind === 'orders') {
        const orders = await prisma.storeOrder.findMany({
          where: { vendorId: vendor.id },
          orderBy: { id: 'asc' },
          include: { customer: { select: { name: true } } },
        });
        const headers = ar
          ? ['رقم الطلب', 'التاريخ', 'الحالة', 'الإجمالي', 'المنتجات', 'العميل']
          : ['Order', 'Date', 'Status', 'Total', 'Items', 'Customer'];
        const lines = orders.map((o) =>
          [
            o.id,
            o.createdAt.toISOString().slice(0, 10),
            o.status,
            Number(o.totalAmount).toFixed(2),
            o.itemCount,
            esc(o.customer?.name ?? ''),
          ].join(','),
        );
        return { csv: [headers.join(','), ...lines].join('\r\n') };
      }

      if (input.kind === 'products') {
        const products = await prisma.product.findMany({
          where: { vendorId: vendor.id },
          orderBy: { id: 'asc' },
        });
        const headers = ar
          ? ['المنتج (ع)', 'المنتج (EN)', 'السعر', 'المخزون', 'المبيعات', 'مسودة']
          : ['Product (AR)', 'Product (EN)', 'Price', 'Stock', 'Sales', 'Draft'];
        const lines = products.map((p) =>
          [
            esc((p.nameJson as { ar?: string }).ar ?? ''),
            esc((p.nameJson as { en?: string }).en ?? ''),
            Number(p.price).toFixed(2),
            p.stock,
            p.sales,
            p.isDraft ? 'yes' : '',
          ].join(','),
        );
        return { csv: [headers.join(','), ...lines].join('\r\n') };
      }

      // analytics — the 90-day read-model series.
      const { noonUtcDay } = await import('../workers/handlers');
      const since = noonUtcDay(new Date(Date.now() - 90 * 86_400_000));
      const rows = await prisma.vendorDailyStat.findMany({
        where: { vendorId: vendor.id, day: { gte: since } },
        orderBy: { day: 'asc' },
      });
      const headers = ar
        ? ['اليوم', 'الإيرادات', 'الطلبات', 'متوسط الطلب', 'جدد', 'عائدون']
        : ['Day', 'Revenue', 'Orders', 'AOV', 'New', 'Returning'];
      const lines = rows.map((r) =>
        [
          r.day.toISOString().slice(0, 10),
          Number(r.revenue).toFixed(2),
          r.orders,
          Number(r.aov).toFixed(2),
          r.newCustomers,
          r.returningCustomers,
        ].join(','),
      );
      return { csv: [headers.join(','), ...lines].join('\r\n') };
    }),

  /**
   * dealTemplates — D5: the current Gregorian year's KSA season windows
   * as prefilled propose-deal templates (Ramadan / the two Eids /
   * National Day) — feeds the C3 deals studio.
   */
  dealTemplates: customerProcedure.query(async () => {
    const year = new Date().getUTCFullYear();
    return (KSA_SEASONS[year] ?? []).map((w) => ({
      type: w.type,
      titleAr: w.titleAr,
      titleEn: w.titleEn,
      startsAt: `${w.startsAt}T12:00:00Z`,
      endsAt: `${w.endsAt}T23:59:59Z`,
    }));
  }),

  /**
   * advisor — D3: rule-based store advisor (no LLM in v1). Restock
   * suggestions, expired-deal nudges, weekend-peak hints and AOV-drop
   * flags, ordered by priority — rendered as the Overview advisor card.
   */
  advisor: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) return [];
    return advisorRulesForVendor(vendor.id);
  }),

  // ---------------------------------------------------------------------------
  // D1 — vendor analytics center (read-model series)
  // ---------------------------------------------------------------------------

  /**
   * analyticsSeries — D1: the portal reads ONLY the materialized
   * VendorDailyStat rows (no live order aggregation). Returns the
   * 7/30/90-day daily series (NOON-UTC buckets) + top products across
   * the window, aggregated from the per-day productSales snapshots.
   */
  analyticsSeries: customerProcedure
    .input(z.object({ days: z.number().int().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) return { series: [], topProducts: [] };

      const since = noonUtcDay(new Date(Date.now() - input.days * 24 * 3600_000));
      const rows = await prisma.vendorDailyStat.findMany({
        where: { vendorId: vendor.id, day: { gte: since } },
        orderBy: { day: 'asc' },
      });

      const prodMap = new Map<
        number,
        { productId: number; nameAr: string; quantity: number; revenue: number }
      >();
      for (const row of rows) {
        const sales = (row.productSales ?? []) as Array<{
          productId: number;
          nameAr?: string;
          quantity: number;
          revenue: number;
        }>;
        for (const s of sales) {
          const cur = prodMap.get(s.productId) ?? {
            productId: s.productId,
            nameAr: s.nameAr ?? '',
            quantity: 0,
            revenue: 0,
          };
          cur.quantity += s.quantity;
          cur.revenue += s.revenue;
          prodMap.set(s.productId, cur);
        }
      }

      return {
        series: rows.map((r) => ({
          day: r.day.toISOString(),
          revenue: Number(r.revenue),
          orders: r.orders,
          aov: Number(r.aov),
          newCustomers: r.newCustomers,
          returningCustomers: r.returningCustomers,
        })),
        topProducts: [...prodMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),

        // D5 — KSA season markers (Ramadan/Eid/National Day) over the window.
        markers: seasonMarkers(
          since.toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10),
        ),
      };
    }),

  // ---------------------------------------------------------------------------
  // E4 — reputation hub: review list, summary + trend, merchant reply
  // ---------------------------------------------------------------------------

  /**
   * myReviews — reviews of the caller's products, newest first, with the
   * buyer's name + product name for the list rows. Ownership lives in the
   * product relation: other vendors' reviews never enter the page, so no
   * per-row guard is needed.
   */
  myReviews: customerProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.number().int().positive().optional(),
        // 1-star triage: filter the list to a minimum rating.
        minRating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await vendorForStaffQuery(ctx, 'REVIEWS_MANAGE');
      if (!vendor) return { items: [], nextCursor: null, total: 0 };

      const where: Prisma.ProductReviewWhereInput = {
        product: { vendorId: vendor.id },
        ...(input.minRating ? { rating: { gte: input.minRating } } : {}),
        ...(input.cursor ? { id: { lt: input.cursor } } : {}),
      };
      const [reviews, total] = await Promise.all([
        prisma.productReview.findMany({
          where,
          orderBy: { id: 'desc' },
          take: input.limit + 1, // peek one row for nextCursor
          include: {
            product: { select: { id: true, nameJson: true } },
            user: { select: { name: true } },
          },
        }),
        prisma.productReview.count({ where: { product: { vendorId: vendor.id } } }),
      ]);
      const hasMore = reviews.length > input.limit;
      const page = hasMore ? reviews.slice(0, input.limit) : reviews;
      return {
        items: page.map(toReviewRow),
        nextCursor: hasMore ? page[page.length - 1]!.id : null,
        total,
      };
    }),

  /**
   * myReviewsSummary — avg rating, star distribution, unreplied 1-star
   * count (drives the triage banner) and an 8-week weekly trend (noon-UTC
   * buckets) for the rating sparkline.
   */
  myReviewsSummary: customerProcedure.query(async ({ ctx }) => {
    const vendor = await vendorForStaffQuery(ctx, 'REVIEWS_MANAGE');
    const labels = weeklyTrendLabels();
    if (!vendor) {
      return {
        total: 0,
        avg: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        unrepliedOneStar: 0,
        trend: labels.map((start) => ({ start, count: 0, avg: 0 })),
      };
    }

    const own = { product: { vendorId: vendor.id } };
    const [agg, grouped, oneStars, recent] = await Promise.all([
      prisma.productReview.aggregate({ where: own, _avg: { rating: true }, _count: true }),
      prisma.productReview.groupBy({ by: ['rating'], where: own, _count: true }),
      prisma.productReview.count({ where: { ...own, rating: 1, repliedAt: null } }),
      // Trend covers the last 8 weeks — recent rows only, bucketed in JS
      // (per-vendor review volume is small and the window bounds it).
      prisma.productReview.findMany({
        where: { ...own, createdAt: { gte: new Date(`${labels[0]}T00:00:00Z`) } },
        select: { rating: true, createdAt: true },
      }),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const g of grouped) distribution[g.rating as 1 | 2 | 3 | 4 | 5] = g._count;

    const buckets = new Map<string, { start: string; count: number; sum: number }>(
      labels.map((start) => [start, { start, count: 0, sum: 0 }]),
    );
    for (const r of recent) {
      const b = buckets.get(weekBucketStart(r.createdAt));
      if (b) {
        b.count += 1;
        b.sum += r.rating;
      }
    }

    return {
      total: agg._count,
      avg: agg._avg.rating === null ? 0 : Math.round(agg._avg.rating * 100) / 100,
      distribution,
      unrepliedOneStar: oneStars,
      trend: [...buckets.values()].map((b) => ({
        start: b.start,
        count: b.count,
        avg: b.count === 0 ? 0 : Math.round((b.sum / b.count) * 100) / 100,
      })),
    };
  }),

  /**
   * replyToReview — merchant reply on a review of THEIR product.
   * Ownership-guarded: a review on another vendor's product is
   * indistinguishable from a missing one (no existence leak). The reply is
   * bilingual Json — replying in one locale merges, never clobbers.
   */
  replyToReview: customerProcedure
    .input(
      z
        .object({
          reviewId: z.number().int().positive(),
          replyAr: z.string().max(1000).optional(),
          replyEn: z.string().max(1000).optional(),
        })
        .refine((v) => (v.replyAr?.trim().length ?? 0) > 0 || (v.replyEn?.trim().length ?? 0) > 0, {
          message: 'Reply text required',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await vendorForStaff(ctx, 'REVIEWS_MANAGE');
      const review = await prisma.productReview.findUnique({
        where: { id: input.reviewId },
        include: { product: { select: { vendorId: true } } },
      });
      if (!review || review.product.vendorId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      const existing = (review.replyJson as { ar?: string; en?: string } | null) ?? {};
      const updated = await prisma.productReview.update({
        where: { id: review.id },
        data: {
          replyJson: {
            ...existing,
            ...(input.replyAr?.trim() ? { ar: input.replyAr.trim() } : {}),
            ...(input.replyEn?.trim() ? { en: input.replyEn.trim() } : {}),
          },
          repliedAt: new Date(),
        },
        include: {
          product: { select: { id: true, nameJson: true } },
          user: { select: { name: true } },
        },
      });
      return toReviewRow(updated);
    }),

  /**
   * customers — CRM-lite repeat-customer aggregates (E5). One row per
   * customer of the caller's store: order count, total spend, last-order
   * recency, repeat flag. Aggregate-only — name/phone are the only PII
   * (already visible on the order drawer); email/addresses never leave.
   */
  customers: customerProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.number().int().positive().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await vendorForStaffQuery(ctx, 'CUSTOMERS_VIEW');
      if (!vendor) return { items: [], total: 0, repeatRate: 0, repeatCustomers: 0 };

      const grouped = await prisma.storeOrder.groupBy({
        by: ['customerId'],
        where: { vendorId: vendor.id },
        _count: true,
        _sum: { totalAmount: true },
        _max: { createdAt: true },
      });
      const users = await prisma.user.findMany({
        where: { id: { in: grouped.map((g) => g.customerId) } },
        select: { id: true, name: true, phone: true },
      });
      const byId = new Map(users.map((u) => [u.id, u]));
      const rows = grouped
        .map((g) => ({
          customerId: g.customerId,
          customerName: byId.get(g.customerId)?.name ?? 'عميل',
          phone: byId.get(g.customerId)?.phone ?? null,
          orderCount: g._count,
          totalSpent: Number(g._sum.totalAmount ?? 0),
          lastOrderAt: g._max.createdAt?.toISOString() ?? null,
          repeat: g._count > 1,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent || a.customerId - b.customerId);

      const repeatCustomers = rows.filter((r) => r.repeat).length;
      let start = 0;
      if (input.cursor) {
        const i = rows.findIndex((r) => r.customerId === input.cursor);
        if (i >= 0) start = i + 1;
      }
      const page = rows.slice(start, start + input.limit);
      return {
        items: page,
        nextCursor: start + input.limit < rows.length ? page[page.length - 1]!.customerId : null,
        total: rows.length,
        repeatRate: rows.length === 0 ? 0 : Math.round((repeatCustomers / rows.length) * 100) / 100,
        repeatCustomers,
      };
    }),

  // ---------------------------------------------------------------------------
  // C5 — bulk CSV product import (worker-backed)
  // ---------------------------------------------------------------------------

  /**
   * importProductsCsv — enqueue a vendor's CSV upload (header:
   * nameAr,nameEn,price,stock,emoji). The worker validates every row and
   * creates DRAFT products; the per-row report is polled via importStatus.
   */
  importProductsCsv: customerProcedure
    .input(z.object({ csv: z.string().min(1).max(200_000) }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      const queue = getCsvImportQueue();
      if (!queue) {
        throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Import queue unavailable' });
      }

      const job = await queue.add('csv.import', {
        vendorId: vendor.id,
        userId: ctx.user.id,
        csv: input.csv,
      });
      return { jobId: String(job.id) };
    }),

  /**
   * importStatus — poll a CSV import job (ownership-guarded via the job
   * payload's userId). The report is the handler's returnvalue; completed
   * jobs are kept by the queue for 24h.
   */
  importStatus: customerProcedure
    .input(z.object({ jobId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const queue = getCsvImportQueue();
      if (!queue) {
        throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Import queue unavailable' });
      }

      const job = await queue.getJob(input.jobId);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Import job not found' });
      }
      if (job.data.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Import job is not one of your own' });
      }

      const state = await job.getState();
      return {
        state,
        report: (job.returnvalue as CsvImportReport | null) ?? null,
        failedReason: job.failedReason ?? null,
      };
    }),

  // ---------------------------------------------------------------------------
  // C4 — store coupon codes (vendor-proposed, admin-approved, store-scoped)
  // ---------------------------------------------------------------------------

  /**
   * createCoupon — a store proposes a coupon for its OWN storefront. The
   * proposal rides the shared provider-submission queue (kind
   * 'store_coupon'); admin approval materializes the live PromoCode bound
   * to the store (vendorId). Rejected proposals never become codes.
   */
  createCoupon: customerProcedure
    .input(
      z
        .object({
          code: z.string().min(3).max(20),
          discountType: z.enum(['percent', 'fixed']),
          discountValue: z.number().positive(),
          minOrderAmount: z.number().optional(),
          maxDiscount: z.number().optional(),
          maxUses: z.number().int().positive().optional(),
          validUntil: z.string().datetime().optional(),
        })
        .refine((v) => v.discountType !== 'percent' || v.discountValue <= 100, {
          message: 'Percent discounts cannot exceed 100',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      const code = input.code.toUpperCase();
      const existing = await prisma.promoCode.findUnique({ where: { code } });
      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Code already in use' });
      }

      return prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'store_coupon',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            code,
            discountType: input.discountType,
            discountValue: input.discountValue,
            minOrderAmount: input.minOrderAmount ?? null,
            maxDiscount: input.maxDiscount ?? null,
            maxUses: input.maxUses ?? null,
            validUntil: input.validUntil ?? null,
          },
        },
      });
    }),

  /** listCoupons — the store's own live coupon codes. */
  listCoupons: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor) return [];

    return prisma.promoCode.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** deactivateCoupon — the store pauses one of its own codes. */
  deactivateCoupon: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' });
      }

      const promo = await prisma.promoCode.findUnique({ where: { id: input.id } });
      if (!promo) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Coupon not found' });
      }
      if (promo.vendorId !== vendor.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Coupon is not one of your own',
        });
      }

      await prisma.promoCode.update({
        where: { id: promo.id },
        data: { isActive: false },
      });
      return { success: true };
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
    .input(
      z.object({
        consultationId: z.number().int().positive(),
        // E2 — cancel-reason tracking (surfaced in the console list).
        reason: z.string().max(500).optional(),
      }),
    )
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
          data: {
            status: 'CANCELLED',
            ...(input.reason ? { cancelReason: input.reason } : {}),
          },
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
      if (request.status !== 'PENDING' && request.status !== 'ACCEPTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request already completed' });
      }
      return prisma.homeServiceRequest.update({
        where: { id: input.requestId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }),

  // ---------------------------------------------------------------------------
  // E3 — at-home accept/decline queue + nail-bar capacity analytics
  // ---------------------------------------------------------------------------

  /**
   * homeRequests.queue — unassigned PENDING requests in the salon's city
   * (the accept/decline queue). Assigned or decided requests never appear.
   */
  'homeRequests.queue': customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'ATHOME' || !vendor.homeCity) return [];

    const requests = await prisma.homeServiceRequest.findMany({
      where: { city: vendor.homeCity, vendorId: null, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
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

  /**
   * homeRequests.accept — a PENDING city request becomes ACCEPTED and
   * assigned to the caller's salon (assignedAt stamped).
   */
  'homeRequests.accept': customerProcedure
    .input(z.object({ requestId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'ATHOME') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'At-home salon not found' });
      }
      const request = await prisma.homeServiceRequest.findUnique({
        where: { id: input.requestId },
      });
      if (!request || request.city !== vendor.homeCity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
      }
      if (request.status !== 'PENDING' || request.vendorId !== null) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request already taken' });
      }
      return prisma.homeServiceRequest.update({
        where: { id: input.requestId },
        data: { vendorId: vendor.id, assignedAt: new Date(), status: 'ACCEPTED' },
      });
    }),

  /**
   * homeRequests.decline — the salon passes on a PENDING city request;
   * reason + timestamp are recorded for the platform's dispatch view.
   */
  'homeRequests.decline': customerProcedure
    .input(
      z.object({
        requestId: z.number().int().positive(),
        reason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'ATHOME') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'At-home salon not found' });
      }
      const request = await prisma.homeServiceRequest.findUnique({
        where: { id: input.requestId },
      });
      if (!request || request.city !== vendor.homeCity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
      }
      if (request.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request already decided' });
      }
      return prisma.homeServiceRequest.update({
        where: { id: input.requestId },
        data: {
          status: 'DECLINED',
          declinedAt: new Date(),
          ...(input.reason ? { declineReason: input.reason } : {}),
        },
      });
    }),

  /** nailBarCapacity — filled capacity across the last 30 days. */
  nailBarCapacity: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'NAIL_BAR') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Nail bar not found' });
    }
    const since = new Date(Date.now() - 30 * 24 * 3_600_000);
    const slots = await prisma.nailBarSlot.findMany({
      where: { nailBarId: vendor.id, startAt: { gte: since, lte: new Date() } },
      select: { startAt: true, capacity: true, bookedCount: true },
    });
    const byDayMap = new Map<string, { capacity: number; booked: number }>();
    for (const s of slots) {
      const day = s.startAt.toISOString().slice(0, 10);
      const row = byDayMap.get(day) ?? { capacity: 0, booked: 0 };
      row.capacity += s.capacity;
      row.booked += s.bookedCount;
      byDayMap.set(day, row);
    }
    const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
    const booked = slots.reduce((sum, s) => sum + s.bookedCount, 0);
    return {
      totalCapacity,
      booked,
      fillPct: totalCapacity === 0 ? 0 : Math.round((booked / totalCapacity) * 100),
      byDay: [...byDayMap.entries()]
        .map(([day, r]) => ({ day, ...r }))
        .sort((a, b) => a.day.localeCompare(b.day)),
    };
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

  // ---------------------------------------------------------------------------
  // E1 — gym membership console (plans, members, occupancy)
  // ---------------------------------------------------------------------------

  /**
   * gymPlans — the caller gym's active membership plans with ACTIVE member
   * counts. Plan editing stays admin (regulatory) — read-only here.
   */
  gymPlans: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'GYM') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
    }
    const plans = await prisma.subscriptionPlan.findMany({
      where: { gymId: vendor.id, isActive: true },
      orderBy: { price: 'desc' },
    });
    const members = await prisma.customerSubscription.groupBy({
      by: ['planId'],
      where: { planId: { in: plans.map((p) => p.id) }, status: 'ACTIVE' },
      _count: true,
    });
    const countOf = new Map(members.map((m) => [m.planId, m._count]));
    return plans.map((p) => ({
      id: p.id,
      nameAr: (p.nameJson as { ar?: string }).ar ?? '',
      nameEn: (p.nameJson as { en?: string }).en ?? '',
      price: Number(p.price),
      interval: p.interval,
      servicesPerMonth: p.servicesPerMonth,
      discountPercent: p.discountPercent,
      memberCount: countOf.get(p.id) ?? 0,
    }));
  }),

  /**
   * gymMembers — enrolled members of the caller gym's plans, with plan and
   * contact info (name/phone — the same PII the gym already sees on
   * bookings). Includes non-ACTIVE rows with their status for the console.
   */
  gymMembers: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'GYM') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
    }
    const subs = await prisma.customerSubscription.findMany({
      where: { plan: { gymId: vendor.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true } },
        plan: { select: { nameJson: true } },
      },
    });
    return subs.map((s) => ({
      subscriptionId: s.id,
      userId: s.userId,
      memberName: s.user.name,
      phone: s.user.phone ?? null,
      planNameAr: (s.plan.nameJson as { ar?: string }).ar ?? '',
      planNameEn: (s.plan.nameJson as { en?: string }).en ?? '',
      status: s.status,
      periodEnd: s.currentPeriodEnd.toISOString(),
      bookingsThisMonth: s.bookingsThisMonth,
      autoRenew: s.autoRenew,
    }));
  }),

  /**
   * gymClassOccupancy — upcoming classes of the caller gym with per-class
   * occupancy (enrolled / capacity). Past classes are excluded.
   */
  gymClassOccupancy: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'GYM') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Gym not found' });
    }
    const classes = await prisma.gymClass.findMany({
      where: { gymId: vendor.id, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
    return classes.map((c) => ({
      id: c.id,
      nameAr: (c.nameJson as { ar?: string }).ar ?? '',
      nameEn: (c.nameJson as { en?: string }).en ?? '',
      startsAt: c.startsAt.toISOString(),
      endsAt: c.endsAt.toISOString(),
      capacity: c.capacity,
      enrolled: c.enrolledCount,
      price: Number(c.price),
      occupancyPct: c.capacity === 0 ? 0 : Math.round((c.enrolledCount / c.capacity) * 100),
    }));
  }),

  // ---------------------------------------------------------------------------
  // E2 — clinic console deepening (packages, outcomes, utilization)
  // ---------------------------------------------------------------------------

  /**
   * proposeClinicPackage — a clinic proposes a treatment package: a
   * PENDING_REVIEW BeautyPackage (clinicId-bound) + a 'clinic_package'
   * submission riding the shared admin queue (providerReview.decide
   * materializes APPROVED/REJECTED onto the package).
   */
  proposeClinicPackage: customerProcedure
    .input(
      z.object({
        nameAr: z.string().min(2).max(120),
        nameEn: z.string().min(2).max(120),
        descriptionAr: z.string().max(1000).optional(),
        descriptionEn: z.string().max(1000).optional(),
        discountPercent: z.number().int().min(0).max(90).default(15),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      const pkg = await prisma.beautyPackage.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: { ar: input.descriptionAr ?? '', en: input.descriptionEn ?? '' },
          discountPercent: input.discountPercent,
          clinicId: vendor.id,
          createdByUserId: ctx.user.id,
          status: 'PENDING_REVIEW',
        },
      });
      const submission = await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'clinic_package',
          payload: { packageId: pkg.id, nameJson: { ar: input.nameAr, en: input.nameEn } },
        },
      });
      return { packageId: pkg.id, submissionId: submission.id };
    }),

  /** clinicPackages — the caller clinic's packages with approval status. */
  clinicPackages: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'CLINIC') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
    }
    const packages = await prisma.beautyPackage.findMany({
      where: { clinicId: vendor.id },
      orderBy: { id: 'desc' },
    });
    return packages.map((p) => ({
      id: p.id,
      nameAr: (p.nameJson as { ar?: string }).ar ?? '',
      nameEn: (p.nameJson as { en?: string }).en ?? '',
      discountPercent: p.discountPercent,
      status: p.status,
      reviewNotes: p.reviewNotes,
    }));
  }),

  /**
   * clinicOutcome — a CONFIRMED consultation ends COMPLETED; outcome
   * 'no_show' sets the no-show flag (feeds the clinic's no-show stats).
   */
  clinicOutcome: customerProcedure
    .input(
      z.object({
        consultationId: z.number().int().positive(),
        outcome: z.enum(['completed', 'no_show']),
        reason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor || vendor.type !== 'CLINIC') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
      }
      const consult = await prisma.clinicConsultation.findUnique({
        where: { id: input.consultationId },
      });
      if (!consult || consult.clinicId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Consultation not found' });
      }
      if (consult.status !== 'CONFIRMED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Consultation is not confirmed' });
      }
      const updated = await prisma.clinicConsultation.update({
        where: { id: consult.id },
        data: {
          status: 'COMPLETED',
          noShow: input.outcome === 'no_show',
          ...(input.outcome === 'no_show' && input.reason ? { cancelReason: input.reason } : {}),
        },
      });
      return { id: updated.id, status: updated.status, noShow: updated.noShow };
    }),

  /** clinicSlotUtilization — booked/total slots over the last 30 days. */
  clinicSlotUtilization: customerProcedure.query(async ({ ctx }) => {
    const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
    if (!vendor || vendor.type !== 'CLINIC') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Clinic not found' });
    }
    const since = new Date(Date.now() - 30 * 24 * 3_600_000);
    const slots = await prisma.clinicSlot.findMany({
      where: { clinicId: vendor.id, startAt: { gte: since, lte: new Date() } },
      select: { startAt: true, isBooked: true },
    });
    const byDayMap = new Map<string, { total: number; booked: number }>();
    for (const s of slots) {
      const day = s.startAt.toISOString().slice(0, 10);
      const row = byDayMap.get(day) ?? { total: 0, booked: 0 };
      row.total += 1;
      if (s.isBooked) row.booked += 1;
      byDayMap.set(day, row);
    }
    const totalSlots = slots.length;
    const bookedSlots = slots.filter((s) => s.isBooked).length;
    return {
      totalSlots,
      bookedSlots,
      utilizationPct: totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100),
      byDay: [...byDayMap.entries()]
        .map(([day, r]) => ({ day, ...r }))
        .sort((a, b) => a.day.localeCompare(b.day)),
    };
  }),

  // ---------------------------------------------------------------------------
  // G2 — submission status & resubmission
  // ---------------------------------------------------------------------------

  /**
   * mySubmissions — the caller's provider submissions (the onboarding
   * timeline: submitted → under review → approved/rejected), newest first,
   * with the admin review note. Caller-scoped, so no per-row guard needed.
   */
  mySubmissions: customerProcedure
    .input(
      z.object({
        kind: z.string().optional(),
        status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return prisma.providerSubmission.findMany({
        where: {
          providerId: ctx.user.id,
          ...(input.kind ? { kind: input.kind } : {}),
          ...(input.status ? { status: input.status } : {}),
        },
        orderBy: { id: 'desc' },
        take: 50,
      });
    }),

  /**
   * resubmitSubmission — a REJECTED submission spawns a fresh
   * PENDING_REVIEW one with merged payload edits (name/bio/logo — the
   * common rejection fixes). Ownership-guarded; other statuses reject.
   */
  resubmitSubmission: customerProcedure
    .input(
      z.object({
        submissionId: z.number().int().positive(),
        name: z.string().min(2).max(120).optional(),
        bio: z.string().max(1000).optional(),
        logo: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sub = await prisma.providerSubmission.findUnique({
        where: { id: input.submissionId },
      });
      if (!sub || sub.providerId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
      }
      if (sub.status !== 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only rejected submissions can be resubmitted',
        });
      }
      const payload = (sub.payload ?? {}) as Record<string, unknown>;
      return prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: sub.kind,
          status: 'PENDING_REVIEW',
          payload: {
            ...payload,
            ...(input.name ? { storeName: input.name } : {}),
            ...(input.bio ? { descriptionAr: input.bio } : {}),
            ...(input.logo ? { logoUrl: input.logo } : {}),
          },
        },
      });
    }),

  /**
   * setLicenseExpiry — G3: the vendor records their license/CR expiry so
   * the weekly sweep can nudge at 60/30/7 days. Updating the date resets
   * the reminder stamp.
   */
  setLicenseExpiry: customerProcedure
    .input(z.object({ date: z.string().datetime() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { licenseExpiryDate: new Date(input.date), licenseRemindedAt: null },
      });
    }),

  /**
   * A1 — store staff accounts. Owners (and staff with STAFF_MANAGE)
   * invite existing users by email; the invitee accepts on the portal.
   * Every management mutation writes the vendor-scoped audit feed.
   */
  staff: router({
    /**
     * A1 — the caller's portal relationship (the client primitive for
     * capability-driven UI: tab visibility, action gating, the staff
     * badge). Owners get kind 'owner'; ACTIVE staff get their role +
     * permissions; everyone else gets 'none'.
     */
    access: customerProcedure.query(async ({ ctx }) => {
      const actor = await resolveVendorActor(ctx.user.id);
      if (!actor) return { kind: 'none', permissions: [] as string[] };
      if (actor.kind === 'owner') return { kind: 'owner', permissions: [] as string[] };
      return {
        kind: 'staff',
        role: actor.staff.role,
        permissions: actor.staff.permissions,
      };
    }),

    /** Rows for the Staff tab — requires STAFF_MANAGE. */
    list: customerProcedure.query(async ({ ctx }) => {
      const actor = await requireStaffManager(ctx.user.id);
      const rows = await prisma.vendorStaff.findMany({
        where: { vendorId: actor.vendor.id },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      });
      return rows.map((r) => staffRowShape(r, r.user));
    }),

    /** Invite an existing user by email (idempotent for PENDING re-sends). */
    invite: customerProcedure
      .input(z.object({ email: z.string().email().max(254) }))
      .mutation(async ({ ctx, input }) => {
        const actor = await requireStaffManager(ctx.user.id);
        const target = await prisma.user.findFirst({
          where: { email: { equals: input.email, mode: 'insensitive' } },
        });
        if (!target) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No account with this email' });
        }
        if (target.id === actor.vendor.userId) {
          throw new TRPCError({ code: 'CONFLICT', message: 'The store owner cannot be staff' });
        }

        const existing = await prisma.vendorStaff.findUnique({ where: { userId: target.id } });
        if (existing?.status === 'ACTIVE') {
          throw new TRPCError({ code: 'CONFLICT', message: 'User is already staff of a store' });
        }
        if (existing?.status === 'PENDING' && existing.vendorId !== actor.vendor.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User has a pending invitation from another store',
          });
        }

        const notify = () =>
          notifyUser({
            userId: target.id,
            templateKey: 'staff_invited',
            vars: { storeName: actor.vendor.storeName },
            link: '/customer/vendor-portal',
          });

        let row: {
          id: number;
          role: string;
          permissions: string[];
          status: string;
          createdAt: Date;
        };
        if (existing?.status === 'PENDING') {
          // Re-send only — the invitation already stands.
          await notify();
          row = existing;
        } else {
          const data = {
            vendorId: actor.vendor.id,
            role: 'STAFF',
            permissions: ['ORDERS_MANAGE'],
            status: 'PENDING',
            invitedBy: ctx.user.id,
          };
          row = existing
            ? await prisma.vendorStaff.update({ where: { id: existing.id }, data }) // REVOKED → reactivate
            : await prisma.vendorStaff.create({ data: { ...data, userId: target.id } });
          await notify();
          await logStaffAction(actor.vendor.id, ctx.user.id, 'INVITE_STAFF', row.id, {
            email: target.email,
            reactivated: existing !== null,
          });
        }
        return staffRowShape(row, target);
      }),

    /** Change a staff row's role/permissions — requires STAFF_MANAGE. */
    update: customerProcedure
      .input(
        z
          .object({
            staffId: z.number().int().positive(),
            role: z.enum(['MANAGER', 'STAFF']).optional(),
            permissions: z.array(z.enum(STAFF_CAPABILITIES)).max(9).optional(),
          })
          .refine((v) => v.role !== undefined || v.permissions !== undefined, {
            message: 'role or permissions required',
          }),
      )
      .mutation(async ({ ctx, input }) => {
        const actor = await requireStaffManager(ctx.user.id);
        const row = await prisma.vendorStaff.findUnique({
          where: { id: input.staffId },
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });
        if (!row || row.vendorId !== actor.vendor.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
        }
        const updated = await prisma.vendorStaff.update({
          where: { id: row.id },
          data: {
            ...(input.role !== undefined ? { role: input.role } : {}),
            ...(input.permissions !== undefined ? { permissions: input.permissions } : {}),
          },
        });
        await logStaffAction(actor.vendor.id, ctx.user.id, 'UPDATE_STAFF', row.id, {
          role: input.role,
          permissions: input.permissions,
        });
        return staffRowShape(updated, row.user);
      }),

    /** Revoke staff access — requires STAFF_MANAGE. */
    revoke: customerProcedure
      .input(z.object({ staffId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const actor = await requireStaffManager(ctx.user.id);
        const row = await prisma.vendorStaff.findUnique({
          where: { id: input.staffId },
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });
        if (!row || row.vendorId !== actor.vendor.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
        }
        const updated = await prisma.vendorStaff.update({
          where: { id: row.id },
          data: { status: 'REVOKED' },
        });
        await notifyUser({
          userId: row.user.id,
          templateKey: 'staff_revoked',
          vars: { storeName: actor.vendor.storeName },
        });
        await logStaffAction(actor.vendor.id, ctx.user.id, 'REVOKE_STAFF', row.id);
        return staffRowShape(updated, row.user);
      }),

    /** The caller's own PENDING invitation (portal banner), else null. */
    myInvitation: customerProcedure.query(async ({ ctx }) => {
      const row = await prisma.vendorStaff.findUnique({
        where: { userId: ctx.user.id },
        include: { vendor: { select: { storeName: true, storeSlug: true } } },
      });
      if (!row || row.status !== 'PENDING') return null;
      return {
        id: row.id,
        storeName: row.vendor.storeName,
        storeSlug: row.vendor.storeSlug,
        role: row.role,
        permissions: row.permissions,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      };
    }),

    /** The invitee accepts their PENDING invitation → ACTIVE. */
    accept: customerProcedure.mutation(async ({ ctx }) => {
      const row = await prisma.vendorStaff.findUnique({
        where: { userId: ctx.user.id },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      });
      if (!row || row.status !== 'PENDING') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No pending invitation' });
      }
      const updated = await prisma.vendorStaff.update({
        where: { id: row.id },
        data: { status: 'ACTIVE' },
      });
      await logStaffAction(row.vendorId, ctx.user.id, 'ACCEPT_INVITE', row.id);
      return staffRowShape(updated, row.user);
    }),

    /** The invitee declines their PENDING invitation → REVOKED. */
    decline: customerProcedure.mutation(async ({ ctx }) => {
      const row = await prisma.vendorStaff.findUnique({
        where: { userId: ctx.user.id },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      });
      if (!row || row.status !== 'PENDING') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No pending invitation' });
      }
      const updated = await prisma.vendorStaff.update({
        where: { id: row.id },
        data: { status: 'REVOKED' },
      });
      await logStaffAction(row.vendorId, ctx.user.id, 'DECLINE_INVITE', row.id);
      return staffRowShape(updated, row.user);
    }),

    /** Recent audit feed for the Staff tab — requires STAFF_MANAGE. */
    activity: customerProcedure.query(async ({ ctx }) => {
      const actor = await requireStaffManager(ctx.user.id);
      const logs = await prisma.staffActivityLog.findMany({
        where: { vendorId: actor.vendor.id },
        include: { actor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return logs.map((l) => ({
        id: l.id,
        vendorId: l.vendorId,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        metadata: l.metadata,
        createdAt: l.createdAt.toISOString(),
        actorName: l.actor?.name ?? '—',
      }));
    }),
  }),

  /**
   * setPayoutSchedule — A2: the vendor picks their settlement cadence
   * (MANUAL default keeps the admin-driven flow). Ownership-guarded;
   * the daily gob-payouts job honors it.
   */
  setPayoutSchedule: customerProcedure
    .input(z.object({ schedule: z.enum(['MANUAL', 'WEEKLY', 'MONTHLY']) }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { payoutSchedule: input.schedule },
        select: { payoutSchedule: true, lastPayoutRunAt: true },
      });
    }),

  /**
   * setFulfillmentSla — A3: the store's promised order window in hours
   * (12–168). The daily gob-sla sweep judges breaches against it.
   */
  setFulfillmentSla: customerProcedure
    .input(z.object({ hours: z.number().int().min(12).max(168) }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }
      return prisma.vendor.update({
        where: { id: vendor.id },
        data: { fulfillmentSlaHours: input.hours },
        select: { fulfillmentSlaHours: true },
      });
    }),

  /**
   * updateSocialLinks — B6: the vendor's Snapchat/TikTok/X/Instagram/
   * Facebook handles. Partial merge: omitted networks keep their value,
   * an empty string removes one, URLs are zod-validated. Ownership-
   * guarded like every portal mutation.
   */
  updateSocialLinks: customerProcedure
    .input(
      z
        .object({
          snapchat: z.string().url().max(300).or(z.literal('')).optional(),
          tiktok: z.string().url().max(300).or(z.literal('')).optional(),
          x: z.string().url().max(300).or(z.literal('')).optional(),
          instagram: z.string().url().max(300).or(z.literal('')).optional(),
          facebook: z.string().url().max(300).or(z.literal('')).optional(),
        })
        .refine((v) => Object.values(v).some((s) => s !== undefined), {
          message: 'at least one network required',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      const existing = (vendor.socialLinks as Record<string, string> | null) ?? {};
      const next: Record<string, string> = {};
      for (const network of ['snapchat', 'tiktok', 'x', 'instagram', 'facebook'] as const) {
        const value = input[network] ?? existing[network];
        if (value) next[network] = value; // '' removes, undefined keeps, set adds
      }

      const updated = await prisma.vendor.update({
        where: { id: vendor.id },
        data: { socialLinks: next as unknown as Prisma.InputJsonValue },
      });
      return { socialLinks: updated.socialLinks };
    }),

  /**
   * sendWinback — B4: re-engage the vendor's OWN past customers with
   * pre-approved templates (restocked / on_offer — no free text).
   * Rate-limited to one win-back per customer per 14 days; the
   * promotions preference gate handles opt-outs; non-customers are
   * silently skipped. Returns per-send accounting, never errors on
   * skips.
   */
  sendWinback: customerProcedure
    .input(
      z.object({
        template: z.enum(['restocked', 'on_offer']),
        customerIds: z.array(z.number().int().positive()).min(1).max(20),
        productName: z.string().min(1).max(120).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }

      // Strictly the vendor's own order history (E5 groupBy set).
      const own = await prisma.storeOrder.groupBy({
        by: ['customerId'],
        where: { vendorId: vendor.id },
      });
      const ownIds = new Set(own.map((g) => g.customerId));

      // 14-day per-pair rate limit.
      const since = new Date(Date.now() - 14 * 86_400_000);
      const recent = await prisma.winbackLog.findMany({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: since },
          customerId: { in: input.customerIds },
        },
        select: { customerId: true },
      });
      const recentIds = new Set(recent.map((r) => r.customerId));

      // Explicit promotions opt-outs (honest skip accounting).
      const optedOut = new Set(
        (
          await prisma.notificationPreference.findMany({
            where: { userId: { in: input.customerIds }, promotions: false },
            select: { userId: true },
          })
        ).map((p) => p.userId),
      );

      const templateKey =
        input.template === 'restocked' ? 'store_winback_restocked' : 'store_winback_on_offer';
      const message =
        input.template === 'restocked' && input.productName ? input.productName : vendor.storeName;

      let sent = 0;
      let skipped = 0;
      for (const customerId of input.customerIds) {
        if (!ownIds.has(customerId) || recentIds.has(customerId) || optedOut.has(customerId)) {
          skipped++;
          continue;
        }
        await notifyUser({
          userId: customerId,
          templateKey,
          vars: { storeName: vendor.storeName, message },
          link: `/stores/${vendor.storeSlug}`,
          channels: ['in_app'],
        });
        await prisma.winbackLog.create({
          data: { vendorId: vendor.id, customerId, template: input.template },
        });
        sent++;
      }
      return { sent, skipped };
    }),

  /**
   * funnel — B5: 30-day storefront views → orders conversion + repeat
   * rate + top-viewed products (impressions from trackStoreView). The
   * legacy empty shape for non-vendors, capability-gated ANALYTICS_VIEW
   * for staff.
   */
  funnel: customerProcedure.query(async ({ ctx }) => {
    const vendor = await vendorForStaffQuery(ctx, 'ANALYTICS_VIEW');
    if (!vendor) {
      return { views30d: 0, orders30d: 0, conversion: 0, repeatRate: 0, topViewed: [] };
    }
    const since = new Date(Date.now() - 30 * 86_400_000);

    const [viewsAgg, ordersCount, distinctCustomers, repeaters, topViewed] = await Promise.all([
      prisma.storeViewLog.aggregate({
        where: { vendorId: vendor.id, day: { gte: since } },
        _sum: { views: true },
      }),
      prisma.storeOrder.count({
        where: { vendorId: vendor.id, createdAt: { gte: since }, status: 'FULFILLED' },
      }),
      prisma.storeOrder.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: since }, status: 'FULFILLED' },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
      prisma.storeOrder.groupBy({
        by: ['customerId'],
        where: { vendorId: vendor.id, createdAt: { gte: since }, status: 'FULFILLED' },
        having: { customerId: { _count: { gt: 1 } } },
      }),
      prisma.product.findMany({
        where: { vendorId: vendor.id, isActive: true },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, nameJson: true, viewCount: true },
      }),
    ]);

    const views30d = viewsAgg._sum.views ?? 0;
    const conversion = views30d ? Math.round((ordersCount / views30d) * 1000) / 10 : 0;
    const repeatRate = distinctCustomers.length
      ? Math.round((repeaters.length / distinctCustomers.length) * 100)
      : 0;

    return {
      views30d,
      orders30d: ordersCount,
      conversion,
      repeatRate,
      topViewed: topViewed.map((p) => ({
        productId: p.id,
        nameAr: (p.nameJson as { ar?: string }).ar ?? '',
        nameEn: (p.nameJson as { en?: string }).en ?? '',
        views: p.viewCount,
      })),
    };
  }),

  /**
   * payoutInvoice — A2: RFC 4180 invoice CSV for one of the caller's
   * payouts (summary + per-order line items, AR/EN headers). Ownership-
   * guarded like every earnings export.
   */
  payoutInvoice: customerProcedure
    .input(
      z.object({
        payoutId: z.number().int().positive(),
        locale: z.enum(['ar', 'en']).default('en'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }
      const payout = await prisma.payout.findUnique({ where: { id: input.payoutId } });
      if (!payout || payout.vendorId !== vendor.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Payout not found' });
      }

      const orders = await prisma.storeOrder.findMany({
        where: {
          vendorId: vendor.id,
          status: 'FULFILLED',
          createdAt: { gte: payout.periodStart, lte: payout.periodEnd },
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, totalAmount: true },
      });

      const esc = (v: string | number) => {
        const s = String(v);
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const ar = input.locale === 'ar';
      const header = ar
        ? [
            'رقم الفاتورة',
            'بداية الفترة',
            'نهاية الفترة',
            'الإجمالي',
            'الرسوم',
            'الصافي',
            'عدد الطلبات',
          ]
        : ['Invoice', 'Period start', 'Period end', 'Gross', 'Fee', 'Net', 'Orders'];
      const gross = Number(payout.amount) + Number(payout.fee);
      const summary = [
        `#${payout.id}`,
        payout.periodStart.toISOString().slice(0, 10),
        payout.periodEnd.toISOString().slice(0, 10),
        gross.toFixed(2),
        Number(payout.fee).toFixed(2),
        Number(payout.amount).toFixed(2),
        String(orders.length),
      ].join(',');

      const itemHeader = ar ? ['رقم الطلب', 'التاريخ', 'المبلغ'] : ['Order', 'Date', 'Amount'];
      const itemLines = orders.map((o) =>
        [o.id, o.createdAt.toISOString().slice(0, 10), Number(o.totalAmount).toFixed(2)].join(','),
      );

      return {
        csv: [header.join(','), esc(summary), '', itemHeader.join(','), ...itemLines].join('\r\n'),
      };
    }),
});

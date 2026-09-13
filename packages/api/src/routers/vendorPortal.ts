import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
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
        // E7 — real product shots instead of emojis.
        imageUrl: z.string().url().optional(),
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
          imageUrl: input.imageUrl,
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
        },
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

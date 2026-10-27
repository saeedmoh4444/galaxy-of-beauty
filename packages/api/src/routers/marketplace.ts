import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { LARGE_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import {
  publicProcedure,
  protectedProcedure,
  customerProcedure,
  adminProcedure,
  router,
} from '../trpc';
import { notifyUser } from '../lib/notify';
import { gatherStoreHealthFactors } from '../lib/storeHealth';
import { evaluateVendorRules } from '../lib/vendorPricing';
import { computeVendorTierBadges, computeTopRated } from '../lib/vendorTiers';
import { noonUtcDay } from '../workers/handlers';
import {
  readCartForCheckout,
  placeStoreOrders,
  notifyLowStockAlerts,
  notifyOrderPlaced,
} from '../lib/storeCheckout';

export const marketplaceRouter = router({
  // ── Products ──────────────────────────────────────────
  products: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        vendorId: z.number().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      // B3 — sold-out products stay hidden from shoppers; C1 — drafts too;
      // C2 — strict-mode products only surface once approved (LIVE).
      const where: Record<string, unknown> = {
        isActive: true,
        isDraft: false,
        approvalStatus: 'LIVE',
        stock: { gt: 0 },
      };
      if (input.categoryId) where['categoryId'] = input.categoryId;
      if (input.vendorId) where['vendorId'] = input.vendorId;
      if (input.search) where['nameJson'] = { path: ['ar'], string_contains: input.search };

      const orderBy: Record<string, string> =
        input.sortBy === 'price_asc'
          ? { price: 'asc' }
          : input.sortBy === 'price_desc'
            ? { price: 'desc' }
            : { createdAt: 'desc' };
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where: where as never,
          include: {
            vendor: { select: { storeName: true } },
            // Store plan Phase 4b — the active in-window deal, if any.
            deals: {
              where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: orderBy as never,
          skip,
          take: input.limit,
        }),
        prisma.product.count({ where: where as never }),
      ]);
      return {
        items: items.map(({ deals, ...item }) => ({
          ...item,
          activeDeal: deals[0] ?? null,
        })),
        total,
        page: input.page,
      };
    }),

  productDetail: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.id },
        include: {
          vendor: true,
          category: true,
          reviews: {
            include: { user: { select: { name: true, avatarUrl: true } } },
            take: DEFAULT_PAGE_SIZE,
          },
        },
      });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
      return product;
    }),

  // ── Cart ──────────────────────────────────────────────
  cart: protectedProcedure.query(async ({ ctx }) => {
    return prisma.cartItem.findMany({
      where: { userId: ctx.user.id },
      include: {
        product: { select: { id: true, nameJson: true, price: true, imageUrl: true, stock: true } },
      },
    });
  }),

  addToCart: customerProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().min(1).default(1),
        // C1 — optional variant line; must belong to the product.
        variantId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.variantId !== undefined) {
        const variant = await prisma.productVariant.findFirst({
          where: { id: input.variantId, productId: input.productId, isActive: true },
          select: { id: true },
        });
        if (!variant) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Variant not found for product' });
        }
      }
      // C1 — merge duplicate adds via findFirst: Prisma types nullable
      // compound-unique fields as non-null, so the cart has no unique on
      // (userId, productId, variantId) — see the schema note.
      const existing = await prisma.cartItem.findFirst({
        where: {
          userId: ctx.user.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
        },
        select: { id: true },
      });
      if (existing) {
        return prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: input.quantity } },
        });
      }
      return prisma.cartItem.create({
        data: {
          userId: ctx.user.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
          quantity: input.quantity,
        },
      });
    }),

  removeFromCart: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.cartItem.deleteMany({
        where: {
          userId: ctx.user.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
        },
      });
      return { success: true };
    }),

  // ── Buy (B.3) ───────────────────────────────────────────
  /**
   * buyCart — purchase everything in the caller's cart.
   * Transactionally checks stock, decrements it, increments product sales
   * and vendor totalSales, then clears the cart. On insufficient stock the
   * whole purchase is rejected and the cart is kept for correction.
   * (Checkout pages now use payments.payCart, which adds shipping +
   * payment on top of the same order placement.)
   */
  buyCart: customerProcedure.input(z.object({})).mutation(async ({ ctx }) => {
    const lines = await readCartForCheckout(ctx.user.id);

    const placed = await prisma.$transaction(async (tx) => {
      return placeStoreOrders(tx, ctx.user.id, lines);
    });

    // B3b — after commit: low-stock crossing alerts to the vendors.
    await notifyLowStockAlerts(placed.lowStockAlerts);
    // F1 — after commit: new-order inbox notifications to the vendors.
    await notifyOrderPlaced(placed.orders);

    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const items = lines.reduce((sum, l) => sum + l.quantity, 0);

    return { success: true, items, total };
  }),

  // ── Categories ────────────────────────────────────────
  productCategories: publicProcedure.query(async () => {
    return prisma.productCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }),

  // ── Vendors ───────────────────────────────────────────
  /**
   * trackStoreView — B5: storefront impressions. The clients call this
   * once per session (local guard) when a store page loads; increments
   * the NOON-UTC daily view log + per-product impression counters.
   * Never errors — analytics must not break store pages.
   */
  trackStoreView: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const vendor = await prisma.vendor.findFirst({
        where: { storeSlug: input.slug, isActive: true, type: { in: ['STORE', 'VENDOR'] } },
        select: { id: true },
      });
      if (!vendor) return { ok: true };

      const day = noonUtcDay(new Date());
      await prisma.storeViewLog.upsert({
        where: { vendorId_day: { vendorId: vendor.id, day } },
        update: { views: { increment: 1 } },
        create: { vendorId: vendor.id, day, views: 1 },
      });
      await prisma.product.updateMany({
        where: { vendorId: vendor.id, isActive: true },
        data: { viewCount: { increment: 1 } },
      });
      return { ok: true };
    }),

  vendors: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      // Store types only — clinics (E2) have their own listing.
      const storeTypes = { in: ['STORE', 'VENDOR'] };
      const [items, total] = await Promise.all([
        prisma.vendor.findMany({
          where: { isActive: true, isVerified: true, type: storeTypes },
          include: {
            user: { select: { name: true, avatarUrl: true } },
            _count: { select: { products: true } },
          },
          skip,
          take: input.limit,
        }),
        prisma.vendor.count({ where: { isActive: true, type: storeTypes } }),
      ]);
      // B2 — the list uses the cheap top-rated signal only (rating +
      // volume are already selected scalars; per-row health gathering
      // would cost N× queries).
      const rows = items.map((v) => ({
        ...v,
        tierBadge: computeTopRated(
          v.ratingAvg !== null ? Number(v.ratingAvg) : null,
          v.totalReviews,
        )
          ? 'top_rated'
          : null,
      }));
      return { items: rows, total, page: input.page };
    }),

  vendorDetail: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const vendor = await prisma.vendor.findFirst({
      where: { storeSlug: input.slug, type: { in: ['STORE', 'VENDOR'] } },
      include: {
        // B3 — sold-out products stay hidden; C1 — drafts too; C2 — only
        // admin-approved (LIVE) listings surface.
        // C6 — featured products lead the storefront profile.
        products: {
          where: { isActive: true, isDraft: false, approvalStatus: 'LIVE', stock: { gt: 0 } },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          take: LARGE_PAGE_SIZE,
        },
        // B3 — the public count matches what shoppers actually see.
        _count: {
          select: {
            products: {
              where: { isActive: true, isDraft: false, approvalStatus: 'LIVE', stock: { gt: 0 } },
            },
          },
        },
      },
    });
    if (!vendor) throw new TRPCError({ code: 'NOT_FOUND' });
    // B2 — tier badges (full set: the detail page absorbs the per-vendor
    // factor queries). Same signals as the A5 health score.
    const [health, fulfilled30d, repliedReviews] = await Promise.all([
      gatherStoreHealthFactors(prisma, vendor.id),
      prisma.storeOrder.count({
        where: {
          vendorId: vendor.id,
          status: 'FULFILLED',
          createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
      prisma.productReview.count({
        where: { product: { vendorId: vendor.id }, repliedAt: { not: null } },
      }),
    ]);
    const reviewReplyRate = vendor.totalReviews > 0 ? repliedReviews / vendor.totalReviews : null;
    const tierBadges = computeVendorTierBadges({
      ratingAvg: vendor.ratingAvg !== null ? Number(vendor.ratingAvg) : null,
      totalReviews: vendor.totalReviews,
      fulfillmentSpeedHours: health.fulfillmentSpeedHours,
      fulfilled30d,
      disputeEscalationRate: health.disputeEscalationRate,
      reviewReplyRate,
    });
    // B3 — recent reviews WITH owner replies (the loop customers see).
    const recentReviews = (
      await prisma.productReview.findMany({
        where: { product: { vendorId: vendor.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          replyJson: true,
          repliedAt: true,
          product: { select: { nameJson: true } },
          user: { select: { name: true } },
        },
      })
    ).map((r) => {
      const reply = (r.replyJson as { ar?: string; en?: string } | null) ?? {};
      const name = r.product.nameJson as { ar?: string; en?: string };
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? '',
        createdAt: r.createdAt.toISOString(),
        replied: r.repliedAt !== null,
        replyAr: reply.ar ?? '',
        replyEn: reply.en ?? '',
        productNameAr: name.ar ?? '',
        productNameEn: name.en ?? '',
        customerName: r.user.name ?? '',
      };
    });
    // C3 — vendor pricing rules: attach the effective price per product
    // (weekend/low-stock uplifts; admin overrides win in the lib).
    const priceRules = await prisma.vendorPriceRule.findMany({
      where: { vendorId: vendor.id, isActive: true },
    });
    const likedRules = priceRules.map((r) => ({
      id: r.id,
      isActive: r.isActive,
      productId: r.productId,
      ruleType: r.ruleType as 'weekend_uplift' | 'lowstock_floor',
      dayOfWeek: r.dayOfWeek,
      multiplier: Number(r.multiplier),
      adminOverrideMultiplier:
        r.adminOverrideMultiplier === null ? null : Number(r.adminOverrideMultiplier),
    }));
    const now = new Date();
    const priced = vendor.products.map((p) => {
      const res = evaluateVendorRules(likedRules, {
        productId: p.id,
        date: now,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        basePrice: Number(p.price),
      });
      return { ...p, effectivePrice: res.price, appliedRuleIds: res.appliedRuleIds };
    });
    return { ...vendor, products: priced, tierBadges, recentReviews };
  }),

  // ── Become a vendor / store (Store plan Phase 1) ────────
  /**
   * becomeVendor — merchant registration. Creates an UNVERIFIED vendor and
   * a PENDING_REVIEW ProviderSubmission (kind 'store') for the admin review
   * queue. Products/orders are blocked until approval flips isVerified.
   */
  becomeVendor: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(2),
        storeSlug: z.string().min(3),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        logoUrl: z.string().optional(),
        licenseNumber: z.string().min(1),
        bankIban: z.string().optional(),
        bankName: z.string().optional(),
        // KSA merchant documents — required for admin approval.
        documents: z.object({
          crUrl: z.string().url(),
          nationalIdUrl: z.string().url(),
          bankLetterUrl: z.string().url(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      const vendor = await prisma.vendor.create({
        data: {
          userId: ctx.user.id,
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          logoUrl: input.logoUrl,
          licenseNumber: input.licenseNumber,
          bankIban: input.bankIban,
          bankName: input.bankName,
          type: 'STORE',
          isVerified: false,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'store',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            storeName: input.storeName,
            storeSlug: input.storeSlug,
            licenseNumber: input.licenseNumber,
            bankIban: input.bankIban ?? '',
            bankName: input.bankName ?? '',
            documents: input.documents,
          },
        },
      });

      return vendor;
    }),

  // ── Become a clinic (E2 — medical beauty clinics) ───────
  /**
   * becomeClinic — medical clinic registration. Same unified provider
   * pipeline: UNVERIFIED Vendor (type CLINIC) + PENDING_REVIEW submission
   * (kind 'clinic'). KSA documents are required: MOH/SFDA license, CR,
   * national ID.
   */
  becomeClinic: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(2),
        storeSlug: z.string().min(3),
        clinicType: z.enum(['dermatology', 'laser', 'injectables', 'dental', 'nutrition']),
        licenseNumber: z.string().min(4),
        licenseAgency: z.enum(['MOH', 'SFDA']),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        logoUrl: z.string().optional(),
        documents: z.object({
          medicalLicenseUrl: z.string().url(),
          crUrl: z.string().url(),
          nationalIdUrl: z.string().url(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      const vendor = await prisma.vendor.create({
        data: {
          userId: ctx.user.id,
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          logoUrl: input.logoUrl,
          licenseNumber: input.licenseNumber,
          licenseAgency: input.licenseAgency,
          clinicType: input.clinicType,
          type: 'CLINIC',
          isVerified: false,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'clinic',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            clinicName: input.storeName,
            clinicType: input.clinicType,
            licenseNumber: input.licenseNumber,
            licenseAgency: input.licenseAgency,
            documents: input.documents,
          },
        },
      });

      return vendor;
    }),

  // ── Become a gym (E3 — fitness vertical) ───────────────
  /**
   * becomeGym — gym registration. Same unified provider pipeline:
   * UNVERIFIED Vendor (type GYM) + PENDING_REVIEW submission (kind 'gym').
   * KSA documents required: CR, national ID, license (MISA/municipality).
   */
  becomeGym: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(2),
        storeSlug: z.string().min(3),
        gymType: z.enum(['ladies', 'family']),
        licenseNumber: z.string().min(4),
        licenseAgency: z.enum(['MISA', 'MUNICIPALITY']),
        gymCity: z.string().min(2),
        gymAddress: z.string().min(5),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        logoUrl: z.string().optional(),
        documents: z.object({
          crUrl: z.string().url(),
          nationalIdUrl: z.string().url(),
          licenseUrl: z.string().url(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      const vendor = await prisma.vendor.create({
        data: {
          userId: ctx.user.id,
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          logoUrl: input.logoUrl,
          licenseNumber: input.licenseNumber,
          licenseAgency: input.licenseAgency,
          gymType: input.gymType,
          gymCity: input.gymCity,
          gymAddress: input.gymAddress,
          type: 'GYM',
          isVerified: false,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'gym',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            gymName: input.storeName,
            gymType: input.gymType,
            gymCity: input.gymCity,
            gymAddress: input.gymAddress,
            licenseNumber: input.licenseNumber,
            licenseAgency: input.licenseAgency,
            documents: input.documents,
          },
        },
      });

      return vendor;
    }),

  /**
   * becomeNailBar — E5 nail bar registration. Same unified provider
   * pipeline: UNVERIFIED Vendor (type NAIL_BAR) + PENDING_REVIEW submission
   * (kind 'nail_bar'). KSA documents required: CR, national ID, municipal
   * license. Payment happens at the venue (record-only bookings).
   */
  becomeNailBar: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(2),
        storeSlug: z.string().min(3),
        nailBarType: z.enum(['express', 'standard']),
        nailBarCity: z.string().min(2),
        nailBarAddress: z.string().min(5),
        licenseNumber: z.string().min(4),
        licenseAgency: z.enum(['MISA', 'MUNICIPALITY']),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        logoUrl: z.string().optional(),
        documents: z.object({
          crUrl: z.string().url(),
          nationalIdUrl: z.string().url(),
          licenseUrl: z.string().url(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      const vendor = await prisma.vendor.create({
        data: {
          userId: ctx.user.id,
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          logoUrl: input.logoUrl,
          licenseNumber: input.licenseNumber,
          licenseAgency: input.licenseAgency,
          nailBarType: input.nailBarType,
          nailBarCity: input.nailBarCity,
          nailBarAddress: input.nailBarAddress,
          type: 'NAIL_BAR',
          isVerified: false,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'nail_bar',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            nailBarName: input.storeName,
            nailBarType: input.nailBarType,
            nailBarCity: input.nailBarCity,
            nailBarAddress: input.nailBarAddress,
            licenseNumber: input.licenseNumber,
            licenseAgency: input.licenseAgency,
            documents: input.documents,
          },
        },
      });

      return vendor;
    }),

  /**
   * becomeAthomeSalon — E5 at-home salon registration. Same pipeline:
   * UNVERIFIED Vendor (type ATHOME) + PENDING_REVIEW submission
   * (kind 'athome_salon'). Verified providers receive homeService requests
   * covering their city.
   */
  becomeAthomeSalon: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(2),
        storeSlug: z.string().min(3),
        homeCity: z.string().min(2),
        homeAddress: z.string().min(5),
        licenseNumber: z.string().min(4),
        licenseAgency: z.enum(['MISA', 'MUNICIPALITY']),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        logoUrl: z.string().optional(),
        documents: z.object({
          crUrl: z.string().url(),
          nationalIdUrl: z.string().url(),
          licenseUrl: z.string().url(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      const vendor = await prisma.vendor.create({
        data: {
          userId: ctx.user.id,
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
          logoUrl: input.logoUrl,
          licenseNumber: input.licenseNumber,
          licenseAgency: input.licenseAgency,
          homeCity: input.homeCity,
          homeAddress: input.homeAddress,
          type: 'ATHOME',
          isVerified: false,
        },
      });

      await prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'athome_salon',
          status: 'PENDING_REVIEW',
          payload: {
            vendorId: vendor.id,
            salonName: input.storeName,
            homeCity: input.homeCity,
            homeAddress: input.homeAddress,
            licenseNumber: input.licenseNumber,
            licenseAgency: input.licenseAgency,
            documents: input.documents,
          },
        },
      });

      return vendor;
    }),

  // ── Product Reviews ────────────────────────────────────
  addReview: customerProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { vendorId: true, nameJson: true },
      });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

      const review = await prisma.productReview.upsert({
        where: { productId_userId: { productId: input.productId, userId: ctx.user.id } },
        update: { rating: input.rating, comment: input.comment },
        create: {
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        },
      });

      // Store plan Phase 4 — keep the denormalized store rating fresh.
      const agg = await prisma.productReview.aggregate({
        where: { product: { vendorId: product.vendorId } },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.vendor.update({
        where: { id: product.vendorId },
        data: {
          ratingAvg: Math.round((agg._avg.rating ?? 0) * 100) / 100,
          totalReviews: agg._count,
        },
      });

      // F1 — vendor inbox: a new (or updated) review alerts the owner.
      try {
        const owner = await prisma.vendor.findUnique({
          where: { id: product.vendorId },
          select: { userId: true },
        });
        if (owner) {
          await notifyUser({
            userId: owner.userId,
            templateKey: 'store_review_left',
            vars: {
              rating: input.rating,
              productName:
                (product.nameJson as { ar?: string } | null)?.ar ?? `منتج #${input.productId}`,
            },
            link: '/store?tab=reviews',
            channels: ['in_app'],
          });
        }
      } catch {
        // Notification failure must never fail the review.
      }

      return review;
    }),

  productReviews: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.productReview.findMany({
          where: { productId: input.productId },
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
        }),
        prisma.productReview.count({ where: { productId: input.productId } }),
      ]);
      return { items, total };
    }),

  // ── Admin ─────────────────────────────────────────────
  /** adminSetCommission — store plan Phase 3: per-store commission rate. */
  adminSetCommission: adminProcedure
    .input(
      z.object({
        vendorId: z.number().int().positive(),
        commissionRate: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId } });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });

      return prisma.vendor.update({
        where: { id: input.vendorId },
        data: { commissionRate: input.commissionRate },
      });
    }),

  adminProducts: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          include: { vendor: { select: { storeName: true } }, category: true },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count(),
      ]);
      return { items, total };
    }),
});

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
      const where: Record<string, unknown> = { isActive: true };
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
      z.object({ productId: z.number().int().positive(), quantity: z.number().min(1).default(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.cartItem.upsert({
        where: { userId_productId: { userId: ctx.user.id, productId: input.productId } },
        update: { quantity: { increment: input.quantity } },
        create: { userId: ctx.user.id, productId: input.productId, quantity: input.quantity },
      });
    }),

  removeFromCart: protectedProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.cartItem.deleteMany({
        where: { userId: ctx.user.id, productId: input.productId },
      });
      return { success: true };
    }),

  // ── Buy (B.3) ───────────────────────────────────────────
  /**
   * buyCart — purchase everything in the caller's cart.
   * Transactionally checks stock, decrements it, increments product sales
   * and vendor totalSales, then clears the cart. On insufficient stock the
   * whole purchase is rejected and the cart is kept for correction.
   */
  buyCart: customerProcedure.input(z.object({})).mutation(async ({ ctx }) => {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: ctx.user.id },
      include: {
        product: { select: { id: true, price: true, stock: true, vendorId: true } },
      },
    });

    if (cartItems.length === 0) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
    }

    const shortage = cartItems.find((i) => i.product.stock < i.quantity);
    if (shortage) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Insufficient stock for product #${shortage.productId} (available: ${shortage.product.stock})`,
      });
    }

    const total = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    await prisma.$transaction(async (tx) => {
      // Store plan Phase 1 — one order record per store in the cart.
      const byVendor = new Map<number, { amount: number; items: number }>();
      for (const item of cartItems) {
        const amount = Number(item.product.price) * item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sales: { increment: item.quantity },
          },
        });
        await tx.vendor.update({
          where: { id: item.product.vendorId },
          data: { totalSales: { increment: amount } },
        });
        const agg = byVendor.get(item.product.vendorId) ?? { amount: 0, items: 0 };
        agg.amount += amount;
        agg.items += item.quantity;
        byVendor.set(item.product.vendorId, agg);
      }
      for (const [vendorId, agg] of byVendor) {
        await tx.storeOrder.create({
          data: {
            vendorId,
            customerId: ctx.user.id,
            totalAmount: agg.amount,
            itemCount: agg.items,
            status: 'PENDING_FULFILLMENT',
          },
        });
      }
      await tx.cartItem.deleteMany({ where: { userId: ctx.user.id } });
    });

    return { success: true, items: totalItems, total };
  }),

  // ── Categories ────────────────────────────────────────
  productCategories: publicProcedure.query(async () => {
    return prisma.productCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }),

  // ── Vendors ───────────────────────────────────────────
  vendors: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.vendor.findMany({
          where: { isActive: true, isVerified: true },
          include: {
            user: { select: { name: true, avatarUrl: true } },
            _count: { select: { products: true } },
          },
          skip,
          take: input.limit,
        }),
        prisma.vendor.count({ where: { isActive: true } }),
      ]);
      return { items, total, page: input.page };
    }),

  vendorDetail: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const vendor = await prisma.vendor.findUnique({
      where: { storeSlug: input.slug },
      include: {
        products: { where: { isActive: true }, take: LARGE_PAGE_SIZE },
        _count: { select: { products: true } },
      },
    });
    if (!vendor) throw new TRPCError({ code: 'NOT_FOUND' });
    return vendor;
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
        licenseNumber: z.string().optional(),
        bankIban: z.string().optional(),
        bankName: z.string().optional(),
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
            licenseNumber: input.licenseNumber ?? '',
            bankIban: input.bankIban ?? '',
            bankName: input.bankName ?? '',
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
      return prisma.productReview.upsert({
        where: { productId_userId: { productId: input.productId, userId: ctx.user.id } },
        update: { rating: input.rating, comment: input.comment },
        create: {
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        },
      });
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

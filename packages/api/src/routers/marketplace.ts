import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, protectedProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const marketplaceRouter = router({
  // ── Products ──────────────────────────────────────────
  products: publicProcedure
    .input(z.object({
      categoryId: z.number().optional(), vendorId: z.number().optional(),
      search: z.string().optional(), sortBy: z.enum(['price_asc','price_desc','newest','popular']).default('newest'),
      page: z.number().default(1), limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isActive: true };
      if (input.categoryId) where['categoryId'] = input.categoryId;
      if (input.vendorId) where['vendorId'] = input.vendorId;
      if (input.search) where['nameJson'] = { path: ['ar'], string_contains: input.search };

      const orderBy: Record<string, string> = input.sortBy === 'price_asc' ? { price: 'asc' } : input.sortBy === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' };
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.product.findMany({ where: where as never, include: { vendor: { select: { storeName: true } } }, orderBy: orderBy as never, skip, take: input.limit }),
        prisma.product.count({ where: where as never }),
      ]);
      return { items, total, page: input.page };
    }),

  productDetail: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { id: input.id },
        include: { vendor: true, category: true, reviews: { include: { user: { select: { name: true, avatarUrl: true } } }, take: 10 } },
      });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
      return product;
    }),

  // ── Cart ──────────────────────────────────────────────
  cart: protectedProcedure.query(async ({ ctx }) => {
    return prisma.cartItem.findMany({
      where: { userId: ctx.user.id },
      include: { product: { select: { id: true, nameJson: true, price: true, imageUrl: true, stock: true } } },
    });
  }),

  addToCart: customerProcedure
    .input(z.object({ productId: z.number().int().positive(), quantity: z.number().min(1).default(1) }))
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
      await prisma.cartItem.deleteMany({ where: { userId: ctx.user.id, productId: input.productId } });
      return { success: true };
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
        prisma.vendor.findMany({ where: { isActive: true, isVerified: true }, include: { user: { select: { name: true, avatarUrl: true } }, _count: { select: { products: true } } }, skip, take: input.limit }),
        prisma.vendor.count({ where: { isActive: true } }),
      ]);
      return { items, total, page: input.page };
    }),

  vendorDetail: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const vendor = await prisma.vendor.findUnique({
        where: { storeSlug: input.slug },
        include: { products: { where: { isActive: true }, take: 20 }, _count: { select: { products: true } } },
      });
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND' });
      return vendor;
    }),

  // ── Become a vendor ───────────────────────────────────
  becomeVendor: protectedProcedure
    .input(z.object({ storeName: z.string().min(2), storeSlug: z.string().min(3), descriptionAr: z.string().optional(), descriptionEn: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.vendor.findUnique({ where: { userId: ctx.user.id } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a vendor' });

      return prisma.vendor.create({
        data: {
          userId: ctx.user.id, storeName: input.storeName, storeSlug: input.storeSlug,
          descriptionJson: { ar: input.descriptionAr || '', en: input.descriptionEn || '' },
        },
      });
    }),

  // ── Admin ─────────────────────────────────────────────
  adminProducts: adminProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.product.findMany({ include: { vendor: { select: { storeName: true } }, category: true }, skip, take: input.limit, orderBy: { createdAt: 'desc' } }),
        prisma.product.count(),
      ]);
      return { items, total };
    }),
});

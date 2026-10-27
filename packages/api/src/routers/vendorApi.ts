/**
 * D1 — vendor API (Wave D): the enterprise integration surface over
 * X-Api-Key auth. Read-only v1 (products + orders); stock writes and
 * webhooks land in D1b.
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { TRPCError } from '@trpc/server';
import { router, vendorApiKeyProcedure } from '../trpc';

export const vendorApiRouter = router({
  /** products — the caller vendor's catalog (newest first, capped). */
  products: vendorApiKeyProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return prisma.product.findMany({
        where: { vendorId: ctx.vendorApiKey.vendorId },
        orderBy: { id: 'desc' },
        take: input?.limit ?? 50,
      });
    }),

  /** orders — the caller vendor's store orders with line items. */
  orders: vendorApiKeyProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return prisma.storeOrder.findMany({
        where: { vendorId: ctx.vendorApiKey.vendorId },
        orderBy: { id: 'desc' },
        take: input?.limit ?? 50,
        include: { items: { orderBy: { id: 'asc' } } },
      });
    }),

  /** updateStock — D1c: set the absolute stock of a product (or one of
   *  its variants) over the API key. ERP/inventory integrations call
   *  this; belongs-to guards mirror the portal's stockIn. */
  updateStock: vendorApiKeyProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().optional(),
        stock: z.number().int().min(0).max(1_000_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.vendorApiKey;
      const product = await prisma.product.findFirst({
        where: { id: input.productId, vendorId },
        select: { id: true },
      });
      if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

      if (input.variantId !== undefined) {
        const variant = await prisma.productVariant.findFirst({
          where: { id: input.variantId, productId: input.productId },
          select: { id: true },
        });
        if (!variant) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Variant not found for product' });
        }
        return prisma.productVariant.update({
          where: { id: input.variantId },
          data: { stock: input.stock },
          select: { id: true, stock: true },
        });
      }
      return prisma.product.update({
        where: { id: input.productId },
        data: { stock: input.stock },
        select: { id: true, stock: true },
      });
    }),
});

/**
 * D1 — vendor API (Wave D): the enterprise integration surface over
 * X-Api-Key auth. Read-only v1 (products + orders); stock writes and
 * webhooks land in D1b.
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
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
});

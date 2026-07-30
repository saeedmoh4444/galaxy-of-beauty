import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const giftCardMarketRouter = router({
  listings: customerProcedure.query(() => prisma.giftCardListing.findMany({ orderBy: { createdAt: 'desc' } })),
  myListings: customerProcedure.query(async ({ ctx }) => prisma.giftCardListing.findMany({ where: { sellerId: ctx.user.id } })),
  list: customerProcedure
    .input(z.object({ value: z.number().min(50), sellingPrice: z.number().min(10) }))
    .mutation(async ({ ctx, input }) =>
      prisma.giftCardListing.create({
        data: { sellerId: ctx.user.id, sellerName: 'أنتِ', value: input.value, sellingPrice: input.sellingPrice, discount: Math.round(((input.value - input.sellingPrice) / input.value) * 100) },
      })),
  buy: customerProcedure
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ input }) => {
      const listing = await prisma.giftCardListing.findUnique({ where: { id: input.listingId } });
      if (!listing) throw new Error('غير متوفر');
      await prisma.giftCardListing.delete({ where: { id: input.listingId } });
      return { bought: true, ...listing };
    }),
});

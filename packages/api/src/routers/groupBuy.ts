import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const groupBuyRouter = router({
  deals: publicProcedure.query(() =>
    db.groupBuyDeal.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
  ),

  join: customerProcedure
    .input(z.object({ dealId: z.number() }))
    .mutation(async ({ input }) => {
      const deal = await db.groupBuyDeal.findUnique({ where: { id: input.dealId } });
      if (!deal) throw new Error('الصفقة غير موجودة');
      const updated = await db.groupBuyDeal.update({
        where: { id: input.dealId },
        data: { currentBuyers: { increment: 1 } },
      });
      const reached = updated.currentBuyers >= updated.minBuyers;
      return { ...updated, joined: true, message: reached ? '🎉 تم تفعيل الصفقة!' : `متبقي ${updated.minBuyers - updated.currentBuyers} مشتركات` };
    }),
});

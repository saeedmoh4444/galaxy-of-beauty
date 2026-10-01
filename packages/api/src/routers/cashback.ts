import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { CASHBACK_RATE_PCT } from '@galaxy/shared';
import { customerProcedure, adminProcedure, router } from '../trpc';

const db = prisma;

const CASHBACK_RATE_KEY = 'cashback_rate';
const FIRST_BOOKING_BONUS = 50; // Extra 50 SAR on first booking

/** Configured cashback percentage; falls back to the shared default (5). */
export async function getCashbackRatePct(): Promise<number> {
  const cfg = await db.platformConfig.findUnique({ where: { key: CASHBACK_RATE_KEY } });
  const parsed = cfg ? Number.parseInt(cfg.value, 10) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : CASHBACK_RATE_PCT;
}

export const cashbackRouter = router({
  // Get my cashback history
  history: customerProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const wallet = await db.wallet.findUnique({ where: { userId: ctx.user.id } });
      if (!wallet) return { items: [], total: 0, totalCashback: 0 };

      const [items, total] = await Promise.all([
        db.walletTransaction.findMany({
          where: { walletId: wallet.id, source: 'CASHBACK' },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        db.walletTransaction.count({ where: { walletId: wallet.id, source: 'CASHBACK' } }),
      ]);

      const totalCashback = await db.walletTransaction.aggregate({
        where: { walletId: wallet.id, source: 'CASHBACK' },
        _sum: { amount: true },
      });

      return { items, total, totalCashback: Number(totalCashback._sum?.amount || 0) };
    }),

  // Get cashback rate and info
  info: customerProcedure.query(async ({ ctx }) => {
    const wallet = await db.wallet.findUnique({ where: { userId: ctx.user.id } });
    const bookingCount = await db.booking.count({ where: { customerId: ctx.user.id } });
    return {
      rate: await getCashbackRatePct(),
      balance: Number(wallet?.bonusBalance || 0),
      totalBalance: Number(wallet?.balance || 0),
      isFirstBooking: bookingCount === 0,
      firstBookingBonus: FIRST_BOOKING_BONUS,
    };
  }),

  // Admin: set cashback rate (persisted, read by info and the capture flow)
  setRate: adminProcedure
    .input(z.object({ rate: z.number().min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      await db.platformConfig.upsert({
        where: { key: CASHBACK_RATE_KEY },
        create: {
          key: CASHBACK_RATE_KEY,
          value: String(input.rate),
          description: 'Cashback percentage on every booking',
          updatedBy: ctx.user.id,
        },
        update: { value: String(input.rate), updatedBy: ctx.user.id },
      });
      return { rate: input.rate };
    }),

  // Admin: current persisted rate
  getRate: adminProcedure.query(async () => ({ rate: await getCashbackRatePct() })),
});

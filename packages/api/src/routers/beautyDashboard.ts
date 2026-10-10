import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const beautyDashboardRouter = router({
  overview: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [bookings, streak, wallet, skinAnalysis, journals, wishlist] = await Promise.all([
      db.booking.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        take: SMALL_PAGE_SIZE,
        include: { service: { select: { titleJson: true } } },
      }),
      db.streak.findUnique({ where: { customerId: userId } }),
      db.wallet.findUnique({ where: { userId } }),
      db.skinAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { skinType: true, concerns: true },
      }),
      db.beautyJournal.count({ where: { userId } }),
      db.wishlistItem.count({ where: { userId } }),
    ]);

    const upcomingBookings = bookings.filter((b) =>
      ['REQUESTED', 'ACCEPTED'].includes(b.status),
    ).length;
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
    const recentBookings = bookings.slice(0, 3).map((b) => ({
      id: b.id,
      serviceName: (b.service?.titleJson as Record<string, string>)?.ar ?? '',
      status: b.status,
      date: b.createdAt,
    }));

    return {
      upcomingBookings,
      completedBookings,
      streakDays: streak?.currentStreak ?? 0,
      walletBalance: Number(wallet?.balance ?? 0),
      bonusBalance: Number(wallet?.bonusBalance ?? 0),
      skinType: skinAnalysis?.skinType ?? null,
      skinConcerns: (skinAnalysis?.concerns as string[]) ?? [],
      journalCount: journals,
      wishlistCount: wishlist,
      recentBookings,
    };
  }),
});

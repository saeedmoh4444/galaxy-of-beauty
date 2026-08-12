import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const CATEGORIES = [
  { key: 'rating', nameAr: 'الأعلى تقييماً', emoji: '⭐' },
  { key: 'bookings', nameAr: 'الأكثر حجوزات', emoji: '🔥' },
  { key: 'speed', nameAr: 'الأسرع استجابة', emoji: '⚡' },
  { key: 'reviews', nameAr: 'الأكثر مراجعات', emoji: '📝' },
];

export const techLeaderboardRouter = router({
  categories: publicProcedure.query(() => CATEGORIES),

  leaderboard: publicProcedure
    .input(z.object({ category: z.string().default('rating'), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const techs = await db.technician.findMany({
        take: input.limit,
        include: { user: { select: { name: true } } },
        orderBy: input.category === 'rating' ? { ratingAvg: 'desc' } : { createdAt: 'desc' },
      });
      const bookingCounts = await db.booking.groupBy({
        by: ['technicianId'],
        _count: { id: true },
      });
      const countMap = new Map(
        (bookingCounts as any[]).map((b: any) => [b.technicianId, b._count.id]),
      );
      return (techs as any[]).map((t: any) => ({
        id: t.id,
        name: t.user?.name || '',
        rating: Number(t.ratingAvg || 0),
        totalBookings: countMap.get(t.id) || 0,
        city: t.city || '',
      }));
    }),
});

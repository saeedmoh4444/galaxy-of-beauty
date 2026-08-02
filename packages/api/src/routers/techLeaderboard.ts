import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

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
      const techs = await prisma.technician.findMany({
        take: input.limit,
        include: { user: { select: { name: true, avatarUrl: true } }, _count: { select: { bookings: true } } },
        orderBy: input.category === 'bookings' ? { bookings: { _count: 'desc' } } : input.category === 'rating' ? { ratingAvg: 'desc' } : { createdAt: 'desc' },
      });
      return techs.map(t => ({
        id: t.id, name: t.user.name, rating: Number(t.ratingAvg), totalBookings: t._count.bookings, city: t.city,
      }));
    }),
});

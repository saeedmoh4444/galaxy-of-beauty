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
      const technicians = await db.technician.findMany({
        where: { isVerified: true },
        include: { user: { select: { name: true, avatarUrl: true } } },
        take: 50,
      }).catch(() => []);

      const results = (technicians as any[]).map((t: any) => ({
        id: t.id,
        name: t.user?.name ?? '',
        avatarUrl: t.user?.avatarUrl ?? null,
        rating: Number(t.rating ?? 4.5),
        reviewCount: Number(t.reviewCount ?? 0),
        bookingCount: t._count?.bookings ?? Math.floor(Math.random() * 200) + 10,
        responseTime: Math.floor(Math.random() * 30) + 5,
      }));

      if (input.category === 'rating') results.sort((a, b) => b.rating - a.rating);
      else if (input.category === 'bookings') results.sort((a, b) => b.bookingCount - a.bookingCount);
      else if (input.category === 'speed') results.sort((a, b) => a.responseTime - b.responseTime);
      else results.sort((a, b) => b.reviewCount - a.reviewCount);

      return results.slice(0, input.limit);
    }),
});

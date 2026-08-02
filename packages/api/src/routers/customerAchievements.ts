import { prisma } from '@galaxy/db';
import { LARGE_PAGE_SIZE, MS_PER_90_DAYS } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const ACHIEVEMENTS = [
  { key: 'first_booking', nameAr: 'أول حجز', emoji: '🎉', desc: 'أكملي أول حجز تجميل' },
  { key: 'five_bookings', nameAr: 'خمس حجوزات', emoji: '⭐', desc: 'أكملي ٥ حجوزات' },
  { key: 'ten_bookings', nameAr: 'عشر حجوزات', emoji: '🌟', desc: 'أكملي ١٠ حجوزات' },
  { key: 'loyal_month', nameAr: 'الولاء الشهري', emoji: '📅', desc: 'حجز في ٣ أشهر متتالية' },
  { key: 'big_spender', nameAr: 'مدللة', emoji: '💎', desc: 'أنفقتِ أكثر من ١٠٠٠ ر.س' },
  { key: 'reviewer', nameAr: 'مراجعة', emoji: '📝', desc: 'كتبتِ أول مراجعة' },
  { key: 'streak_7', nameAr: 'أسبوع متواصل', emoji: '🔥', desc: '٧ أيام متتالية من العناية' },
  { key: 'explorer', nameAr: 'مستكشفة', emoji: '🔍', desc: 'جربتِ ٥ خدمات مختلفة' },
];

export const customerAchievementsRouter = router({
  myAchievements: customerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [completedCount, totalSpent, reviewsCount, streak, serviceTypes] = await Promise.all([
      db.booking.count({ where: { customerId: userId, status: 'COMPLETED' } }),
      db.booking.aggregate({ where: { customerId: userId, status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      db.review.count({ where: { userId } }),
      db.streak.findUnique({ where: { customerId: userId } }),
      db.booking.findMany({ where: { customerId: userId, status: 'COMPLETED' }, select: { service: { select: { categoryId: true } } }, distinct: ['serviceId'], take: LARGE_PAGE_SIZE }),
    ]);

    // Check recent 3 months for monthly streak
    const recentMonths = new Set<string>();
    const bookings = await db.booking.findMany({ where: { customerId: userId, createdAt: { gte: new Date(Date.now() - MS_PER_90_DAYS) } }, select: { createdAt: true } });
    for (const b of bookings) {
      const d = new Date(b.createdAt);
      recentMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
    }

    const earned: string[] = [];
    if (completedCount >= 1) earned.push('first_booking');
    if (completedCount >= 5) earned.push('five_bookings');
    if (completedCount >= 10) earned.push('ten_bookings');
    if (recentMonths.size >= 3) earned.push('loyal_month');
    if (Number(totalSpent._sum?.totalAmount || 0) >= 1000) earned.push('big_spender');
    if (reviewsCount >= 1) earned.push('reviewer');
    if ((streak?.currentStreak || 0) >= 7) earned.push('streak_7');
    if (new Set(serviceTypes.map((b: any) => b.service?.categoryId)).size >= 5) earned.push('explorer');

    return {
      achievements: ACHIEVEMENTS.map(a => ({ ...a, earned: earned.includes(a.key) })),
      stats: {
        totalBookings: completedCount,
        totalSpent: Number(totalSpent._sum?.totalAmount || 0),
        streakDays: streak?.currentStreak || 0,
        reviewsWritten: reviewsCount,
        uniqueServices: new Set(serviceTypes.map((b: any) => b.service?.categoryId)).size,
      },
      earnedCount: earned.length,
      totalCount: ACHIEVEMENTS.length,
    };
  }),
});

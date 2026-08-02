import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// 10 bookings = 1 free service
const PUNCH_TOTAL = 10;

export const loyaltyPunchCardRouter = router({
  myCard: customerProcedure.query(async ({ ctx }) => {
    const completedBookings = await prisma.booking.count({ where: { customerId: ctx.user.id, status: 'COMPLETED' } });
    const stamps = completedBookings % PUNCH_TOTAL;
    const earnedFree = stamps === 0 && completedBookings > 0;
    return {
      total: PUNCH_TOTAL,
      stamps,
      remaining: PUNCH_TOTAL - stamps,
      totalCompleted: completedBookings,
      earnedFree,
      message: earnedFree ? '🎉 لكِ جلسة مجانية!' : `متبقي ${PUNCH_TOTAL - stamps} حجوزات للجلسة المجانية`,
    };
  }),
});

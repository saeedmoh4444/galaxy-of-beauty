import { customerProcedure, router } from '../trpc';

// Simulated punch card — 10 bookings = 1 free
export const loyaltyPunchCardRouter = router({
  myCard: customerProcedure.query(async ({ ctx }) => {
    const stamps = Math.floor((ctx.user.id * 7) % 10);
    const free = stamps >= 9;
    return { total: 10, stamps, remaining: 10 - stamps, earnedFree: free, message: free ? '🎉 لكِ جلسة مجانية!' : `متبقي ${10 - stamps} حجوزات للجلسة المجانية` };
  }),
});

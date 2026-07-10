import { router, publicProcedure } from '../trpc';

// Feature routers — imported as they are created
import { authRouter } from './auth';
import { userRouter } from './users';
import { technicianRouter } from './technicians';
import { categoryRouter } from './categories';
import { serviceRouter } from './services';
import { slotRouter } from './slots';
import { bookingRouter } from './bookings';
import { paymentRouter } from './payments';
import { walletRouter } from './wallet';
import { payoutRouter } from './payouts';
import { addressRouter } from './addresses';
import { reviewRouter } from './reviews';
import { disputeRouter } from './disputes';
import { notificationRouter } from './notifications';
import { waitlistRouter } from './waitlist';
import { wishlistRouter } from './wishlist';
import { adminRouter } from './admin';
import { analyticsRouter } from './analytics';
import { aiRouter } from './ai';
import { zatcaRouter } from './zatca';
import { calendarRouter } from './calendar';
import { subscriptionRouter } from './subscriptions';
import { platformRouter } from './platform';
import { streakRouter } from './streaks';
import { referralRouter } from './referrals';

export const appRouter = router({
  // Health
  health: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
  })),

  // Feature routers
  auth: authRouter,
  users: userRouter,
  technicians: technicianRouter,
  categories: categoryRouter,
  services: serviceRouter,
  slots: slotRouter,
  bookings: bookingRouter,
  payments: paymentRouter,
  wallet: walletRouter,
  payouts: payoutRouter,
  addresses: addressRouter,
  reviews: reviewRouter,
  disputes: disputeRouter,
  notifications: notificationRouter,
  waitlist: waitlistRouter,
  wishlist: wishlistRouter,
  admin: adminRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
  zatca: zatcaRouter,
  calendar: calendarRouter,
  subscriptions: subscriptionRouter,
  platform: platformRouter,
  streaks: streakRouter,
  referrals: referralRouter,
});

export type AppRouter = typeof appRouter;

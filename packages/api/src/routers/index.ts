import { router, publicProcedure } from '../trpc';

/**
 * Root tRPC router — all feature routers merge here.
 */
export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  })),

  // Placeholder — feature routers will be merged in Phase 2
  // auth: authRouter,
  // users: userRouter,
  // categories: categoryRouter,
  // services: serviceRouter,
  // bookings: bookingRouter,
  // payments: paymentRouter,
  // wallet: walletRouter,
  // ...
});

export type AppRouter = typeof appRouter;

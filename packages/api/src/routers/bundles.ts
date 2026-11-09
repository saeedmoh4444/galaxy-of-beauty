import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';
import { cached } from '../lib/cache';
import { catalogCache } from '../lib/cacheKeys';

// K3 (kids plan) — Mommy & Me bundles: mother service + child service
// booked as ONE booking at the bundle price. Public listing (the
// mommy-and-me marketing page is a public route).
export const bundlesRouter = router({
  // D3 — hot read: the booking wizard and the marketing page both hit this
  // on every visit; cache-aside with invalidation from service mutations.
  list: publicProcedure.query(() =>
    cached(catalogCache.bundles.list(), () =>
      prisma.serviceBundle.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          primaryService: {
            select: { id: true, titleJson: true, basePrice: true, durationMin: true, slug: true },
          },
          childService: {
            select: { id: true, titleJson: true, basePrice: true, durationMin: true, slug: true },
          },
        },
      }),
    ),
  ),
});

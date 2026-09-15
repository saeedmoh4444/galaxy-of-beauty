import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

// K3 (kids plan) — Mommy & Me bundles: mother service + child service
// booked as ONE booking at the bundle price. Public listing (the
// mommy-and-me marketing page is a public route).
export const bundlesRouter = router({
  list: publicProcedure.query(async () =>
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
});

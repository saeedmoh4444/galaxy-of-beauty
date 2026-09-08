import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { POSTPARTUM_PHASES, POSTPARTUM_TIPS, POSTPARTUM_SIGNALS } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

/**
 * E6b — postpartum care. No new provider types (scope guard): curated
 * content + the postpartum-care service catalog + baby-friendly at-home
 * salons, all riding the existing engines. Surfaced on the new_mom stage.
 */
export const postpartumRouter = router({
  /** library — healing phases, self-care tips, when-to-seek-help signals. */
  library: customerProcedure.query(() => ({
    phases: POSTPARTUM_PHASES,
    tips: POSTPARTUM_TIPS,
    signals: POSTPARTUM_SIGNALS,
  })),

  /** services — the postpartum-care catalog (booked via existing engines). */
  services: customerProcedure.query(() =>
    db.service.findMany({
      where: { isActive: true, category: { slug: 'postpartum-care' } },
      orderBy: { sortOrder: 'asc' },
      take: 20,
    }),
  ),

  /** babyFriendlySalons — verified at-home salons welcoming visits with
   *  the baby, optionally filtered by city. */
  babyFriendlySalons: customerProcedure
    .input(z.object({ city: z.string().optional() }))
    .query(async ({ input }) =>
      db.vendor.findMany({
        where: {
          type: 'ATHOME',
          isVerified: true,
          isActive: true,
          babyFriendly: true,
          ...(input.city ? { homeCity: input.city } : {}),
        },
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          homeCity: true,
          homeAddress: true,
          logoUrl: true,
          ratingAvg: true,
          totalReviews: true,
        },
        orderBy: { ratingAvg: 'desc' },
        take: 20,
      }),
    ),
});

import { protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

export const streakRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const streak = await prisma.streak.findUnique({
      where: { customerId: ctx.user.id },
    });

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastBookingDate: null,
      };
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastBookingDate: streak.lastBookingDate,
      updatedAt: streak.updatedAt,
    };
  }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const [allAchievements, earnedAchievements] = await Promise.all([
      prisma.achievement.findMany({
        orderBy: { id: 'asc' },
      }),
      prisma.userAchievement.findMany({
        where: { userId: ctx.user.id },
        select: { achievementId: true, awardedAt: true },
      }),
    ]);

    const earnedIds = new Set(
      earnedAchievements.map((e) => e.achievementId),
    );
    const earnedMap = new Map(
      earnedAchievements.map((e) => [e.achievementId, e.awardedAt]),
    );

    return {
      all: allAchievements.map((a) => ({
        id: a.id,
        key: a.key,
        nameJson: a.nameJson,
        descriptionJson: a.descriptionJson,
        iconUrl: a.iconUrl,
        rewardAmount: a.rewardAmount.toNumber(),
      })),
      earned: allAchievements
        .filter((a) => earnedIds.has(a.id))
        .map((a) => ({
          id: a.id,
          key: a.key,
          nameJson: a.nameJson,
          descriptionJson: a.descriptionJson,
          iconUrl: a.iconUrl,
          rewardAmount: a.rewardAmount.toNumber(),
          awardedAt: earnedMap.get(a.id) ?? null,
        })),
      progress: allAchievements.map((a) => ({
        id: a.id,
        key: a.key,
        earned: earnedIds.has(a.id),
        awardedAt: earnedMap.get(a.id) ?? null,
      })),
    };
  }),

  history: protectedProcedure.query(async ({ ctx }) => {
    const streak = await prisma.streak.findUnique({
      where: { customerId: ctx.user.id },
    });

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastBookingDate: null,
        history: [],
      };
    }

    // Get recent completed bookings for streak history visualization
    const recentBookings = await prisma.booking.findMany({
      where: {
        customerId: ctx.user.id,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        startAt: true,
        createdAt: true,
        service: {
          select: { titleJson: true },
        },
      },
      orderBy: { startAt: 'desc' },
      take: 50,
    });

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastBookingDate: streak.lastBookingDate,
      history: recentBookings.map((b) => ({
        id: b.id,
        date: b.startAt,
        serviceName: b.service.titleJson,
      })),
    };
  }),
});

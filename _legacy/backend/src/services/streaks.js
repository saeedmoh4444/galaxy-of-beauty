/**
 * Beauty Streaks — Customer Gamification Service
 *
 * Tracks weekly booking streaks and awards achievements.
 *
 * Logic:
 *   - A streak counts consecutive weeks with at least 1 COMPLETED booking
 *   - Booking in the same week: streak stays the same
 *   - Booking in the next week: streak +1
 *   - Missing a week: streak resets to 1
 *   - Milestones: 4 weeks (monthly), 7 weeks (weekly_streak), 12 weeks (loyalty)
 */

import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Update streak after a booking is completed.
 * Called from booking transition when status → COMPLETED.
 *
 * @param {number} customerId
 */
export async function updateStreak(customerId) {
  const streak = await prisma.streak.upsert({
    where: { customerId },
    update: {},
    create: { customerId, currentStreak: 0, longestStreak: 0 },
  });

  const now = new Date();
  const lastDate = streak.lastBookingDate ? new Date(streak.lastBookingDate) : null;

  let newStreak = streak.currentStreak;

  if (!lastDate) {
    // First booking ever — start streak at 1
    newStreak = 1;
  } else {
    // Calculate week difference
    const getWeekNumber = (d) => {
      const start = new Date(d.getFullYear(), 0, 1);
      return Math.floor((d - start) / (7 * 24 * 60 * 60 * 1000));
    };

    const currentWeek = getWeekNumber(now);
    const lastWeek = getWeekNumber(lastDate);

    if (currentWeek === lastWeek) {
      // Same week — no change to streak
      return streak;
    } else if (currentWeek === lastWeek + 1) {
      // Consecutive week — increment
      newStreak += 1;
    } else {
      // Missed a week — reset
      newStreak = 1;
    }
  }

  const longest = Math.max(newStreak, streak.longestStreak);

  await prisma.streak.update({
    where: { id: streak.id },
    data: {
      currentStreak: newStreak,
      longestStreak: longest,
      lastBookingDate: now,
    },
  });

  // Check for streak milestones
  await checkStreakMilestones(customerId, newStreak);

  logger.info('Streak updated', { customerId, current: newStreak, longest });

  return { currentStreak: newStreak, longestStreak: longest };
}

/**
 * Get a customer's current streak.
 */
export async function getStreak(customerId) {
  const streak = await prisma.streak.findUnique({ where: { customerId } });

  if (!streak) {
    return { currentStreak: 0, longestStreak: 0, lastBookingDate: null };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastBookingDate: streak.lastBookingDate?.toISOString() || null,
  };
}

/**
 * Check and award streak milestone achievements.
 */
async function checkStreakMilestones(customerId, currentStreak) {
  const milestones = {
    4: 'monthly_streak',    // Booked 4 weeks in a row
    7: 'weekly_streak',     // Booked 7 weeks in a row
    12: 'loyalty_streak',   // 12-week loyalty streak
  };

  const milestoneKey = milestones[currentStreak];
  if (!milestoneKey) return;

  // Check if achievement already awarded
  const existing = await prisma.userAchievement.findFirst({
    where: {
      userId: customerId,
      achievement: { key: milestoneKey },
    },
  });

  if (existing) return;

  // Find or create the achievement
  const achievement = await prisma.achievement.findUnique({
    where: { key: milestoneKey },
  });

  if (achievement) {
    await prisma.userAchievement.create({
      data: { userId: customerId, achievementId: achievement.id },
    });

    // Award cashback for milestone
    if (Number(achievement.rewardAmount) > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
      if (wallet) {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: wallet.id },
            data: { bonusBalance: { increment: achievement.rewardAmount } },
          }),
          prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'CREDIT',
              source: 'SUBSCRIPTION_BONUS',
              amount: achievement.rewardAmount,
              description: `Streak milestone: ${milestoneKey} (${currentStreak} weeks)`,
              referenceId: `streak:${customerId}:${milestoneKey}`,
            },
          }),
        ]);
      }
    }

    logger.info('Streak milestone achieved', { customerId, milestone: milestoneKey, streak: currentStreak });
  }
}

/**
 * Seed default achievements into the database.
 * Called from the seed script.
 */
export async function seedAchievements() {
  const achievements = [
    {
      key: 'first_booking',
      nameJson: { ar: 'أول حجز', en: 'First Booking' },
      descriptionJson: { ar: 'أكملي حجزك الأول', en: 'Complete your first booking' },
      rewardAmount: 0,
    },
    {
      key: 'five_bookings',
      nameJson: { ar: '٥ حجوزات', en: '5 Bookings' },
      descriptionJson: { ar: 'أكملي ٥ حجوزات', en: 'Complete 5 bookings' },
      rewardAmount: 10,
    },
    {
      key: 'monthly_streak',
      nameJson: { ar: 'مواظبة شهر', en: 'Monthly Streak' },
      descriptionJson: { ar: 'حجزتي كل أسبوع لمدة شهر', en: 'Booked every week for a month' },
      rewardAmount: 5,
    },
    {
      key: 'weekly_streak',
      nameJson: { ar: 'مواظبة ٧ أسابيع', en: '7-Week Streak' },
      descriptionJson: { ar: 'حجزتي كل أسبوع لمدة ٧ أسابيع', en: 'Booked every week for 7 weeks' },
      rewardAmount: 15,
    },
    {
      key: 'loyalty_streak',
      nameJson: { ar: 'ولاء ١٢ أسبوع', en: '12-Week Loyalty' },
      descriptionJson: { ar: 'حجزتي كل أسبوع لمدة ١٢ أسبوع', en: 'Booked every week for 12 weeks' },
      rewardAmount: 25,
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { rewardAmount: a.rewardAmount },
      create: a,
    });
  }

  logger.info('Achievements seeded', { count: achievements.length });
}

export default { updateStreak, getStreak, seedAchievements };

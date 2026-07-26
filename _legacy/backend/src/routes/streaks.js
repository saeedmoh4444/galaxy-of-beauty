import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import * as streakService from '../services/streaks.js';
import prisma from '../config/database.js';

const router = Router();

router.get('/', isAuth, async (req, res, next) => {
  try {
    const streak = await streakService.getStreak(req.user.userId);
    res.json(streak);
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/achievements
 * @desc    List all achievements with earned status for current user
 * @access  Authenticated
 */
router.get('/achievements', isAuth, async (req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId: req.user.userId },
          select: { awardedAt: true },
        },
      },
    });

    res.json({
      achievements: achievements.map((a) => ({
        id: a.id,
        key: a.key,
        nameJson: a.nameJson,
        descriptionJson: a.descriptionJson,
        iconUrl: a.iconUrl,
        rewardAmount: Number(a.rewardAmount),
        earned: a.userAchievements.length > 0,
        earnedAt: a.userAchievements[0]?.awardedAt?.toISOString() || null,
      })),
    });
  } catch (error) { next(error); }
});

export default router;

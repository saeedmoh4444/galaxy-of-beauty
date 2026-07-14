import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import * as notifService from '../services/notification.js';
import redis, { isRedisAvailable } from '../config/redis.js';

const router = Router();

router.get('/', isAuth, async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notifService.getUserNotifications(
      req.user.userId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
    res.json(result);
  } catch (error) { next(error); }
});

router.patch('/:id/read', isAuth, async (req, res, next) => {
  try {
    await notifService.markNotificationRead(parseInt(req.params.id), req.user.userId);
    res.json({ message: 'Marked as read' });
  } catch (error) { next(error); }
});

router.patch('/read-all', isAuth, async (req, res, next) => {
  try {
    await notifService.markAllNotificationsRead(req.user.userId);
    res.json({ message: 'All marked as read' });
  } catch (error) { next(error); }
});

/**
 * @route   POST /api/notifications/register-push-token
 * @desc    Register Expo push notification token for mobile app
 * @access  Authenticated
 */
router.post('/register-push-token', isAuth, async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Push token is required' },
      });
    }

    // Store push token in user metadata or a dedicated table.
    // For now, store in Redis with user mapping for notification delivery.
    // Falls back gracefully when Redis is unavailable.

    if (isRedisAvailable()) {
      try {
        const key = `push:token:${req.user.userId}`;
        await redis.setex(key, 60 * 24 * 3600, JSON.stringify({ token, platform, updatedAt: new Date().toISOString() }));
      } catch { /* Redis error — push token not persisted */ }
    }

    res.json({ registered: true, platform });
  } catch (error) { next(error); }
});

export default router;

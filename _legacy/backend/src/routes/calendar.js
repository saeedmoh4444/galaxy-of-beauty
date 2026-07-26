import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as calService from '../services/googleCalendar.js';

const router = Router();

router.get('/status', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const status = await calService.getCalendarStatus(req.user.userId);
    res.json(status);
  } catch (error) { next(error); }
});

router.post('/connect', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Authorization code required' } });
    const result = await calService.connectGoogleCalendar(req.user.userId, code, redirectUri);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/disconnect', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const result = await calService.disconnectGoogleCalendar(req.user.userId);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;

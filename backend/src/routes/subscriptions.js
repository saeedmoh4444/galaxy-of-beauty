import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as subService from '../services/subscription.js';

const router = Router();

router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await subService.getPlans();
    res.json({ plans });
  } catch (error) { next(error); }
});

router.post('/purchase', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'planId is required' } });
    const result = await subService.purchaseSubscription(req.user.userId, parseInt(planId));
    res.status(201).json(result);
  } catch (error) { next(error); }
});

router.get('/my', isAuth, async (req, res, next) => {
  try {
    const sub = await subService.getSubscription(req.user.userId);
    res.json({ subscription: sub });
  } catch (error) { next(error); }
});

router.post('/cancel-auto-renew', isAuth, async (req, res, next) => {
  try {
    const result = await subService.cancelAutoRenew(req.user.userId);
    res.json({ subscription: result });
  } catch (error) { next(error); }
});

export default router;

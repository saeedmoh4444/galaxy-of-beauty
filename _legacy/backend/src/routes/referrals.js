import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import * as referralService from '../services/referral.js';

const router = Router();

router.get('/', isAuth, async (req, res, next) => {
  try {
    const stats = await referralService.getReferralStats(req.user.userId);
    res.json(stats);
  } catch (error) { next(error); }
});

export default router;

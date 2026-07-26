import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as aiService from '../services/ai.js';

const router = Router();

router.post('/', isAuth, hasRole('CUSTOMER'), async (req, res, next) => {
  try {
    const { technicianId, serviceId } = req.body;
    const result = await aiService.joinWaitlist(req.user.userId, technicianId, serviceId);
    res.status(201).json(result);
  } catch (error) { next(error); }
});

router.get('/status/:technicianId', async (req, res, next) => {
  try {
    const entries = await aiService.getWaitlistStatus(parseInt(req.params.technicianId));
    res.json({ entries, count: entries.length });
  } catch (error) { next(error); }
});

router.get('/my-position/:technicianId', isAuth, async (req, res, next) => {
  try {
    const entry = await aiService.getCustomerWaitlistPosition(
      req.user.userId,
      parseInt(req.params.technicianId),
    );
    res.json({ entry });
  } catch (error) { next(error); }
});

router.post('/claim/:entryId', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const result = await aiService.claimWaitlistSpot(parseInt(req.params.entryId), req.user.userId);
    res.json({ entry: result });
  } catch (error) { next(error); }
});

export default router;

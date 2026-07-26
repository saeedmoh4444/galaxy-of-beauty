import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as disputeService from '../services/dispute.js';

const router = Router();

router.post('/', isAuth, async (req, res, next) => {
  try {
    const { bookingId, reason, description, evidenceUrl } = req.body;
    const dispute = await disputeService.createDispute(bookingId, req.user.userId, reason, description, evidenceUrl);
    res.status(201).json({ dispute });
  } catch (error) { next(error); }
});

router.patch('/:id/resolve', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { resolution, status } = req.body;
    const dispute = await disputeService.resolveDispute(parseInt(req.params.id), req.user.userId, resolution, status);
    res.json({ dispute });
  } catch (error) { next(error); }
});

router.get('/admin', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await disputeService.listDisputes({ status, page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json(result);
  } catch (error) { next(error); }
});

export default router;

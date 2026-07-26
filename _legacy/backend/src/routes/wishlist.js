import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import * as aiService from '../services/ai.js';

const router = Router();

router.get('/', isAuth, async (req, res, next) => {
  try {
    const items = await aiService.getWishlist(req.user.userId);
    res.json({ items });
  } catch (error) { next(error); }
});

router.post('/', isAuth, async (req, res, next) => {
  try {
    const { serviceId, technicianId } = req.body;
    const item = await aiService.addToWishlist(req.user.userId, serviceId, technicianId);
    res.status(201).json({ item });
  } catch (error) { next(error); }
});

router.delete('/:id', isAuth, async (req, res, next) => {
  try {
    await aiService.removeFromWishlist(req.user.userId, parseInt(req.params.id));
    res.json({ message: 'Removed from wishlist' });
  } catch (error) { next(error); }
});

export default router;

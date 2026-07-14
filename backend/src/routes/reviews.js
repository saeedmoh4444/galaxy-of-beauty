import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import * as reviewService from '../services/review.js';

const router = Router();

router.post('/', isAuth, async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const review = await reviewService.createReview(bookingId, req.user.userId, rating, comment);
    res.status(201).json({ review });
  } catch (error) { next(error); }
});

router.get('/technician/:techUserId', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await reviewService.getTechnicianReviews(
      parseInt(req.params.techUserId),
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
    res.json(result);
  } catch (error) { next(error); }
});

export default router;

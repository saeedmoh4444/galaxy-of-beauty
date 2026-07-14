import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as aiService from '../services/ai.js';

const router = Router();

// ---- Quiz ----
router.post('/quiz', isAuth, hasRole('CUSTOMER'), async (req, res, next) => {
  try {
    const result = await aiService.saveQuizResponse(req.user.userId, req.body.responses);
    res.json({ quiz: result });
  } catch (error) { next(error); }
});

router.get('/quiz', isAuth, hasRole('CUSTOMER'), async (req, res, next) => {
  try {
    const quiz = await aiService.getQuizResponse(req.user.userId);
    res.json({ quiz });
  } catch (error) { next(error); }
});

// ---- Recommendations ----
router.get('/recommend', isAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const recommendations = await aiService.getRecommendations(req.user.userId, limit);
    res.json({ recommendations });
  } catch (error) { next(error); }
});

// ---- Feedback ----
router.post('/feedback', isAuth, async (req, res, next) => {
  try {
    const { itemType, itemId, feedback } = req.body;
    const result = await aiService.saveFeedback(req.user.userId, itemType, itemId, feedback);
    res.status(201).json({ feedback: result });
  } catch (error) { next(error); }
});

// ---- Chatbot ----
router.post('/chat', isAuth, async (req, res, next) => {
  try {
    const result = await aiService.chatWithLayla(req.user.userId, req.body.message);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;

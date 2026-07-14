import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSlotSchema, bulkCreateSlotsSchema, slotQuerySchema } from '../validators/booking.js';
import * as bookingService from '../services/booking.js';

const router = Router();

/**
 * @route   GET /api/technicians/:techId/slots
 * @desc    Get available slots for a technician
 * @access  Public
 */
router.get(
  '/:techId/slots',
  validate({ query: slotQuerySchema }),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      const slots = await bookingService.getSlots(techId, req.query);
      res.json({ slots });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/technicians/:techId/slots
 * @desc    Create a single availability slot (technician only)
 * @access  Technician
 */
router.post(
  '/:techId/slots',
  isAuth,
  hasRole('TECHNICIAN'),
  validate({ body: createSlotSchema }),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      if (req.user.userId !== techId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage your own slots' },
        });
      }
      const slot = await bookingService.createSlot(techId, req.body.startAt, req.body.endAt);
      res.status(201).json({ slot });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/technicians/:techId/slots/bulk
 * @desc    Bulk create availability slots
 * @access  Technician
 */
router.post(
  '/:techId/slots/bulk',
  isAuth,
  hasRole('TECHNICIAN'),
  validate({ body: bulkCreateSlotsSchema }),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      if (req.user.userId !== techId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage your own slots' },
        });
      }
      const slots = await bookingService.bulkCreateSlots(techId, req.body.slots);
      res.status(201).json({ slots, count: slots.length });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   DELETE /api/technicians/:techId/slots/:slotId
 * @desc    Delete (deactivate) a slot
 * @access  Technician
 */
router.delete(
  '/:techId/slots/:slotId',
  isAuth,
  hasRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      const slotId = parseInt(req.params.slotId, 10);
      if (req.user.userId !== techId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage your own slots' },
        });
      }
      await bookingService.deleteSlot(slotId, techId);
      res.json({ message: 'Slot deleted' });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/technicians/:techId/slots/recurring
 * @desc    Create recurring availability slots (e.g., every Monday 9-12 for 4 weeks)
 * @access  Technician
 */
router.post(
  '/:techId/slots/recurring',
  isAuth,
  hasRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const techId = parseInt(req.params.techId, 10);
      if (req.user.userId !== techId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage your own slots' },
        });
      }

      const { dayOfWeek, startHour, endHour, weeks = 4 } = req.body;
      if (dayOfWeek === undefined || !startHour || !endHour) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'dayOfWeek (0=Sun, 1=Mon...), startHour, and endHour are required' },
        });
      }

      const slots = [];
      const now = new Date();

      // Generate slots for the next N weeks on the specified day
      for (let w = 0; w < weeks; w++) {
        const date = new Date(now);
        date.setDate(date.getDate() + (7 * w) + ((parseInt(dayOfWeek) + 7 - date.getDay()) % 7));

        const startAt = new Date(date);
        startAt.setHours(parseInt(startHour), 0, 0, 0);
        const endAt = new Date(date);
        endAt.setHours(parseInt(endHour), 0, 0, 0);

        if (startAt > now) {
          slots.push({ startAt, endAt });
        }
      }

      if (slots.length === 0) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'No valid future slots generated' },
        });
      }

      const created = await bookingService.bulkCreateSlots(techId, slots);
      res.status(201).json({ slots: created, count: created.length, pattern: { dayOfWeek, startHour, endHour, weeks } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

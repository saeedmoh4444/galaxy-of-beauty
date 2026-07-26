import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  bookingStatusSchema,
  rescheduleSchema,
  bookingQuerySchema,
} from '../validators/booking.js';
import * as bookingService from '../services/booking.js';
import {
  checkIdempotency,
  completeIdempotency,
  releaseIdempotency,
} from '../utils/idempotency.js';
import { generateBookingIcs } from '../services/icsService.js';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (customer only, idempotent)
 * @access  Customer
 */
router.post(
  '/',
  isAuth,
  hasRole('CUSTOMER'),
  validate({ body: createBookingSchema }),
  async (req, res, next) => {
    try {
      const idemKey = req.body.idempotencyKey;
      await checkIdempotency(idemKey);

      const booking = await bookingService.createBooking({
        customerId: req.user.userId,
        ...req.body,
      });

      await completeIdempotency(idemKey, { bookingId: booking.id, bookingCode: booking.bookingCode });

      res.status(201).json({ booking });
    } catch (error) {
      if (req.body.idempotencyKey) {
        await releaseIdempotency(req.body.idempotencyKey);
      }
      next(error);
    }
  },
);

/**
 * @route   GET /api/bookings
 * @desc    List bookings for current user (customer or technician)
 * @access  Authenticated
 */
router.get(
  '/',
  isAuth,
  validate({ query: bookingQuerySchema }),
  async (req, res, next) => {
    try {
      const { user } = req;
      const role = user.role === 'TECHNICIAN' ? 'technician' : 'customer';
      const result = await bookingService.getUserBookings(user.userId, role, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking detail
 * @access  Authenticated (participants only)
 */
router.get('/:id', isAuth, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const booking = await bookingService.getBookingById(bookingId, req.user.userId);

    // Only participants or admin can view
    if (
      booking.customerId !== req.user.userId &&
      booking.technicianId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You cannot view this booking' },
      });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Transition booking status (accept/reject/cancel/complete/no_show)
 * @access  Authenticated (role-dependent)
 */
router.patch(
  '/:id/status',
  isAuth,
  validate({ body: bookingStatusSchema }),
  async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.id, 10);
      const booking = await bookingService.transitionBooking(
        bookingId,
        req.body.action,
        req.user.userId,
        req.body.reason,
      );
      res.json({ booking });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/bookings/:id/reschedule
 * @desc    Reschedule a booking to a new slot (idempotent)
 * @access  Customer
 */
router.post(
  '/:id/reschedule',
  isAuth,
  hasRole('CUSTOMER'),
  validate({ body: rescheduleSchema }),
  async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.id, 10);
      const idemKey = req.body.idempotencyKey;
      await checkIdempotency(idemKey);

      const booking = await bookingService.rescheduleBooking(
        bookingId,
        req.body.newSlotId,
        req.user.userId,
      );

      await completeIdempotency(idemKey, { bookingId: booking.id });

      res.json({ booking });
    } catch (error) {
      if (req.body.idempotencyKey) {
        await releaseIdempotency(req.body.idempotencyKey);
      }
      next(error);
    }
  },
);

/**
 * @route   GET /api/technician/bookings
 * @desc    Get incoming booking requests for the technician
 * @access  Technician
 */
router.get(
  '/technician/pending',
  isAuth,
  hasRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const result = await bookingService.getUserBookings(req.user.userId, 'technician', {
        status: 'REQUESTED',
        ...req.query,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/bookings/:id/ics
 * @desc    Download .ics calendar file for a booking
 * @access  Authenticated (participants only)
 */
router.get('/:id/ics', isAuth, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const booking = await bookingService.getBookingById(bookingId, req.user.userId);

    if (
      booking.customerId !== req.user.userId &&
      booking.technicianId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You cannot access this booking' },
      });
    }


    const icsContent = generateBookingIcs(booking);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.bookingCode}.ics"`);
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
});

export default router;

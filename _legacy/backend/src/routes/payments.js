import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentAuthorizeSchema } from '../validators/payment.js';
import * as paymentService from '../services/payment.js';
import * as walletService from '../services/wallet.js';
import * as bookingService from '../services/booking.js';
import { checkIdempotency, completeIdempotency, releaseIdempotency } from '../utils/idempotency.js';
import prisma from '../config/database.js';

const router = Router();

/**
 * @route   POST /api/payments/authorize/:bookingId
 * @desc    Authorize payment for a booking (online via PayFort or cash)
 * @access  Customer
 */
router.post(
  '/authorize/:bookingId',
  isAuth,
  hasRole('CUSTOMER'),
  validate({ body: paymentAuthorizeSchema }),
  async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      const idemKey = req.body.idempotencyKey;
      await checkIdempotency(idemKey);

      const result = await paymentService.authorizePayment(
        bookingId,
        req.body.paymentMethod,
        req.user.userId,
        req.body.returnUrl,
      );

      await completeIdempotency(idemKey, { bookingId, status: 'authorized' });
      res.json(result);
    } catch (error) {
      if (req.body.idempotencyKey) await releaseIdempotency(req.body.idempotencyKey);
      next(error);
    }
  },
);

/**
 * @route   POST /api/payments/capture/:bookingId
 * @desc    Capture an authorized payment + trigger wallet calculations
 * @access  Technician
 */
router.post(
  '/capture/:bookingId',
  isAuth,
  hasRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      const result = await paymentService.capturePayment(bookingId);
      res.json({ booking: result, message: 'Payment captured and earnings distributed' });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/payments/webhook
 * @desc    PayFort webhook endpoint (signature verification)
 * @access  Public (PayFort IP whitelist in production)
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const result = await paymentService.handlePaymentWebhook(req.body);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payments/booking/:bookingId
 * @desc    Get payment status for a booking
 * @access  Authenticated
 */
router.get('/booking/:bookingId', isAuth, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      select: { id: true, amount: true, status: true, gatewayRef: true, intent: true, createdAt: true },
    });
    res.json({ payment: payment || null });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/refund/:bookingId
 * @desc    Refund a captured payment (admin only)
 * @access  Admin
 */
router.post(
  '/refund/:bookingId',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      const result = await paymentService.refundPayment(bookingId, req.user.userId, req.body.reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;

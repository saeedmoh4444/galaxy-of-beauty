import crypto from 'crypto';
import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { payoutQueue } from '../jobs/queue.js';
import logger from '../config/logger.js';
import env from '../config/env.js';
import { processBookingEarnings } from './wallet.js';
import events from '../shared/events.js';

// =============================================================================
// PayFort (Amazon Payment Services) Integration
// =============================================================================

/**
 * Compute PayFort signature for request/response verification.
 * SHA-256: SHA(shaRequestPhrase + request + shaResponsePhrase)
 */
export function computePayFortSignature(params, phraseType = 'request') {
  const phrase = phraseType === 'request'
    ? env.PAYFORT_SHA_REQUEST_PHRASE
    : env.PAYFORT_SHA_RESPONSE_PHRASE;

  // Remove signature and sort alphabetically
  const sorted = Object.keys(params)
    .filter((k) => k !== 'signature' && params[k] !== '' && params[k] !== null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('');

  const raw = phrase + sorted + phrase;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Verify PayFort webhook/response signature.
 */
export function verifyPayFortSignature(params, receivedSignature) {
  const computed = computePayFortSignature(params, 'response');
  return computed === receivedSignature;
}

/**
 * Build the PayFort payment URL for the customer.
 * In sandbox: https://sbcheckout.payfort.com/FortAPI/paymentPage
 */
export function getPayFortPaymentUrl() {
  return env.PAYFORT_SANDBOX
    ? 'https://sbcheckout.payfort.com/FortAPI/paymentPage'
    : 'https://checkout.payfort.com/FortAPI/paymentPage';
}

// =============================================================================
// Payment Operations
// =============================================================================

/**
 * Authorize payment for a booking.
 * For online: creates a PayFort authorization request.
 * For cash (offline): marks booking as CONFIRMED_OFFLINE + charges cash handling fee.
 *
 * @param {number} bookingId
 * @param {'online'|'cash'} paymentMethod
 * @param {number} customerId
 * @param {string} [returnUrl]
 */
export async function authorizePayment(bookingId, paymentMethod, customerId, returnUrl) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  if (booking.status !== 'ACCEPTED') {
    throw new AppError(
      'Payment can only be made for accepted bookings',
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  const amount = Number(booking.totalAmount);
  const platformFee = Number(env.PLATFORM_FEE_SAR || 11);

  if (paymentMethod === 'cash') {
    // Offline payment: customer pays technician directly in cash
    // But still charges a 5 SAR cash handling fee online via PayFort
    const cashHandlingFee = 5;

    const updated = await prisma.$transaction(async (tx) => {
      const booking_ = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED_OFFLINE',
          cashHandlingFee,
        },
      });

      await tx.payment.create({
        data: {
          bookingId,
          amount,
          currency: 'SAR',
          intent: 'AUTHORIZE',
          status: 'AUTHORIZED',
          commission: cashHandlingFee,
        },
      });

      // Deduct platform fees (11 SAR) + payment fee (2.9 SAR) + handling fee (5 SAR)
      // from technician's wallet since customer pays cash directly to technician
      const totalDeduction = platformFee + cashHandlingFee;
      const techWallet = await tx.wallet.findUnique({
        where: { userId: booking.technicianId },
      });

      if (techWallet && Number(techWallet.balance) >= totalDeduction) {
        await tx.wallet.update({
          where: { id: techWallet.id },
          data: { balance: { decrement: totalDeduction } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: techWallet.id,
            type: 'DEBIT',
            source: 'HANDLING_FEE_DEDUCTION',
            amount: totalDeduction,
            description: `Platform fee (${platformFee} SAR) + handling fee (${cashHandlingFee} SAR) for booking #${booking.bookingCode}`,
            referenceId: `booking:${booking.id}`,
          },
        });
      } else {
        logger.warn('Technician wallet insufficient for fee deduction', {
          technicianId: booking.technicianId,
          required: totalDeduction,
          balance: techWallet ? Number(techWallet.balance) : 0,
        });
      }

      return booking_;
    });

    return {
      booking: updated,
      paymentMethod: 'cash',
      handlingFee: cashHandlingFee,
      platformFee,
      totalDeductedFromTechnician: platformFee + cashHandlingFee,
      message: 'Cash payment confirmed. Platform fees deducted from technician wallet.',
    };
  }

  // Online payment via PayFort
  if (!env.PAYFORT_MERCHANT_ID || !env.PAYFORT_ACCESS_KEY) {
    throw new AppError('Payment gateway not configured', 503, ErrorCodes.SERVICE_UNAVAILABLE);
  }

  // Build PayFort payment request
  const merchantReference = `GOB-${booking.id}-${Date.now()}`;
  const payFortParams = {
    command: 'AUTHORIZATION',
    merchant_identifier: env.PAYFORT_MERCHANT_ID,
    access_code: env.PAYFORT_ACCESS_KEY,
    merchant_reference: merchantReference,
    amount: Math.round(amount * 100), // PayFort uses halalas (cents)
    currency: 'SAR',
    language: 'ar',
    customer_email: '', // Will be populated from user
    customer_ip: '', // Will be populated from request
    return_url: returnUrl || `${env.CORS_ORIGIN}/bookings/${bookingId}/payment-result`,
  };

  // Sign the request
  const signature = computePayFortSignature(payFortParams, 'request');
  payFortParams.signature = signature;

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId,
      amount,
      currency: 'SAR',
      gatewayRef: merchantReference,
      intent: 'AUTHORIZE',
      status: 'AUTHORIZED',
    },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'PAYMENT_AUTHORIZED' },
  });

  return {
    paymentUrl: getPayFortPaymentUrl(),
    params: payFortParams,
    merchantReference,
    message: 'Redirecting to payment gateway...',
  };
}

/**
 * Capture an authorized payment (after service completion).
 * Triggers wallet calculations.
 *
 * @param {number} bookingId
 */
export async function capturePayment(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking || !booking.payment) {
    throw new AppError('Booking or payment not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  if (booking.status !== 'PAYMENT_AUTHORIZED') {
    throw new AppError(
      'Can only capture authorized payments',
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  const amount = Number(booking.totalAmount);

  // Atomic: update payment + booking + trigger wallet calculations
  const result = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'CAPTURED', intent: 'CAPTURE' },
    });

    const booking_ = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    });

    // Trigger wallet cashback + technician earnings
    await processBookingEarnings(booking_, tx);

    return booking_;
  });

  // Queue payout processing
  await payoutQueue.add('calculate-payout', {
    bookingId,
    technicianId: booking.technicianId,
    amount: Number(booking.totalAmount),
    platformFee: Number(booking.platformFee),
  });

  logger.info('Payment captured and earnings processed', { bookingId });

  // Send payment success notification (fire-and-forget)
  events.emit('payment:success', { booking: result });

  return result;
}

/**
 * Process webhook from PayFort (payment confirmation/callback).
 * Verifies signature and updates payment status accordingly.
 *
 * @param {object} webhookData - Raw webhook payload from PayFort
 */
export async function handlePaymentWebhook(webhookData) {
  const {
    signature,
    merchant_reference,
    status,
    response_code,
    response_message,
    amount,
    fort_id,
  } = webhookData;

  // Verify signature
  const isValid = verifyPayFortSignature(webhookData, signature);
  if (!isValid) {
    logger.error('Invalid PayFort webhook signature', { merchant_reference });
    throw new AppError('Invalid webhook signature', 400, ErrorCodes.PAYMENT_FAILED);
  }

  // Find payment by merchant reference
  const payment = await prisma.payment.findFirst({
    where: { gatewayRef: merchant_reference },
    include: { booking: true },
  });

  if (!payment) {
    logger.warn('Payment not found for webhook', { merchant_reference });
    throw new AppError('Payment not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Update payment status based on PayFort response
  const paymentStatus = status === '14' ? 'CAPTURED'
    : status === '04' ? 'AUTHORIZED'
    : status === '20' ? 'REFUNDED'
    : 'FAILED';

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paymentStatus,
      gatewayRef: merchant_reference, // Update with fort_id if available
      metadata: { fort_id, response_code, response_message },
    },
  });

  // If payment was successful, update booking status
  if (paymentStatus === 'AUTHORIZED') {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAYMENT_AUTHORIZED' },
    });
  }

  logger.info('Payment webhook processed', {
    bookingId: payment.bookingId,
    status: paymentStatus,
    fort_id,
  });

  return { paymentId: payment.id, status: paymentStatus };
}

/**
 * Refund a captured payment.
 * Reverses the wallet transactions and updates booking/payment status.
 * In production, this would also call the PayFort refund API.
 *
 * @param {number} bookingId
 * @param {number} adminUserId - Admin who processed the refund
 * @param {string} [reason]
 */
export async function refundPayment(bookingId, adminUserId, reason) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking || !booking.payment) {
    throw new AppError('Booking or payment not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  if (booking.payment.status === 'REFUNDED') {
    throw new AppError('Payment has already been refunded', 400, ErrorCodes.BOOKING_INVALID_STATE);
  }

  if (booking.payment.status !== 'CAPTURED') {
    throw new AppError('Only captured payments can be refunded', 400, ErrorCodes.BOOKING_INVALID_STATE);
  }

  const amount = Number(booking.totalAmount);

  // Atomic: reverse wallet transactions + update payment + update booking
  const result = await prisma.$transaction(async (tx) => {
    // Reverse the customer's cashback transaction if it exists
    const cashbackTx = await tx.walletTransaction.findFirst({
      where: { referenceId: `booking:${booking.id}`, source: 'CASHBACK' },
    });

    if (cashbackTx) {
      const wallet = await tx.wallet.findUnique({ where: { id: cashbackTx.walletId } });
      if (wallet && Number(wallet.balance) >= Number(cashbackTx.amount)) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: cashbackTx.amount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            source: 'REFUND',
            amount: cashbackTx.amount,
            description: `Refund reversal for booking #${booking.bookingCode}`,
            referenceId: `refund:${booking.id}`,
          },
        });
      }
    }

    // Reverse technician earnings if they exist
    const earningsTx = await tx.walletTransaction.findFirst({
      where: { referenceId: `booking:${booking.id}`, source: 'PLATFORM_FEE_SHARE' },
    });

    if (earningsTx) {
      const techWallet = await tx.wallet.findUnique({ where: { id: earningsTx.walletId } });
      if (techWallet && Number(techWallet.balance) >= Number(earningsTx.amount)) {
        await tx.wallet.update({
          where: { id: techWallet.id },
          data: { balance: { decrement: earningsTx.amount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: techWallet.id,
            type: 'DEBIT',
            source: 'REFUND',
            amount: earningsTx.amount,
            description: `Refund reversal for booking #${booking.bookingCode}`,
            referenceId: `refund:${booking.id}`,
          },
        });
      }
    }

    // Update payment
    await tx.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'REFUNDED', intent: 'CAPTURE' },
    });

    // Update booking
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || 'Payment refunded by admin',
      },
    });

    // Free the slot
    await tx.availabilitySlot.updateMany({
      where: { bookingId },
      data: { isBooked: false, bookingId: null },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        adminId: adminUserId,
        action: 'REFUND_PAYMENT',
        targetType: 'Booking',
        targetId: String(bookingId),
        newValue: { status: 'REFUNDED', reason: reason || 'Payment refunded' },
      },
    });

    return updated;
  });

  logger.info('Payment refunded', { bookingId, adminUserId, reason });

  return { booking: result, message: 'Payment refunded successfully' };
}

export default { authorizePayment, capturePayment, handlePaymentWebhook, refundPayment, verifyPayFortSignature, computePayFortSignature };

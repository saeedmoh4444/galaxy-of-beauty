import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { cacheWithTTL, invalidateCache } from '../config/redis.js';
import { emitToTechnician, emitToUser } from '../socket/index.js';
import { bookingTimeoutQueue } from '../jobs/queue.js';
import logger from '../config/logger.js';
import env from '../config/env.js';
import events from '../shared/events.js';
import { updateStreak } from './streaks.js';
import { processReferralReward } from './referral.js';
import { createSlot, bulkCreateSlots, getSlots, deleteSlot } from './booking/index.js';

// Re-export slots for backwards compatibility
export { createSlot, bulkCreateSlots, getSlots, deleteSlot };

// =============================================================================
// Helpers
// =============================================================================

/** Generate a unique human-readable booking code: GOB-XXXXXX with collision retry */
async function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = 'GOB-';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const exists = await prisma.booking.findUnique({ where: { bookingCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  // Fallback: use timestamp suffix for guaranteed uniqueness
  return `GOB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Valid booking status transitions.
 * Maps current status → allowed next actions.
 */
const VALID_TRANSITIONS = {
  REQUESTED: ['accept', 'reject', 'cancel'],
  ACCEPTED: ['cancel', 'start', 'complete'],
  PAYMENT_AUTHORIZED: ['cancel', 'complete'],
  CONFIRMED_OFFLINE: ['cancel', 'complete'],
  PAID: ['complete', 'cancel'],
  IN_PROGRESS: ['complete', 'no_show'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

/**
 * Map action to target status.
 */
const ACTION_STATUS_MAP = {
  accept: 'ACCEPTED',
  reject: 'REJECTED',
  cancel: 'CANCELLED',
  start: 'IN_PROGRESS',
  complete: 'COMPLETED',
  no_show: 'NO_SHOW',
};

/**
 * Validate booking state transition.
 * @throws AppError if the transition is not allowed.
 */
function validateTransition(currentStatus, action) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(action)) {
    throw new AppError(
      `Cannot ${action} a booking with status ${currentStatus}`,
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }
}

// =============================================================================
// Booking CRUD
// =============================================================================

/**
 * Create a new booking (REQUESTED status).
 * Atomic transaction: reserves slot + creates booking.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createBooking(data) {
  const { customerId, technicianId, serviceId, variantId, addressId, slotId, notes } = data;

  // Fast-fail: prevent self-booking
  if (customerId === technicianId) {
    throw new AppError('Cannot book yourself', 400, ErrorCodes.INVALID_INPUT);
  }

  // Validate technician exists and is active
  const technician = await prisma.technician.findFirst({
    where: { userId: technicianId, kycStatus: 'VERIFIED' },
  });
  if (!technician) {
    throw new AppError('Technician not found or not verified', 404, ErrorCodes.NOT_FOUND);
  }

  // Validate service
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    throw new AppError('Service not available', 404, ErrorCodes.NOT_FOUND);
  }

  // Validate address belongs to customer
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: customerId },
  });
  if (!address) {
    throw new AppError('Address not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Calculate pricing
  let totalAmount = Number(service.basePrice);
  let platformFee = Number(env.PLATFORM_FEE_SAR || 11);

  if (variantId) {
    const variant = await prisma.serviceVariant.findUnique({ where: { id: variantId } });
    if (variant) {
      totalAmount += Number(variant.priceDelta);
    }
  }

  // Check if technician has custom price
  const techService = await prisma.technicianService.findUnique({
    where: { technicianId_serviceId: { technicianId: technician.id, serviceId } },
  });
  if (techService?.customPrice) {
    totalAmount = Number(techService.customPrice);
  }

  // Wallet usage cap: max 10% of service price
  let walletAmountUsed = 0;
  if (data.useWallet && data.walletAmount > 0) {
    const maxWalletUsage = Math.round((totalAmount * (env.WALLET_USAGE_MAX_PERCENT || 10)) / 100 * 100) / 100;
    walletAmountUsed = Math.min(Number(data.walletAmount), maxWalletUsage);

    // Validate customer has sufficient wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    if (!wallet || Number(wallet.balance) < walletAmountUsed) {
      throw new AppError(
        `Insufficient wallet balance. Available: ${wallet ? Number(wallet.balance) : 0} SAR, Requested: ${walletAmountUsed} SAR`,
        400,
        ErrorCodes.INSUFFICIENT_FUNDS,
      );
    }
  }

  // Generate booking code before transaction (async function)
  const bookingCode = await generateBookingCode();

  // Atomic transaction with optimistic locking to prevent race conditions
  const booking = await prisma.$transaction(async (tx) => {
    // Atomically claim the slot — UPDATE with WHERE guards against races.
    // If two concurrent bookings target the same slot, only one UPDATE
    // will match (isBooked: false), the other returns count: 0.
    const slotResult = await tx.availabilitySlot.updateMany({
      where: {
        id: slotId,
        technicianId: technician.id,
        isBooked: false,
        isAvailable: true,
      },
      data: { isBooked: true },
    });

    if (slotResult.count === 0) {
      throw new AppError('Slot not available or already booked', 409, ErrorCodes.SLOT_NOT_AVAILABLE);
    }

    // Read the slot to get startAt/endAt for the booking
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: slotId },
      select: { startAt: true, endAt: true },
    });

    // Deduct wallet amount if used
    if (walletAmountUsed > 0) {
      const wallet = await tx.wallet.findUnique({ where: { userId: customerId } });
      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: walletAmountUsed } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            source: 'CASHBACK', // or a new 'BOOKING_PAYMENT' source
            amount: walletAmountUsed,
            description: `Wallet used for booking — ${walletAmountUsed} SAR (max 10% of ${totalAmount} SAR)`,
            referenceId: `booking:wallet:${bookingCode}`,
          },
        });
      }
    }

    // Create booking
    const booking_ = await tx.booking.create({
      data: {
        bookingCode,
        customerId,
        technicianId,
        serviceId,
        variantId,
        addressId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: 'REQUESTED',
        totalAmount: totalAmount - walletAmountUsed, // Subtract wallet contribution
        platformFee,
        notes,
        providerRevealed: false,
      },
    });

    // Link slot to booking — MUST be inside transaction for atomicity.
    // If the server crashes after commit, the slot is linked. If we crash
    // before commit, everything rolls back. No orphaned slots.
    await tx.availabilitySlot.update({
      where: { id: slotId },
      data: { bookingId: booking_.id },
    });

    return booking_;
  });

  // Emit real-time event to technician
  emitToTechnician(technicianId, 'new_booking_request', {
    booking: {
      id: booking.id,
      bookingCode: booking.bookingCode,
      serviceName: service.titleJson,
      startAt: booking.startAt,
      totalAmount: Number(booking.totalAmount),
    },
  });

  // Schedule auto-reject job (30 minutes)
  const timeoutMin = parseInt(env.BOOKING_REQUEST_TIMEOUT_MIN || 30);
  await bookingTimeoutQueue.add(
    'auto-reject',
    { bookingId: booking.id },
    { delay: timeoutMin * 60 * 1000 },
  );

  logger.info('Booking created', { bookingId: booking.id, code: booking.bookingCode });

  // Send notifications (fire-and-forget — non-blocking)
  events.emit('booking:created', { booking });

  return booking;
}

/**
 * Transition booking status (accept/reject/cancel/complete).
 *
 * @param {number} bookingId
 * @param {'accept'|'reject'|'cancel'|'complete'|'no_show'} action
 * @param {number} actorUserId - Who is performing the action
 * @param {string} [reason]
 */
export async function transitionBooking(bookingId, action, actorUserId, reason) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { titleJson: true } },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  validateTransition(booking.status, action);

  // Authorization checks
  if (action === 'accept' || action === 'reject') {
    if (booking.technicianId !== actorUserId) {
      throw new AppError('Only the technician can accept or reject', 403, ErrorCodes.FORBIDDEN);
    }
  }

  if (action === 'cancel' && booking.customerId !== actorUserId) {
    // Admin can also cancel
    const actor = await prisma.user.findUnique({ where: { id: actorUserId } });
    if (actor?.role !== 'ADMIN') {
      throw new AppError('Only the customer or admin can cancel', 403, ErrorCodes.FORBIDDEN);
    }
  }

  if (action === 'complete' || action === 'no_show') {
    if (booking.technicianId !== actorUserId) {
      throw new AppError('Only the technician can mark as complete', 403, ErrorCodes.FORBIDDEN);
    }
  }

  const newStatus = ACTION_STATUS_MAP[action];

  const updateData = {
    status: newStatus,
    ...(action === 'accept' && { providerRevealed: true }),
    ...(action === 'cancel' && { cancelledAt: new Date(), cancelReason: reason }),
  };

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  });

  // Free the slot on rejection or cancellation
  if (action === 'reject' || action === 'cancel') {
    await prisma.availabilitySlot.updateMany({
      where: { bookingId },
      data: { isBooked: false, bookingId: null },
    });

    // Late cancellation fee: if cancelled within 2 hours of start time, charge 20% (max 50 SAR)
    if (action === 'cancel') {
      const now = new Date();
      const startTime = new Date(booking.startAt);
      const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

      if (hoursUntilStart < 2 && hoursUntilStart >= 0 && booking.status !== 'REQUESTED') {
        const servicePrice = Number(booking.totalAmount);
        const lateCancelFee = Math.min(Math.round(servicePrice * 0.2 * 100) / 100, 50);

        if (lateCancelFee > 0) {
          try {
            const wallet = await prisma.wallet.findUnique({ where: { userId: booking.customerId } });
            if (wallet && Number(wallet.balance) >= lateCancelFee) {
              await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: lateCancelFee } },
              });

              await prisma.walletTransaction.create({
                data: {
                  walletId: wallet.id,
                  type: 'DEBIT',
                  source: 'HANDLING_FEE_DEDUCTION',
                  amount: lateCancelFee,
                  description: `Late cancellation fee (${Math.round(hoursUntilStart * 10) / 10}h before start) for booking #${booking.bookingCode}`,
                  referenceId: `cancellation:${booking.id}`,
                },
              });

              logger.info('Late cancellation fee charged', {
                bookingId,
                customerId: booking.customerId,
                fee: lateCancelFee,
                hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
              });
            }
          } catch (err) {
            logger.error('Late cancellation fee failed', { bookingId, error: err.message });
          }
        }
      }
    }
  }

  // Remove auto-reject timeout job when technician handles the booking
  if (action === 'accept' || action === 'reject') {
    const jobs = await bookingTimeoutQueue.getJobs(['delayed']);
    for (const job of jobs) {
      if (job.data?.bookingId === bookingId) {
        await job.remove();
      }
    }
  }

  // Emit real-time events
  if (action === 'accept') {
    emitToUser(booking.customerId, 'booking_accepted', {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      message: 'تم قبول حجزك! يمكنك الآن اختيار طريقة الدفع.',
    });
  } else if (action === 'reject') {
    emitToUser(booking.customerId, 'booking_rejected', {
      bookingId: booking.id,
      reason,
    });
  } else if (action === 'cancel') {
    if (actorUserId === booking.customerId) {
      emitToTechnician(booking.technicianId, 'booking_cancelled', {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
      });
    } else {
      emitToUser(booking.customerId, 'booking_cancelled', {
        bookingId: booking.id,
        reason,
      });
    }
  }

  logger.info('Booking transition', { bookingId, from: booking.status, to: newStatus, action });

  // Send lifecycle notifications via EventBus (fire-and-forget)
  if (action === 'accept') {
    events.emit('booking:accepted', { booking: updated });
  } else if (action === 'complete') {
    events.emit('booking:review-request', { booking: updated });

    // Update beauty streak for the customer
    updateStreak(booking.customerId).catch((err) =>
      logger.error('Streak update failed', { error: err.message }),
    );

    // Process referral reward (first completed booking triggers bonus)
    processReferralReward(booking.customerId).catch((err) =>
      logger.error('Referral reward processing failed', { error: err.message }),
    );
  }

  return updated;
}

/**
 * Auto-reject expired bookings (called by BullMQ job).
 * @param {number} bookingId
 */
export async function autoRejectBooking(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== 'REQUESTED') return null;

  return transitionBooking(bookingId, 'reject', booking.technicianId, 'انتهت مدة الاستجابة التلقائية');
}

/**
 * Reschedule a booking to a new slot.
 * @param {number} bookingId
 * @param {number} newSlotId
 * @param {number} customerId
 */
export async function rescheduleBooking(bookingId, newSlotId, customerId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  const allowedStatuses = ['REQUESTED', 'ACCEPTED'];
  if (!allowedStatuses.includes(booking.status)) {
    throw new AppError(
      `Cannot reschedule a ${booking.status} booking`,
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  // Atomic: free old slot + book new slot
  const updated = await prisma.$transaction(async (tx) => {
    // Free old slot
    await tx.availabilitySlot.updateMany({
      where: { bookingId },
      data: { isBooked: false, bookingId: null },
    });

    // Book new slot
    const newSlot = await tx.availabilitySlot.findFirst({
      where: { id: newSlotId, technicianId: booking.technicianId, isBooked: false, isAvailable: true },
    });

    if (!newSlot) {
      throw new AppError('New slot not available', 409, ErrorCodes.SLOT_NOT_AVAILABLE);
    }

    await tx.availabilitySlot.update({
      where: { id: newSlotId },
      data: { isBooked: true, bookingId },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: { startAt: newSlot.startAt, endAt: newSlot.endAt },
    });
  });

  logger.info('Booking rescheduled', { bookingId, newSlotId });

  return updated;
}

/**
 * Get bookings for a user (customer or technician).
 * @param {number} userId
 * @param {string} role - 'customer' or 'technician'
 * @param {object} filters
 */
export async function getUserBookings(userId, role, filters = {}) {
  const { status, page = 1, limit = 20, startDate, endDate } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (role === 'customer') {
    where.customerId = userId;
  } else if (role === 'technician') {
    where.technicianId = userId;
  }

  if (status) {
    where.status = { in: status.split(',') };
  }

  if (startDate || endDate) {
    where.startAt = {};
    if (startDate) where.startAt.gte = new Date(startDate);
    if (endDate) where.startAt.lte = new Date(endDate);
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { id: true, titleJson: true, basePrice: true, durationMin: true } },
        ...(role === 'customer' && {
          technician: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              technician: { select: { ratingAvg: true } },
            },
          },
        }),
        ...(role === 'technician' && {
          customer: { select: { id: true, name: true, avatarUrl: true } },
        }),
        address: { select: { label: true, city: true, area: true, street: true } },
        review: { select: { rating: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get single booking by ID.
 * @param {number} bookingId
 * @param {number} userId - Requesting user
 */
export async function getBookingById(bookingId, userId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { id: true, titleJson: true, descriptionJson: true, basePrice: true, durationMin: true, categoryId: true } },
      customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      ...(true && {
        technician: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            technician: { select: { ratingAvg: true, totalReviews: true } },
          },
        },
      }),
      address: true,
      slot: { select: { startAt: true, endAt: true } },
      payment: { select: { status: true, gatewayRef: true } },
      review: true,
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  // Hide technician info until accepted
  if (!booking.providerRevealed && booking.customerId !== userId && booking.technicianId !== userId) {
    booking.technician = null;
  }

  return booking;
}

export default {
  // Slots
  createSlot,
  bulkCreateSlots,
  getSlots,
  deleteSlot,
  // Booking
  createBooking,
  transitionBooking,
  autoRejectBooking,
  rescheduleBooking,
  getUserBookings,
  getBookingById,
};

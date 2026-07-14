import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import { emitToAdmin } from '../socket/index.js';

/**
 * Raise a dispute for a booking.
 */
export async function createDispute(bookingId, raisedBy, reason, description, evidenceUrl) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);

  if (!['PAID', 'COMPLETED', 'IN_PROGRESS'].includes(booking.status)) {
    throw new AppError('Can only dispute active or completed bookings', 400, ErrorCodes.BOOKING_INVALID_STATE);
  }

  const existing = await prisma.dispute.findUnique({ where: { bookingId } });
  if (existing) throw new AppError('A dispute already exists for this booking', 409, ErrorCodes.ALREADY_EXISTS);

  const dispute = await prisma.dispute.create({
    data: { bookingId, raisedBy, reason, description, evidenceUrl },
  });

  logger.info('Dispute raised', { disputeId: dispute.id, bookingId, raisedBy });

  // Real-time alert for admin
  try {

    emitToAdmin('new_dispute', {
      disputeId: dispute.id,
      bookingId,
      reason: reason.substring(0, 100),
      message: 'New dispute requires review',
    });
  } catch { /* non-critical */ }

  return dispute;
}

/**
 * Resolve a dispute (admin).
 */
export async function resolveDispute(disputeId, adminId, resolution, status) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new AppError('Dispute not found', 404, ErrorCodes.NOT_FOUND);

  const validStatuses = ['RESOLVED_CUSTOMER', 'RESOLVED_TECHNICIAN', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid resolution status: ${status}`, 400, ErrorCodes.INVALID_INPUT);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.update({
      where: { id: disputeId },
      data: { status, resolution, resolvedBy: adminId, resolvedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        adminId,
        action: 'RESOLVE_DISPUTE',
        targetType: 'Dispute',
        targetId: String(disputeId),
        newValue: { status, resolution },
      },
    });

    return d;
  });

  logger.info('Dispute resolved', { disputeId, status, byAdmin: adminId });
  return updated;
}

/**
 * List disputes (admin).
 */
export async function listDisputes({ status, page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { bookingCode: true, totalAmount: true } },
        raiser: { select: { id: true, name: true, role: true } },
        resolver: { select: { name: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ]);

  return { disputes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export default { createDispute, resolveDispute, listDisputes };

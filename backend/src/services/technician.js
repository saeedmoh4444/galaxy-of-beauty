import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { invalidateCache } from '../config/redis.js';
import logger from '../config/logger.js';
import { emitToAdmin } from '../socket/index.js';

/**
 * Get technician public profile by user ID (not technician ID).
 * Includes reviews, services offered.
 *
 * @param {number} userId - The User ID of the technician
 * @returns {Promise<object>}
 */
export async function getTechnicianProfile(userId) {
  const technician = await prisma.technician.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      technicianServices: {
        where: { isActive: true },
        include: {
          service: {
            select: {
              id: true,
              titleJson: true,
              basePrice: true,
              durationMin: true,
              categoryId: true,
            },
          },
        },
      },
    },
  });

  if (!technician) {
    throw new AppError('Technician profile not found', 404, ErrorCodes.NOT_FOUND);
  }

  return technician;
}

/**
 * Update technician profile.
 *
 * @param {number} userId - The User ID of the technician
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateTechnicianProfile(userId, data) {
  const technician = await prisma.technician.findUnique({ where: { userId } });
  if (!technician) {
    throw new AppError('Technician profile not found', 404, ErrorCodes.NOT_FOUND);
  }

  const updated = await prisma.technician.update({
    where: { userId },
    data: {
      ...(data.city && { city: data.city }),
      ...(data.area !== undefined && { area: data.area }),
      ...(data.bioJson && { bioJson: data.bioJson }),
      ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
    },
  });

  // Invalidate cache
  await invalidateCache(`technician:${userId}:*`);

  logger.info('Technician profile updated', { userId });

  return updated;
}

/**
 * Upload KYC documents for a technician.
 *
 * @param {number} userId - The technician's user ID
 * @param {Array<{ type: string, url: string }>} documents
 * @returns {Promise<object>}
 */
export async function uploadKYCDocuments(userId, documents) {
  const technician = await prisma.technician.findUnique({ where: { userId } });
  if (!technician) {
    throw new AppError('Technician profile not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (technician.kycStatus === 'VERIFIED') {
    throw new AppError('KYC is already verified', 400, ErrorCodes.ALREADY_EXISTS);
  }

  const updated = await prisma.technician.update({
    where: { userId },
    data: {
      kycDocuments: documents,
      kycStatus: 'SUBMITTED',
    },
  });

  logger.info('KYC documents uploaded', { userId, documentCount: documents.length });

  // Audit log
  await prisma.auditLog.create({
    data: { adminId: userId, action: 'UPLOAD_KYC', targetType: 'Technician', targetId: String(technician.id), newValue: { documentCount: documents.length } },
  });

  // Real-time alert for admin
  try {

    emitToAdmin('kyc_submitted', {
      technicianId: technician.id,
      userId,
      message: 'New KYC submission requires review',
    });
  } catch { /* non-critical */ }

  return updated;
}

/**
 * Admin: verify or reject a technician's KYC.
 *
 * @param {number} technicianUserId - The technician's User ID
 * @param {'VERIFIED'|'REJECTED'} status
 * @param {string} notes
 * @param {number} adminId
 * @returns {Promise<object>}
 */
export async function verifyTechnicianKYC(technicianUserId, status, notes, adminId) {
  const technician = await prisma.technician.findUnique({ where: { userId: technicianUserId } });
  if (!technician) {
    throw new AppError('Technician not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (technician.kycStatus !== 'SUBMITTED') {
    throw new AppError(
      'Technician has not submitted KYC documents yet',
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  const updated = await prisma.technician.update({
    where: { userId: technicianUserId },
    data: {
      kycStatus: status,
      kycNotes: notes,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      adminId,
      action: status === 'VERIFIED' ? 'VERIFY_KYC' : 'REJECT_KYC',
      targetType: 'Technician',
      targetId: String(technician.id),
      newValue: { kycStatus: status },
    },
  });

  logger.info('KYC verification completed', { technicianUserId, status, byAdmin: adminId });

  return updated;
}

/**
 * Admin: suspend or reinstate a user.
 *
 * @param {number} userId
 * @param {string} reason
 * @param {boolean} suspend - true to suspend, false to reinstate
 * @param {number} adminId
 * @returns {Promise<object>}
 */
export async function toggleUserSuspension(userId, reason, suspend, adminId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (user.role === 'ADMIN') {
    throw new AppError('Cannot suspend admin users', 403, ErrorCodes.FORBIDDEN);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !suspend,
      suspendedAt: suspend ? new Date() : null,
      suspendReason: suspend ? reason : null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId,
      action: suspend ? 'SUSPEND_USER' : 'REINSTATE_USER',
      targetType: 'User',
      targetId: String(userId),
      oldValue: { isActive: user.isActive },
      newValue: { isActive: !suspend, reason },
    },
  });

  logger.info(suspend ? 'User suspended' : 'User reinstated', { userId, byAdmin: adminId });

  const { passwordHash: _, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

export default {
  getTechnicianProfile,
  updateTechnicianProfile,
  uploadKYCDocuments,
  verifyTechnicianKYC,
  toggleUserSuspension,
};

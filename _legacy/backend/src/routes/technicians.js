import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { updateTechnicianSchema } from '../validators/auth.js';
import * as technicianService from '../services/technician.js';

const router = Router();

/**
 * @route   GET /api/technicians/:userId
 * @desc    Get technician public profile
 * @access  Public
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const profile = await technicianService.getTechnicianProfile(userId);
    res.json({ technician: profile });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/technicians/:userId
 * @desc    Update technician profile (owner or admin only)
 * @access  Authenticated (Technician or Admin)
 */
router.put(
  '/:userId',
  isAuth,
  validate({ body: updateTechnicianSchema }),
  async (req, res, next) => {
    try {
      const targetUserId = parseInt(req.params.userId, 10);

      // Only the owner or admin can update
      if (req.user.userId !== targetUserId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only update your own profile' },
        });
      }

      const updated = await technicianService.updateTechnicianProfile(
        targetUserId,
        req.body,
      );
      res.json({ technician: updated });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/technicians/:userId/kyc
 * @desc    Upload KYC documents (owner only)
 * @access  Authenticated (Technician)
 */
router.post(
  '/:userId/kyc',
  isAuth,
  hasRole('TECHNICIAN'),
  upload.array('documents', 5),
  async (req, res, next) => {
    try {
      const targetUserId = parseInt(req.params.userId, 10);

      if (req.user.userId !== targetUserId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only upload KYC for your own profile' },
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'At least one document is required' },
        });
      }

      // In production, files would be uploaded to S3 here.
      // For MVP, store URLs based on the file info.
      const documents = req.files.map((file) => ({
        type: file.fieldname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/kyc/${file.filename || file.originalname}`,
        uploadedAt: new Date().toISOString(),
      }));

      const result = await technicianService.uploadKYCDocuments(targetUserId, documents);
      res.json({ kycStatus: result.kycStatus, documents: result.kycDocuments });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/technicians/:userId/busy-toggle
 * @desc    Toggle busy mode — mark all future available slots as unavailable
 * @access  Technician (owner only)
 */
router.post('/:userId/busy-toggle', isAuth, hasRole('TECHNICIAN'), async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);
    if (req.user.userId !== targetUserId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only manage your own availability' } });
    }

    const { busy = true } = req.body;
    const now = new Date();

    const result = await prisma.availabilitySlot.updateMany({
      where: {
        technicianId: targetUserId,
        isBooked: false,
        isAvailable: !busy, // If setting busy: only update available slots; if clearing: only update unavailable ones
        startAt: { gte: now },
      },
      data: { isAvailable: !busy },
    });

    res.json({
      busyMode: busy,
      slotsUpdated: result.count,
      message: busy
        ? `تم تعطيل ${result.count} موعد. لن تصلك طلبات حجز جديدة.`
        : `تم تفعيل ${result.count} موعد. يمكنك استقبال طلبات الحجز مجدداً.`,
    });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/technicians/:userId/busy-status
 * @desc    Check if technician has available slots
 * @access  Public
 */
router.get('/:userId/busy-status', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const now = new Date();

    const [availableCount, totalFutureSlots] = await Promise.all([
      prisma.availabilitySlot.count({
        where: { technicianId: userId, isBooked: false, isAvailable: true, startAt: { gte: now } },
      }),
      prisma.availabilitySlot.count({
        where: { technicianId: userId, startAt: { gte: now } },
      }),
    ]);

    res.json({
      isAvailable: availableCount > 0,
      availableSlots: availableCount,
      totalFutureSlots,
      isFullyBooked: totalFutureSlots > 0 && availableCount === 0,
    });
  } catch (error) { next(error); }
});

export default router;

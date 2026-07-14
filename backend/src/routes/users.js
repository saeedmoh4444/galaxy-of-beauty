import { Router } from 'express';
import { isAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/auth.js';
import * as authService from '../services/auth.js';
import prisma from '../config/database.js';

const router = Router();

/**
 * @route   GET /api/me
 * @desc    Get current user profile (with wallet, technician info if applicable)
 * @access  Authenticated
 */
router.get('/me', isAuth, async (req, res, next) => {
  try {
    const profile = await authService.getUserProfile(req.user.userId);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/me
 * @desc    Update current user profile
 * @access  Authenticated
 */
router.put(
  '/me',
  isAuth,
  validate({ body: updateProfileSchema }),
  async (req, res, next) => {
    try {
      const updated = await authService.updateUserProfile(req.user.userId, req.body);
      res.json({ user: updated });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/me/export
 * @desc    Export all user data (GDPR/PDPL right to access)
 * @access  Authenticated
 */
router.get('/me/export', isAuth, async (req, res, next) => {
  try {

    const userId = req.user.userId;

    const [user, bookings, transactions, reviews, notifications, terms, wallet] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phone: true, name: true, role: true, createdAt: true, updatedAt: true } }),
      prisma.booking.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' } }),
      prisma.walletTransaction.findMany({ where: { wallet: { userId } }, orderBy: { createdAt: 'desc' } }),
      prisma.review.findMany({ where: { customerId: userId } }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.termsAcceptance.findMany({ where: { userId } }),
      prisma.wallet.findUnique({ where: { userId }, include: { transactions: { take: 50, orderBy: { createdAt: 'desc' } } } }),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      user,
      wallet: wallet ? { balance: Number(wallet.balance), bonusBalance: Number(wallet.bonusBalance) } : null,
      bookings: bookings.map((b) => ({ bookingCode: b.bookingCode, status: b.status, totalAmount: Number(b.totalAmount), startAt: b.startAt, createdAt: b.createdAt })),
      transactions: transactions.map((t) => ({ type: t.type, source: t.source, amount: Number(t.amount), description: t.description, createdAt: t.createdAt })),
      reviews: reviews.map((r) => ({ rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
      notifications: notifications.map((n) => ({ type: n.type, title: n.titleJson, body: n.bodyJson, isRead: n.isRead, createdAt: n.createdAt })),
      termsAcceptances: terms.map((t) => ({ version: t.termsVersion, acceptedAt: t.acceptedAt })),
    });
  } catch (error) { next(error); }
});

/**
 * @route   DELETE /api/me
 * @desc    Delete account (GDPR/PDPL right to deletion)
 * @access  Authenticated
 */
router.delete('/me', isAuth, async (req, res, next) => {
  try {

    const userId = req.user.userId;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@anonymized.sa`,
          phone: `deleted-${userId}`,
          name: 'حساب محذوف',
          passwordHash: 'DELETED',
          isActive: false,
          avatarUrl: null,
          suspendedAt: new Date(),
          suspendReason: 'User requested account deletion (PDPL)',
        },
      });
      await tx.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.technician.updateMany({ where: { userId }, data: { kycDocuments: null, googleCalendarToken: null, googleCalendarEmail: null } });
      await tx.address.deleteMany({ where: { userId } });
      await tx.wishlistItem.deleteMany({ where: { userId } });
      await tx.chatMessage.deleteMany({ where: { senderId: userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.auditLog.create({ data: { adminId: userId, action: 'DELETE_ACCOUNT', targetType: 'User', targetId: String(userId), newValue: { reason: 'PDPL right to deletion' } } });
    });

    res.json({ message: 'Account deleted per PDPL requirements.', messageAr: 'تم حذف الحساب وإخفاء البيانات الشخصية وفقاً لنظام حماية البيانات الشخصية.' });
  } catch (error) { next(error); }
});

export default router;

import { Router } from 'express';
import { isAuth, hasRole, invalidateAuthCache } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { verifyKYCSchema, suspendUserSchema } from '../validators/auth.js';
import * as technicianService from '../services/technician.js';
import prisma from '../config/database.js';
import { runIntegrityCheck } from '../services/integrityCheck.js';
import { getPoolStats, getSlowQueries } from '../utils/dbPoolMonitor.js';

const router = Router();

// All admin routes require ADMIN role
router.use(isAuth, hasRole('ADMIN'));

/**
 * @route   POST /api/admin/users/:id/verify-kyc
 * @desc    Verify or reject a technician's KYC
 * @access  Admin
 */
router.post(
  '/users/:id/verify-kyc',
  validate({ body: verifyKYCSchema }),
  async (req, res, next) => {
    try {
      const technicianUserId = parseInt(req.params.id, 10);
      const result = await technicianService.verifyTechnicianKYC(
        technicianUserId,
        req.body.status,
        req.body.notes || null,
        req.user.userId,
      );
      res.json({
        kycStatus: result.kycStatus,
        kycNotes: result.kycNotes,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   PATCH /api/admin/users/:id/suspend
 * @desc    Suspend or reinstate a user
 * @access  Admin
 */
router.patch(
  '/users/:id/suspend',
  validate({ body: suspendUserSchema }),
  async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const { suspend = true } = req.query;
      const shouldSuspend = suspend !== 'false';

      const result = await technicianService.toggleUserSuspension(
        userId,
        req.body.reason,
        shouldSuspend,
        req.user.userId,
      );
      res.json({ user: result });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/admin/technicians
 * @desc    List all technicians with filters
 * @access  Admin
 */
router.get('/technicians', async (req, res, next) => {
  try {
    const { kycStatus, city, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (city) where.city = city;

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.technician.count({ where }),
    ]);

    res.json({
      technicians,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/customers
 * @desc    List all customers with filters
 * @access  Admin
 */
router.get('/customers', async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { role: 'CUSTOMER' };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          wallet: { select: { balance: true, bonusBalance: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change a user's role
 * @access  Admin
 */
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role || !['CUSTOMER', 'TECHNICIAN', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Valid role is required (CUSTOMER, TECHNICIAN, ADMIN)' },
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit the role change
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'CHANGE_ROLE',
        targetType: 'User',
        targetId: String(userId),
        newValue: { role },
      },
    });

    // Invalidate auth cache

    await invalidateAuthCache(userId);

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    List all bookings (admin view, all users)
 * @access  Admin
 */
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, technicianId, customerId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (technicianId) where.technicianId = parseInt(technicianId);
    if (customerId) where.customerId = parseInt(customerId);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          technician: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, titleJson: true } },
          payment: { select: { id: true, status: true, amount: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/financials
 * @desc    Platform financials overview
 * @access  Admin
 */
router.get('/financials', async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      platformFees,
      pendingPayouts,
      totalPayouts,
      walletBalances,
      subscriptionRevenue,
    ] = await Promise.all([
      // Total captured payments (all time)
      prisma.payment.aggregate({
        where: { status: 'CAPTURED' },
        _sum: { amount: true, commission: true },
      }),
      // Platform fees in last 30 days
      prisma.payment.aggregate({
        where: { status: 'CAPTURED', updatedAt: { gte: thirtyDaysAgo } },
        _sum: { commission: true },
      }),
      // Pending payouts
      prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      // Total completed payouts
      prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Total customer wallet balances
      prisma.wallet.aggregate({
        _sum: { balance: true, bonusBalance: true },
      }),
      // Subscription plan revenue (estimated from active subscriptions)
      prisma.customerAiSubscription.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    res.json({
      revenue: {
        totalAllTime: Number(totalRevenue._sum.amount || 0),
        totalCommissions: Number(totalRevenue._sum.commission || 0),
        platformFeesLast30Days: Number(platformFees._sum.commission || 0),
        estimatedSubscriptionMonthly: subscriptionRevenue * 29.99, // rough estimate
      },
      payouts: {
        pending: {
          count: pendingPayouts._count,
          total: Number(pendingPayouts._sum.amount || 0),
        },
        completed: {
          total: Number(totalPayouts._sum.amount || 0),
        },
      },
      wallets: {
        totalCustomerBalance: Number(walletBalances._sum.balance || 0),
        totalBonusBalance: Number(walletBalances._sum.bonusBalance || 0),
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/admin/technicians/:userId/eco-friendly
 * @desc    Toggle eco-friendly badge for a technician
 * @access  Admin
 */
router.patch('/technicians/:userId/eco-friendly', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { isEcoFriendly } = req.body;

    const updated = await prisma.technician.update({
      where: { userId },
      data: { isEcoFriendly: isEcoFriendly === true },
      select: { userId: true, isEcoFriendly: true },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'TOGGLE_ECO_FRIENDLY',
        targetType: 'Technician',
        targetId: String(userId),
        newValue: { isEcoFriendly: updated.isEcoFriendly },
      },
    });

    res.json({ technician: updated, message: updated.isEcoFriendly ? '🌿 Eco-friendly badge awarded' : 'Eco-friendly badge removed' });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/integrity-check
 * @desc    Run system integrity check (data consistency, orphaned records, etc.)
 * @access  Admin
 */
router.get('/integrity-check', async (_req, res, next) => {
  try {


    const result = await runIntegrityCheck();
    res.status(result.healthy ? 200 : 503).json(result);
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/admin/db-pool
 * @desc    Database connection pool statistics
 * @access  Admin
 */
router.get('/db-pool', async (_req, res, next) => {
  try {


    const [poolStats, slowQueries] = await Promise.all([
      getPoolStats(),
      getSlowQueries(3),
    ]);
    res.json({ pool: poolStats, slowQueries });
  } catch (error) { next(error); }
});

export default router;

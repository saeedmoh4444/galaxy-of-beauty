import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as walletService from '../services/wallet.js';
import prisma from '../config/database.js';
import { payoutQueue } from '../jobs/queue.js';

const router = Router();

/**
 * @route   POST /api/admin/payouts/calculate
 * @desc    Calculate payout for a technician for a period (admin)
 * @access  Admin
 */
router.post(
  '/admin/payouts/calculate',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const { technicianId, periodStart, periodEnd } = req.body;
      if (!technicianId || !periodStart || !periodEnd) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'technicianId, periodStart, and periodEnd are required' },
        });
      }

      const payout = await walletService.calculateTechnicianPayout(
        parseInt(technicianId),
        periodStart,
        periodEnd,
      );

      res.status(201).json({ payout });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/admin/payouts/process
 * @desc    Process all pending payouts (admin trigger)
 * @access  Admin
 */
router.post(
  '/admin/payouts/process',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const results = await walletService.processPendingPayouts();
      res.json({ processed: results.length, results });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/admin/payouts
 * @desc    List all payouts with filters (admin)
 * @access  Admin
 */
router.get(
  '/admin/payouts',
  isAuth,
  hasRole('ADMIN'),
  async (req, res, next) => {
    try {
      const { status, technicianId, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (status) where.status = status;
      if (technicianId) where.technicianId = parseInt(technicianId);

      const [payouts, total] = await Promise.all([
        prisma.payout.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            technician: {
              select: { name: true, email: true },
            },
          },
        }),
        prisma.payout.count({ where }),
      ]);

      res.json({
        payouts,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/technician/payouts
 * @desc    Get payouts for the current technician
 * @access  Technician
 */
router.get(
  '/payouts',
  isAuth,
  hasRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const payouts = await prisma.payout.findMany({
        where: { technicianId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const totalEarnings = payouts
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      res.json({ payouts, totalEarnings: Math.round(totalEarnings * 100) / 100 });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

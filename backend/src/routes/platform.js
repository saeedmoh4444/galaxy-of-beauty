import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import * as platformService from '../services/platform.js';
import prisma from '../config/database.js';
import saudiCities from '../utils/saudiCities.js';
import env from '../config/env.js';

const router = Router();

// ---- Settings (Admin) ----
router.get('/admin/settings', isAuth, hasRole('ADMIN'), async (_req, res, next) => {
  try {
    const settings = await platformService.getSettings();
    res.json({ settings });
  } catch (error) { next(error); }
});

router.put('/admin/settings/:key', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'value is required' } });
    const setting = await platformService.updateSetting(req.params.key, value, req.user.userId);
    res.json({ setting });
  } catch (error) { next(error); }
});

// ---- Maintenance Mode ----
router.post('/admin/maintenance/toggle', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { enable } = req.body;
    const result = await platformService.toggleMaintenanceMode(enable, req.user.userId);
    res.json({ maintenanceMode: enable, setting: result });
  } catch (error) { next(error); }
});

// ---- CSV Export (Admin) ----
router.get('/admin/reports/bookings', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const { headers, rows, total } = await platformService.exportBookingsCSV({ startDate, endDate, status });

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-export-${Date.now()}.csv`);
    res.send('﻿' + csv); // BOM for Arabic in Excel
  } catch (error) { next(error); }
});

router.get('/admin/reports/users', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.query;
    const { headers, rows, total } = await platformService.exportUsersCSV({ role });

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=users-export-${Date.now()}.csv`);
    res.send('﻿' + csv);
  } catch (error) { next(error); }
});

// ---- Audit Logs (Admin) ----
router.get('/admin/audit-logs', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, adminId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (adminId) where.adminId = parseInt(adminId);
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { name: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
});

// ---- Terms ----
router.get('/terms/latest', async (_req, res) => {
  const version = env.TERMS_VERSION;
  res.json({ version, contentUrl: '/terms-and-conditions' });
});

router.post('/terms/accept', isAuth, async (req, res, next) => {
  try {
    const version = env.TERMS_VERSION;
    await prisma.termsAcceptance.create({
      data: {
        userId: req.user.userId,
        termsVersion: version,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });
    res.json({ accepted: true, version });
  } catch (error) { next(error); }
});

router.get('/admin/terms-acceptances', isAuth, hasRole('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [acceptances, total] = await Promise.all([
      prisma.termsAcceptance.findMany({
        skip, take: parseInt(limit),
        orderBy: { acceptedAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.termsAcceptance.count(),
    ]);

    res.json({ acceptances, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
});

/**
 * @route   GET /api/cities
 * @desc    Get Saudi cities list (for dropdowns, autocomplete)
 * @access  Public
 */
router.get('/cities', async (req, res) => {
  try {
    const { search, region } = req.query;

    if (search) {
      return res.json({ cities: saudiCities.searchCities(search) });
    }

    if (region) {
      return res.json({ cities: saudiCities.getCitiesByRegion(region) });
    }

    res.json({ regions: saudiCities.SAUDI_REGIONS });
  } catch (error) { /* noop */ }
});

/**
 * @route   GET /api/cities/:cityName/areas
 * @desc    Get areas/districts for a specific city
 * @access  Public
 */
router.get('/cities/:cityName/areas', async (req, res) => {
  try {
    const areas = saudiCities.getAreasByCity(req.params.cityName);
    res.json({ city: req.params.cityName, areas });
  } catch (error) { /* noop */ }
});

export default router;

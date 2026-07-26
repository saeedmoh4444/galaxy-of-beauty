import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import technicianRoutes from './technicians.js';
import technicianServiceRoutes from './technicianServices.js';
import addressRoutes from './addresses.js';
import adminRoutes from './admin.js';
import categoryRoutes from './categories.js';
import serviceRoutes from './services.js';
import slotRoutes from './slots.js';
import bookingRoutes from './bookings.js';
import paymentRoutes from './payments.js';
import walletRoutes from './wallet.js';
import payoutRoutes from './payouts.js';
import reviewRoutes from './reviews.js';
import notificationRoutes from './notifications.js';
import disputeRoutes from './disputes.js';
import analyticsRoutes from './analytics.js';
import zatcaRoutes from './zatca.js';
import aiRoutes from './ai.js';
import waitlistRoutes from './waitlist.js';
import wishlistRoutes from './wishlist.js';
import calendarRoutes from './calendar.js';
import subscriptionRoutes from './subscriptions.js';
import platformRoutes from './platform.js';
import streakRoutes from './streaks.js';
import referralRoutes from './referrals.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const { checkDatabaseConnection } = await import('../config/database.js');
  const { default: redis } = await import('../config/redis.js');
  const dbStatus = await checkDatabaseConnection();

  // Check Redis
  let redisStatus = 'disconnected';
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      redisStatus = 'connected';
    } else {
      await redis.ping();
      redisStatus = 'connected';
    }
  } catch {
    redisStatus = 'disconnected';
  }

  const allHealthy = dbStatus && redisStatus === 'connected';

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      redis: redisStatus,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/', (_req, res) => {
  res.json({ name: 'Galaxy of Beauty API', version: '1.0.0', documentation: '/api/docs', health: '/api/health' });
});

// OpenAPI spec (JSON)
router.get('/docs', (_req, res) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'Galaxy of Beauty API',
      version: '1.0.0',
      description: 'REST API for the Galaxy of Beauty platform. See openapi.yaml for the full specification.',
    },
    servers: [{ url: '/api' }],
    paths: {},
  });
});

// Sprint 1: Auth & Users
router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/technicians', technicianRoutes);
router.use('/technicians', technicianServiceRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);

// Sprint 2: Catalog
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);

// Sprint 3: Booking
router.use('/technicians', slotRoutes);
router.use('/bookings', bookingRoutes);

// Sprint 4: Payments & Wallet
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/', payoutRoutes);

// Sprint 5: Reviews, Notifications, Disputes, Analytics, ZATCA
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/disputes', disputeRoutes);
router.use('/', analyticsRoutes);
router.use('/zatca', zatcaRoutes);

// Sprint 6: AI, Waitlist, Wishlist
router.use('/ai', aiRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/wishlist', wishlistRoutes);

// Phase 1 Gaps: Calendar, Subscriptions, Platform, Terms, Reports
router.use('/calendar', calendarRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/', platformRoutes); // /api/admin/settings, /api/admin/reports/*, /api/terms/*

// Gamification & Growth
router.use('/streaks', streakRoutes);
router.use('/referrals', referralRoutes);

export default router;

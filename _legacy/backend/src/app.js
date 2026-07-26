import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import env from './config/env.js';
import logger from './config/logger.js';
import { checkDatabaseConnection, disconnectDatabase } from './config/database.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitize.js';
import routes from './routes/index.js';
import { initializeSocket } from './socket/index.js';
import { initializeQueues, closeQueues } from './jobs/queue.js';
import { initializeScheduler, initializeSchedulerWorker } from './jobs/scheduler.js';
import { maintenanceMiddleware } from './middleware/maintenance.js';
import { csrfUnless } from './middleware/csrf.js';
import { initializeSentry, sentryRequestHandler, sentryErrorHandler } from './config/sentry.js';
import { cacheHeadersMiddleware, etagMiddleware } from './middleware/cacheHeaders.js';
import {
  responseTimeMiddleware,
  timeoutMiddleware,
  apiVersionMiddleware,
  connectionMiddleware,
} from './middleware/performance.js';

/**
 * Create and configure Express application.
 */
const app = express();
const httpServer = http.createServer(app);

// ---- Trust proxy for rate limiting behind reverse proxy ----
app.set('trust proxy', 1);

// ---- Security Headers ----
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // 'unsafe-inline' for React in dev; tighten in prod
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.amazonaws.com"],
      connectSrc: ["'self'", "wss:", "https://sbcheckout.payfort.com", "https://checkout.payfort.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://sbcheckout.payfort.com", "https://checkout.payfort.com"],
      frameAncestors: ["'none'"], // Prevent clickjacking
      formAction: ["'self'", "https://sbcheckout.payfort.com", "https://checkout.payfort.com"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading external images
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ---- CORS ----
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Idempotency-Key', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
}));

// ---- Compression ----
app.use(compression({ threshold: 1024 })); // Compress responses > 1KB

// ---- Performance & Versioning ----
app.use(responseTimeMiddleware);
app.use(apiVersionMiddleware);
app.use(connectionMiddleware);

// ---- Request Timeout (30s default) ----
app.use(timeoutMiddleware(30000));

// ---- Body Parsing ----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ---- CSRF Protection ----
// Exempt webhooks and health check from CSRF validation
app.use(csrfUnless(['/api/payments/webhook', '/api/health', '/api/auth', '/api/wallet', '/api/bookings', '/api/payments/authorize', '/api/terms', '/api/admin', '/api/technicians']));

// ---- Input Sanitization (XSS prevention) ----
app.use(sanitizeInput);

// ---- Sentry Request Handler (must be first for breadcrumb context) ----
app.use(sentryRequestHandler());

// ---- Request ID ----
app.use(requestIdMiddleware);

// ---- Logging ----
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ---- Maintenance Mode ----
app.use(env.API_PREFIX, maintenanceMiddleware);

// ---- Cache & ETag Headers ----
app.use(env.API_PREFIX, cacheHeadersMiddleware);
app.use(env.API_PREFIX, etagMiddleware);

// ---- Rate Limiting ----
app.use(env.API_PREFIX, generalLimiter);

// ---- Static files (uploads) ----
app.use('/uploads', express.static('uploads'));

// ---- Root redirect ----
app.get('/', (_req, res) => res.redirect(env.API_PREFIX));

// ---- API Routes ----
app.use(env.API_PREFIX, routes);

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// ---- Error Handler (must be last) ----
app.use(errorHandler);

// ---- Sentry Error Handler (after custom handler, for unhandled 5xx) ----
app.use(sentryErrorHandler());

/**
 * Start the server.
 */
async function start() {
  try {
    // Initialize Sentry error tracking
    await initializeSentry();

    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      logger.error('Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize WebSocket
    initializeSocket(httpServer);

    // Initialize BullMQ queues
    await initializeQueues();

    // Initialize recurring scheduler (weekly payouts, reminders, etc.)
    initializeSchedulerWorker();
    await initializeScheduler();

    // Start listening
    httpServer.listen(env.PORT, env.HOST, () => {
      logger.info(`🚀 Galaxy of Beauty API running on http://${env.HOST}:${env.PORT}${env.API_PREFIX}`);
      logger.info(`📋 Health check: http://${env.HOST}:${env.PORT}${env.API_PREFIX}/health`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Graceful shutdown.
 * Closes HTTP server, database connections, Redis, and BullMQ queues.
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 second timeout

  try {
    // Stop accepting new requests
    httpServer.close(async () => {
      logger.info('HTTP server closed');
    });

    // Close queues
    await closeQueues();

    // Close database
    await disconnectDatabase();

    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

// Start the server
start();

export { app, httpServer };

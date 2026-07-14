import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

let redisAvailable = false;
let connection = null;

// Stub queue that no-ops when Redis is down
function createStubQueue(name) {
  return {
    name,
    add: async () => null,
    getJob: async () => null,
    close: async () => {},
    pause: async () => {},
    resume: async () => {},
    isStub: true,
  };
}

/**
 * Queues — start as stubs, upgraded to real BullMQ queues when Redis connects.
 * Services can always call emailQueue.add(...) without checking; it just no-ops
 * when Redis is unavailable.
 */
export let emailQueue = createStubQueue('email');
export let payoutQueue = createStubQueue('payout');
export let webhookQueue = createStubQueue('webhook');
export let notificationQueue = createStubQueue('notification');
export let bookingTimeoutQueue = createStubQueue('booking-timeout');

export { redisAvailable, connection };

function initRedisConnection() {
  if (connection) return connection;

  connection = new Redis(env.REDIS_URL, {
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis: giving up after 3 retries — background jobs disabled');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  connection.on('ready', () => {
    redisAvailable = true;
    logger.info('Redis connected — background jobs enabled');
  });

  connection.on('error', () => {
    redisAvailable = false;
  });

  connection.on('close', () => {
    redisAvailable = false;
  });

  return connection;
}

// =============================================================================
// Email Transport (lazy-initialized)
// =============================================================================

let emailTransporter = null;

function getEmailTransporter() {
  if (emailTransporter) return emailTransporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    emailTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS || '',
      },
    });
  } else {
    // Fallback: log emails instead of sending (development mode)
    logger.warn('SMTP not configured — emails will be logged, not sent');
    emailTransporter = {
      sendMail: async (mailOptions) => {
        logger.info('Email (simulated)', { to: mailOptions.to, subject: mailOptions.subject });
        return { messageId: `simulated-${Date.now()}` };
      },
    };
  }

  return emailTransporter;
}

// =============================================================================
// Worker Implementations
// =============================================================================

/**
 * Initialize all queue workers.
 * Called after the server starts. Attempts Redis connection; if it succeeds,
 * replaces stub queues with real BullMQ queues and starts workers.
 */
export async function initializeQueues() {
  initRedisConnection();

  // Try connecting to Redis — if it fails, stay on stubs
  try {
    await connection.connect();
    redisAvailable = true;
    logger.info('Redis connected — initializing BullMQ workers');
  } catch (_err) {
    redisAvailable = false;
    logger.warn('Redis unavailable — background jobs disabled (API still works)');
    return;
  }

  // Replace stubs with real BullMQ queues
  emailQueue = new Queue('email', { connection });
  payoutQueue = new Queue('payout', { connection });
  webhookQueue = new Queue('webhook', { connection });
  notificationQueue = new Queue('notification', { connection });
  bookingTimeoutQueue = new Queue('booking-timeout', { connection });

  // ---- Email Worker ----
  new Worker('email', async (job) => {
    const { to, subject, template, data } = job.data;
    logger.info('Processing email job', { jobId: job.id, to, template });

    try {
      const transporter = getEmailTransporter();

      const { renderEmail } = await import('../templates/emailRenderer.js');
      const htmlBody = await renderEmail(template || 'booking_created', {
        title: data.title,
        body: data.body,
        link: data.link,
        technicianName: data.technicianName,
        customerName: data.customerName,
        serviceName: data.serviceName,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        amount: data.amount,
        actionUrl: data.link,
      });

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM || 'noreply@galaxyofbeauty.sa',
        to,
        subject,
        html: htmlBody,
      });

      logger.info('Email sent', { jobId: job.id, messageId: info.messageId });
    } catch (error) {
      logger.error('Email job failed', { jobId: job.id, error: error.message, to });
      throw error;
    }
  }, {
    connection,
    concurrency: 5,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  // ---- Payout Worker ----
  new Worker('payout', async (job) => {
    logger.info('Processing payout job', { jobId: job.id, data: job.data });

    try {
      const { technicianId } = job.data;

      const { default: walletService } = await import('../services/wallet.js');
      const payoutResult = await walletService.calculateTechnicianPayout(
        technicianId,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(),
      );

      if (payoutResult) {
        await walletService.processPendingPayouts();
      }

      logger.info('Payout processed', { jobId: job.id, technicianId, payoutId: payoutResult?.id });
    } catch (error) {
      logger.error('Payout job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }, {
    connection,
    concurrency: 2,
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  });

  // ---- Webhook Worker ----
  new Worker('webhook', async (job) => {
    logger.info('Processing webhook job', { jobId: job.id });

    try {
      const { webhookData } = job.data;
      const { default: paymentService } = await import('../services/payment.js');
      const result = await paymentService.handlePaymentWebhook(webhookData);
      logger.info('Webhook processed successfully', { jobId: job.id, result });
    } catch (error) {
      logger.error('Webhook job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }, {
    connection,
    concurrency: 3,
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
  });

  // ---- Notification Worker (SMS) ----
  new Worker('notification', async (job) => {
    logger.info('Processing notification job', { jobId: job.id, type: job.data.type || job.name });

    try {
      if (job.data.type === 'sms' || job.data.phone) {
        const { phone, message } = job.data;
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          logger.info('SMS would be sent (Twilio configured)', { phone, message: message?.substring(0, 50) });
        } else {
          logger.info('SMS notification queued (Twilio not configured)', { phone, message: message?.substring(0, 50) });
        }
      } else {
        logger.info('Notification processed', { jobId: job.id, data: job.data });
      }
    } catch (error) {
      logger.error('Notification job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }, {
    connection,
    concurrency: 5,
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
  });

  // ---- Booking Timeout Worker ----
  new Worker('booking-timeout', async (job) => {
    logger.info('Processing booking timeout job', { jobId: job.id, bookingId: job.data.bookingId });

    try {
      const { default: bookingService } = await import('../services/booking.js');
      const result = await bookingService.autoRejectBooking(job.data.bookingId);

      if (result) {
        logger.info('Booking auto-rejected due to timeout', { jobId: job.id, bookingId: job.data.bookingId });
      }
    } catch (error) {
      logger.error('Booking timeout job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }, {
    connection,
    concurrency: 2,
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
  });

  logger.info('BullMQ workers initialized (email, payout, webhook, notification, booking-timeout)');
}

/**
 * Gracefully close all queue connections.
 */
export async function closeQueues() {
  if (!redisAvailable) return;

  const queues = [emailQueue, payoutQueue, webhookQueue, notificationQueue, bookingTimeoutQueue];
  await Promise.all(queues.map(q => q?.close?.().catch(() => {})));
  if (connection) await connection.quit().catch(() => {});
  logger.info('BullMQ queues closed');
}

export default { emailQueue, payoutQueue, webhookQueue, notificationQueue, bookingTimeoutQueue, initializeQueues, closeQueues };

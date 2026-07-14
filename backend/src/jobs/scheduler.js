/**
 * Production Scheduler — Repeatable Cron Jobs
 *
 * Uses BullMQ repeatable jobs to run periodic tasks:
 *   1. Weekly technician payouts (every Monday 2 AM AST)
 *   2. Booking reminders (every 5 min — checks for bookings in ~2 hours)
 *   3. Subscription expiry (daily at midnight)
 *   4. Stale booking cleanup (every 5 min — rejects REQUESTED > 30 min)
 *   5. Waitlist notification (every 15 min — notifies when slots free up)
 *
 * All jobs are idempotent — safe to run multiple times.
 */

import { Queue } from 'bullmq';
import env from '../config/env.js';
import logger from '../config/logger.js';
import prisma from '../config/database.js';
import { redisAvailable, connection } from './queue.js';
import events from '../shared/events.js';

// Dedicated queues for scheduled work — created lazily when Redis is available
export let schedulerQueue = null;

/**
 * Register all repeatable cron jobs.
 * Call once after server starts. Jobs are idempotent — BullMQ deduplicates by jobId.
 */
export async function initializeScheduler() {
  if (!redisAvailable || !connection) {
    logger.warn('Skipping scheduler initialization — Redis unavailable');
    return;
  }

  // Create queue lazily using the live connection
  if (!schedulerQueue) {
    schedulerQueue = new Queue('scheduler', { connection });
  }

  try {
    // Clean old repeatable jobs to prevent duplicate accumulation
    const repeatables = await schedulerQueue.getRepeatableJobs();
    const currentJobIds = new Set([
      'weekly-payouts',
      'booking-reminders',
      'subscription-expiry',
      'stale-booking-cleanup',
      'waitlist-check',
    ]);

    for (const job of repeatables) {
      if (!currentJobIds.has(job.id || job.name)) {
        await schedulerQueue.removeRepeatableByKey(job.key);
      }
    }

    // 1. Weekly Payouts — Monday 2:00 AM Arabia Standard Time
    await schedulerQueue.upsertJobScheduler(
      'weekly-payouts',
      { pattern: '0 2 * * 1' }, // Every Monday at 2 AM
      {
        name: 'weekly-payouts',
        data: { type: 'weekly-payouts' },
        opts: {
          jobId: 'weekly-payouts',
          removeOnComplete: true,
          removeOnFail: 3,
        },
      },
    );

    // 2. Booking Reminders — every 5 minutes
    await schedulerQueue.upsertJobScheduler(
      'booking-reminders',
      { every: 300_000 }, // 5 minutes in ms
      {
        name: 'booking-reminders',
        data: { type: 'booking-reminders' },
        opts: {
          jobId: 'booking-reminders',
          removeOnComplete: true,
          removeOnFail: 3,
        },
      },
    );

    // 3. Subscription Expiry — daily at 1:00 AM
    await schedulerQueue.upsertJobScheduler(
      'subscription-expiry',
      { pattern: '0 1 * * *' },
      {
        name: 'subscription-expiry',
        data: { type: 'subscription-expiry' },
        opts: {
          jobId: 'subscription-expiry',
          removeOnComplete: true,
          removeOnFail: 3,
        },
      },
    );

    // 4. Stale Booking Cleanup — every 5 minutes
    await schedulerQueue.upsertJobScheduler(
      'stale-booking-cleanup',
      { every: 300_000 },
      {
        name: 'stale-booking-cleanup',
        data: { type: 'stale-booking-cleanup' },
        opts: {
          jobId: 'stale-booking-cleanup',
          removeOnComplete: true,
          removeOnFail: 3,
        },
      },
    );

    // 5. Waitlist Check — every 15 minutes
    await schedulerQueue.upsertJobScheduler(
      'waitlist-check',
      { every: 900_000 },
      {
        name: 'waitlist-check',
        data: { type: 'waitlist-check' },
        opts: {
          jobId: 'waitlist-check',
          removeOnComplete: true,
          removeOnFail: 3,
        },
      },
    );

    logger.info('Scheduler initialized — 5 repeatable jobs registered');
  } catch (error) {
    logger.error('Failed to initialize scheduler', { error: error.message });
  }
}

// =============================================================================
// Worker: Process scheduler jobs
// =============================================================================

import { Worker } from 'bullmq';

export function initializeSchedulerWorker() {
  if (!redisAvailable || !connection) {
    logger.warn('Skipping scheduler worker — Redis unavailable');
    return;
  }

  new Worker('scheduler', async (job) => {
    const { type } = job.data;
    logger.info(`Running scheduled job: ${type}`);

    switch (type) {
      case 'weekly-payouts':
        await processWeeklyPayouts();
        break;
      case 'booking-reminders':
        await processBookingReminders();
        break;
      case 'subscription-expiry':
        await processSubscriptionExpiry();
        break;
      case 'stale-booking-cleanup':
        await processStaleBookings();
        break;
      case 'waitlist-check':
        await processWaitlistCheck();
        break;
      default:
        logger.warn('Unknown scheduler job type', { type });
    }
  }, {
    connection,
    concurrency: 2,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 20 },
  });

  logger.info('Scheduler worker started');
}

// =============================================================================
// Job Handlers
// =============================================================================

/**
 * Process weekly payouts for all technicians.
 * Aggregates completed bookings from the past 7 days.
 */
async function processWeeklyPayouts() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find all technicians with completed bookings in the past week
  const completedBookings = await prisma.booking.groupBy({
    by: ['technicianId'],
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: weekAgo },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  let payoutsCreated = 0;

  for (const group of completedBookings) {
    const amount = Number(group._sum.totalAmount || 0);
    if (amount <= 0) continue;

    const payoutAmount = Math.round(amount * 0.99 * 100) / 100; // 99% to technician

    // Check if a payout for this period already exists
    const existing = await prisma.payout.findFirst({
      where: {
        technicianId: group.technicianId,
        periodStart: { gte: weekAgo },
        status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] },
      },
    });

    if (existing) continue;

    await prisma.payout.create({
      data: {
        technicianId: group.technicianId,
        periodStart: weekAgo,
        periodEnd: new Date(),
        amount: payoutAmount,
        status: 'PENDING',
      },
    });

    payoutsCreated++;
  }

  logger.info('Weekly payouts processed', { technicians: completedBookings.length, payoutsCreated });
}

/**
 * Send booking reminders for bookings starting in ~2 hours.
 */
async function processBookingReminders() {
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const twoHoursFiveMinFromNow = new Date(Date.now() + 125 * 60 * 1000);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: { in: ['ACCEPTED', 'PAYMENT_AUTHORIZED', 'CONFIRMED_OFFLINE', 'PAID'] },
      startAt: { gte: twoHoursFromNow, lte: twoHoursFiveMinFromNow },
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
      service: { select: { titleJson: true } },
    },
  });

  for (const booking of upcomingBookings) {
    try {
      events.emit('booking:reminder', { booking });
    } catch (err) {
      logger.error('Reminder notification failed', { bookingId: booking.id, error: err.message });
    }
  }

  if (upcomingBookings.length > 0) {
    logger.info('Booking reminders sent', { count: upcomingBookings.length });
  }
}

/**
 * Process subscription expirations — expire and handle auto-renewals.
 */
async function processSubscriptionExpiry() {
  const now = new Date();

  // Find active subscriptions that have expired
  const expired = await prisma.customerAiSubscription.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: now },
    },
    include: {
      plan: { select: { priceMonthly: true } },
      user: { select: { wallet: { select: { id: true, balance: true, bonusBalance: true } } } },
    },
  });

  let renewed = 0;
  let expired_ = 0;

  for (const sub of expired) {
    if (sub.autoRenew) {
      const monthlyPrice = Number(sub.plan.priceMonthly);

      // Try to deduct from wallet first, then bonus balance
      const wallet = sub.user?.wallet;
      const walletBalance = wallet ? Number(wallet.balance) : 0;
      const bonusBalance = wallet ? Number(wallet.bonusBalance) : 0;
      const totalAvailable = walletBalance + bonusBalance;

      if (totalAvailable >= monthlyPrice && wallet) {
        // Deduct: bonus first, then wallet
        const fromBonus = Math.min(bonusBalance, monthlyPrice);
        const fromWallet = monthlyPrice - fromBonus;

        await prisma.$transaction(async (tx) => {
          if (fromBonus > 0) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { bonusBalance: { decrement: fromBonus } },
            });
          }
          if (fromWallet > 0) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { decrement: fromWallet } },
            });
          }

          await tx.customerAiSubscription.update({
            where: { id: sub.id },
            data: {
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'DEBIT',
              source: 'SUBSCRIPTION_BONUS',
              amount: monthlyPrice,
              description: `Auto-renewal: AI subscription (${sub.planId})`,
              referenceId: `sub-renewal:${sub.id}`,
            },
          });
        });

        renewed++;
      } else {
        // Insufficient funds — expire
        await prisma.customerAiSubscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });
        expired_++;
      }
    } else {
      // Not auto-renew — expire
      await prisma.customerAiSubscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
      });
      expired_++;
    }
  }

  if (expired.length > 0) {
    logger.info('Subscription expiry processed', { total: expired.length, renewed, expired: expired_ });
  }
}

/**
 * Auto-reject bookings that have been REQUESTED for > 30 minutes.
 */
async function processStaleBookings() {
  const timeoutMin = parseInt(env.BOOKING_REQUEST_TIMEOUT_MIN || 30);
  const cutoff = new Date(Date.now() - timeoutMin * 60 * 1000);

  const staleBookings = await prisma.booking.findMany({
    where: {
      status: 'REQUESTED',
      createdAt: { lte: cutoff },
    },
    select: { id: true, bookingCode: true, technicianId: true },
  });

  let rejected = 0;

  for (const booking of staleBookings) {
    try {
      // Use the autoRejectBooking function from booking service
      const { autoRejectBooking } = await import('../services/booking.js');
      await autoRejectBooking(booking.id);
      rejected++;
    } catch (err) {
      logger.error('Stale booking rejection failed', { bookingId: booking.id, error: err.message });
    }
  }

  if (rejected > 0) {
    logger.info('Stale bookings auto-rejected', { rejected, total: staleBookings.length });
  }
}

/**
 * Check waitlist: when a slot frees up, notify the next waiting customer.
 */
async function processWaitlistCheck() {
  // Find technicians who have open slots and active waitlists
  const techsWithWaitlist = await prisma.waitlistEntry.groupBy({
    by: ['technicianId'],
    where: { status: 'WAITING' },
    _count: { id: true },
  });

  let notified = 0;

  for (const entry of techsWithWaitlist) {
    // Check if this technician has available slots
    const availableSlots = await prisma.availabilitySlot.count({
      where: {
        technicianId: entry.technicianId,
        isBooked: false,
        isAvailable: true,
        startAt: { gte: new Date() },
      },
    });

    if (availableSlots > 0) {
      // Get the first waiting customer
      const firstInLine = await prisma.waitlistEntry.findFirst({
        where: { technicianId: entry.technicianId, status: 'WAITING' },
        orderBy: { position: 'asc' },
        include: { customer: { select: { id: true, name: true } } },
      });

      if (firstInLine) {
        try {
          const { emitToUser } = await import('../socket/index.js');
          emitToUser(firstInLine.customerId, 'waitlist_update', {
            technicianId: entry.technicianId,
            message: 'فتحت مواعيد جديدة! بادري بالحجز قبل نفادها.',
            availableSlots,
          });

          // Mark as notified
          await prisma.waitlistEntry.update({
            where: { id: firstInLine.id },
            data: { status: 'NOTIFIED', notifiedAt: new Date() },
          });

          notified++;
        } catch (err) {
          logger.error('Waitlist notification failed', { entryId: firstInLine.id, error: err.message });
        }
      }
    }
  }

  if (notified > 0) {
    logger.info('Waitlist notifications sent', { notified });
  }
}

export default { initializeScheduler, initializeSchedulerWorker };

import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

// =============================================================================
// Wallet & Cashback Logic
// =============================================================================

/**
 * Process booking earnings after payment capture.
 * Calculates and distributes:
 *   - Customer cashback (40% first booking, 5% subsequent)
 *   - Technician earnings (99% bank, 1% wallet + 25% platform fee share)
 *
 * Called within a transaction from payment.capturePayment.
 *
 * @param {object} booking - The booking record
 * @param {object} tx - Prisma transaction client
 */
export async function processBookingEarnings(booking, tx) {
  const servicePrice = Number(booking.totalAmount);
  const platformFee = Number(booking.platformFee || env.PLATFORM_FEE_SAR || 11);

  // ---- Customer Cashback ----
  // Check if this is the customer's first completed booking
  const completedCount = await tx.booking.count({
    where: {
      customerId: booking.customerId,
      status: 'COMPLETED',
      id: { not: booking.id },
    },
  });

  const isFirstBooking = completedCount === 0;
  const cashbackPercent = isFirstBooking
    ? Number(env.CASHBACK_FIRST_BOOKING_PERCENT || 40)
    : Number(env.CASHBACK_SUBSEQUENT_PERCENT || 5);

  const cashbackAmount = Math.round((servicePrice * cashbackPercent) / 100 * 100) / 100;

  if (cashbackAmount > 0) {
    const customerWallet = await tx.wallet.findUnique({
      where: { userId: booking.customerId },
    });

    if (customerWallet) {
      await tx.wallet.update({
        where: { id: customerWallet.id },
        data: { balance: { increment: cashbackAmount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: customerWallet.id,
          type: 'CREDIT',
          source: 'CASHBACK',
          amount: cashbackAmount,
          description: `${isFirstBooking ? 'First booking' : 'Booking'} cashback (${cashbackPercent}%)`,
          referenceId: `booking:${booking.id}`,
        },
      });

      logger.info('Cashback credited', {
        userId: booking.customerId,
        amount: cashbackAmount,
        isFirstBooking,
      });
    }
  }

  // ---- Technician Earnings ----
  const earningsPercent = Number(env.TECHNICIAN_EARNINGS_PERCENT || 99);
  const walletSharePercent = Number(env.TECHNICIAN_WALLET_SHARE_PERCENT || 1);
  const platformFeeSharePercent = Number(env.TECHNICIAN_PLATFORM_FEE_SHARE_PERCENT || 25);

  const bankAmount = Math.round((servicePrice * earningsPercent) / 100 * 100) / 100;
  const walletAmount = Math.round(
    ((servicePrice * walletSharePercent) / 100 + (platformFee * platformFeeSharePercent) / 100)
    * 100
  ) / 100;

  const techWallet = await tx.wallet.findUnique({
    where: { userId: booking.technicianId },
  });

  if (techWallet && walletAmount > 0) {
    await tx.wallet.update({
      where: { id: techWallet.id },
      data: { balance: { increment: walletAmount } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: techWallet.id,
        type: 'CREDIT',
        source: 'PLATFORM_FEE_SHARE',
        amount: walletAmount,
        description: `Earnings from booking #${booking.bookingCode} (1% service + 25% platform fee)`,
        referenceId: `booking:${booking.id}`,
      },
    });

    logger.info('Technician earnings credited', {
      userId: booking.technicianId,
      bankAmount,
      walletAmount,
    });
  }

  return { cashbackAmount, bankAmount, walletAmount };
}

// =============================================================================
// Wallet Operations
// =============================================================================

/**
 * Get wallet with balance and recent transactions.
 *
 * @param {number} userId
 */
export async function getWallet(userId) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!wallet) {
    throw new AppError('Wallet not found', 404, ErrorCodes.WALLET_NOT_FOUND);
  }

  return wallet;
}

/**
 * Get wallet transactions with pagination and filters.
 *
 * @param {number} userId
 * @param {object} filters
 */
export async function getWalletTransactions(userId, filters = {}) {
  const { type, source, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, ErrorCodes.WALLET_NOT_FOUND);

  const where = { walletId: wallet.id };
  if (type) where.type = type;
  if (source) where.source = source;

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    wallet: { id: wallet.id, balance: Number(wallet.balance), bonusBalance: Number(wallet.bonusBalance) },
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Withdraw funds from technician wallet.
 * Rules: Min balance 200 SAR, min withdrawal 100 SAR, 5% fee.
 *
 * @param {number} userId
 * @param {number} amount - Gross withdrawal amount
 */
export async function withdrawFromWallet(userId, amount) {
  const minBalance = Number(env.MIN_WITHDRAWAL_BALANCE || 200);
  const minAmount = Number(env.MIN_WITHDRAWAL_AMOUNT || 100);
  const feePercent = Number(env.WITHDRAWAL_FEE_PERCENT || 5);

  if (amount < minAmount) {
    throw new AppError(
      `Minimum withdrawal amount is ${minAmount} SAR`,
      400,
      ErrorCodes.BELOW_MINIMUM_BALANCE,
    );
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, ErrorCodes.WALLET_NOT_FOUND);

  const balance = Number(wallet.balance);
  if (balance < minBalance) {
    throw new AppError(
      `Minimum wallet balance of ${minBalance} SAR required for withdrawal`,
      400,
      ErrorCodes.BELOW_MINIMUM_BALANCE,
    );
  }

  if (amount > balance) {
    throw new AppError('Insufficient balance', 400, ErrorCodes.INSUFFICIENT_FUNDS);
  }

  const fee = Math.round((amount * feePercent) / 100 * 100) / 100;
  const netAmount = amount - fee;

  // Atomic withdrawal
  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        source: 'WITHDRAWAL',
        amount,
        description: `Withdrawal: ${netAmount} SAR net after ${feePercent}% fee (${fee} SAR)`,
      },
    });

    // Create payout record for bank transfer
    await tx.payout.create({
      data: {
        technicianId: userId,
        periodStart: new Date(),
        periodEnd: new Date(),
        amount: netAmount,
        fee,
        status: 'PENDING',
      },
    });

    return transaction;
  });

  logger.info('Wallet withdrawal processed', { userId, amount, fee, netAmount });

  return {
    transaction: result,
    gross: amount,
    fee,
    net: netAmount,
  };
}

/**
 * Add subscription bonus to technician wallet (non-withdrawable).
 *
 * @param {number} userId
 */
export async function addSubscriptionBonus(userId) {
  const bonusAmount = Number(env.SUBSCRIPTION_BONUS || 50);

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, ErrorCodes.WALLET_NOT_FOUND);

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { bonusBalance: { increment: bonusAmount } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        source: 'SUBSCRIPTION_BONUS',
        amount: bonusAmount,
        description: 'Subscription bonus (non-withdrawable)',
      },
    });
  });

  logger.info('Subscription bonus added', { userId, amount: bonusAmount });

  return { bonusAmount };
}

// =============================================================================
// Payout Processing (Admin-triggered or weekly via BullMQ)
// =============================================================================

/**
 * Calculate weekly payout for a technician.
 * Aggregates all completed bookings in the given period.
 *
 * @param {number} technicianId
 * @param {Date} periodStart
 * @param {Date} periodEnd
 */
export async function calculateTechnicianPayout(technicianId, periodStart, periodEnd) {
  const bookings = await prisma.booking.findMany({
    where: {
      technicianId,
      status: 'COMPLETED',
      updatedAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
    },
  });

  const totalServiceAmount = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const earningsPercent = Number(env.TECHNICIAN_EARNINGS_PERCENT || 99);
  const payoutAmount = Math.round((totalServiceAmount * earningsPercent) / 100 * 100) / 100;

  if (payoutAmount <= 0) return null;

  const payout = await prisma.payout.create({
    data: {
      technicianId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      amount: payoutAmount,
      status: 'PENDING',
    },
  });

  logger.info('Payout calculated', { technicianId, amount: payoutAmount, bookingCount: bookings.length });

  return payout;
}

/**
 * Process pending payouts in bulk (admin trigger or weekly cron).
 */
export async function processPendingPayouts() {
  const pending = await prisma.payout.findMany({
    where: { status: 'PENDING' },
  });

  const results = [];
  for (const payout of pending) {
    try {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'PROCESSING', processedAt: new Date() },
      });
      results.push({ payoutId: payout.id, status: 'PROCESSING' });
    } catch (err) {
      logger.error('Payout processing failed', { payoutId: payout.id, error: err.message });
    }
  }

  return results;
}

export default {
  processBookingEarnings,
  getWallet,
  getWalletTransactions,
  withdrawFromWallet,
  addSubscriptionBonus,
  calculateTechnicianPayout,
  processPendingPayouts,
};

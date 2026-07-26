/**
 * Referral Program Service
 *
 * Dual rewards: referrer gets 20 SAR, referred friend gets 20 SAR
 * after the referred friend completes their first booking.
 */

import crypto from 'crypto';
import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Generate a unique referral code for a user.
 * Called when a user registers or when they first access the referral page.
 *
 * @param {number} userId
 * @returns {Promise<string>} Referral code
 */
export async function generateReferralCode(userId) {
  // Check if user already has a code
  const existing = await prisma.referral.findFirst({
    where: { referrerId: userId },
    select: { referralCode: true },
  });

  if (existing) return existing.referralCode;

  // Generate a unique 8-char code from user ID + random
  const code = `${String(userId).padStart(3, '0')}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  return code;
}

/**
 * Get user's referral stats.
 *
 * @param {number} userId
 * @returns {Promise<{ code: string, totalReferred: number, totalEarned: number, referrals: Array }>}
 */
export async function getReferralStats(userId) {
  const code = await generateReferralCode(userId);

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      referred: { select: { id: true, name: true, createdAt: true } },
    },
  });

  const completed = referrals.filter((r) => r.status === 'COMPLETED');
  const totalEarned = completed.reduce((sum, r) => sum + Number(r.referrerReward), 0);

  return {
    code,
    totalReferred: referrals.length,
    totalCompleted: completed.length,
    totalEarned,
    referrals: referrals.map((r) => ({
      id: r.id,
      referredName: r.referred.name,
      status: r.status,
      reward: Number(r.referrerReward),
      completedAt: r.completedAt?.toISOString() || null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

/**
 * Register a referral when a new user signs up with a referral code.
 *
 * @param {number} referredUserId - The new user's ID
 * @param {string} referralCode - The referral code they used
 */
export async function registerReferral(referredUserId, referralCode) {
  if (!referralCode) return null;

  // Find the referrer by code
  const existingReferral = await prisma.referral.findFirst({
    where: { referralCode },
  });

  if (!existingReferral) {
    logger.warn('Invalid referral code used', { referralCode });
    return null;
  }

  // Don't allow self-referral
  if (existingReferral.referrerId === referredUserId) {
    return null;
  }

  // Create the referral record
  const referral = await prisma.referral.create({
    data: {
      referrerId: existingReferral.referrerId,
      referredId: referredUserId,
      referralCode: `${referralCode}-${crypto.randomBytes(2).toString('hex')}`,
      status: 'PENDING',
    },
  });

  logger.info('Referral registered', {
    referrerId: existingReferral.referrerId,
    referredId: referredUserId,
  });

  return referral;
}

/**
 * Process referral rewards after the referred user completes their first booking.
 *
 * @param {number} referredUserId - The user who completed their first booking
 */
export async function processReferralReward(referredUserId) {
  const referral = await prisma.referral.findFirst({
    where: {
      referredId: referredUserId,
      status: 'PENDING',
      rewardCredited: false,
    },
  });

  if (!referral) return null;

  const referrerReward = Number(referral.referrerReward);
  const referredReward = Number(referral.referredReward);

  await prisma.$transaction(async (tx) => {
    // Credit referrer
    const referrerWallet = await tx.wallet.findUnique({ where: { userId: referral.referrerId } });
    if (referrerWallet && referrerReward > 0) {
      await tx.wallet.update({
        where: { id: referrerWallet.id },
        data: { balance: { increment: referrerReward } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: referrerWallet.id,
          type: 'CREDIT',
          source: 'REFERRAL_BONUS',
          amount: referrerReward,
          description: 'Referral reward — friend completed first booking',
          referenceId: `referral:${referral.id}`,
        },
      });
    }

    // Credit referred user
    const referredWallet = await tx.wallet.findUnique({ where: { userId: referredUserId } });
    if (referredWallet && referredReward > 0) {
      await tx.wallet.update({
        where: { id: referredWallet.id },
        data: { balance: { increment: referredReward } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: referredWallet.id,
          type: 'CREDIT',
          source: 'REFERRAL_BONUS',
          amount: referredReward,
          description: 'Welcome bonus — first booking completed via referral',
          referenceId: `referral:${referral.id}`,
        },
      });
    }

    // Mark referral as completed
    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        rewardCredited: true,
      },
    });
  });

  logger.info('Referral reward processed', {
    referralId: referral.id,
    referrerId: referral.referrerId,
    referredId: referredUserId,
    referrerReward,
    referredReward,
  });

  return { referrerReward, referredReward };
}

export default { generateReferralCode, getReferralStats, registerReferral, processReferralReward };

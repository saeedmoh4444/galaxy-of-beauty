import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

/**
 * Subscribe a technician to an AI plan.
 * Deducts from wallet balance first, then bonus balance.
 * Credits subscription bonus on purchase.
 */
export async function purchaseSubscription(userId, planId) {
  const plan = await prisma.aiSubscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    throw new AppError('Subscription plan not found', 404, ErrorCodes.NOT_FOUND);
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, ErrorCodes.WALLET_NOT_FOUND);

  const price = Number(plan.priceMonthly);
  const balance = Number(wallet.balance);
  const bonusBalance = Number(wallet.bonusBalance);

  const totalAvailable = balance + bonusBalance;
  if (totalAvailable < price) {
    throw new AppError(
      `Insufficient funds. Need ${price} SAR, have ${totalAvailable} SAR`,
      400,
      ErrorCodes.INSUFFICIENT_FUNDS,
    );
  }

  // Deduct: bonus first, then balance
  const fromBonus = Math.min(bonusBalance, price);
  const fromBalance = price - fromBonus;

  const subscription = await prisma.$transaction(async (tx) => {
    // Deduct from wallet
    if (fromBonus > 0) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { bonusBalance: { decrement: fromBonus } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id, type: 'DEBIT', source: 'SUBSCRIPTION_BONUS',
          amount: fromBonus,
          description: `Subscription bonus used for ${plan.nameJson?.ar || plan.nameJson?.en}`,
        },
      });
    }

    if (fromBalance > 0) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: fromBalance } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id, type: 'DEBIT', source: 'PLATFORM_FEE_SHARE',
          amount: fromBalance,
          description: `Balance used for subscription`,
        },
      });
    }

    // Create or renew subscription
    const existing = await tx.customerAiSubscription.findUnique({ where: { userId } });

    let sub;
    if (existing) {
      sub = await tx.customerAiSubscription.update({
        where: { userId },
        data: {
          planId,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true,
        },
      });
    } else {
      sub = await tx.customerAiSubscription.create({
        data: {
          userId,
          planId,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: true,
        },
      });
    }

    // Credit subscription bonus (50 SAR non-withdrawable)
    const bonusAmount = Number(env.SUBSCRIPTION_BONUS || 50);
    if (bonusAmount > 0) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { bonusBalance: { increment: bonusAmount } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id, type: 'CREDIT', source: 'SUBSCRIPTION_BONUS',
          amount: bonusAmount,
          description: 'Subscription bonus (non-withdrawable, for next renewal)',
        },
      });
    }

    return sub;
  });

  logger.info('Subscription purchased', { userId, planId, price, fromBonus, fromBalance });

  return {
    subscription,
    price,
    fromBonus,
    fromBalance,
    bonusCredited: Number(env.SUBSCRIPTION_BONUS || 50),
  };
}

/**
 * Get active subscription for a user.
 */
export async function getSubscription(userId) {
  const sub = await prisma.customerAiSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  return sub;
}

/**
 * Get all available plans.
 */
export async function getPlans() {
  return prisma.aiSubscriptionPlan.findMany({ where: { isActive: true } });
}

/**
 * Cancel auto-renewal.
 */
export async function cancelAutoRenew(userId) {
  const sub = await prisma.customerAiSubscription.findUnique({ where: { userId } });
  if (!sub) throw new AppError('No active subscription', 404, ErrorCodes.NOT_FOUND);

  return prisma.customerAiSubscription.update({
    where: { userId },
    data: { autoRenew: false },
  });
}

export default { purchaseSubscription, getSubscription, getPlans, cancelAutoRenew };

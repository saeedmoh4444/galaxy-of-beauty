/**
 * Audit gap #2 — AI-subscription purchase must take payment.
 * The purchase upserted an ACTIVE subscription with no money movement.
 * Now: wallet-funded, atomic with the subscription upsert, DEBIT
 * recorded (SUBSCRIPTION_PURCHASE).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let buyer: JwtPayload;
let buyerUserId: number;
let planId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  buyerUserId = u.id;
  buyer = { id: u.id, role: 'CUSTOMER', email: u.email };
  await prisma.wallet.create({ data: { userId: u.id, balance: 300 } });

  const plan = await prisma.aiSubscriptionPlan.create({
    data: {
      nameJson: { ar: 'خطة الاختبار', en: 'Test Plan' },
      feature: 'CHATBOT',
      monthlyLimit: 100,
      priceMonthly: 200,
      isActive: true,
    },
  });
  planId = plan.id;
}, 15000);

afterAll(async () => {
  try {
    await prisma.customerAiSubscription.deleteMany({ where: { userId: buyerUserId } });
  } catch {}
  try {
    await prisma.aiSubscriptionPlan.deleteMany({ where: { id: planId } });
  } catch {}
  try {
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { userId: buyerUserId } },
    });
  } catch {}
  try {
    await prisma.wallet.deleteMany({ where: { userId: buyerUserId } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: buyerUserId } });
  } catch {}
});

describe('AI subscription purchase takes payment', () => {
  it('rejects a purchase without sufficient wallet balance', async () => {
    const caller = callerFor(buyer);
    // Balance is 300; temporarily overshoot by buying an expensive plan.
    const expensive = await prisma.aiSubscriptionPlan.create({
      data: {
        nameJson: { ar: 'غالية', en: 'Expensive' },
        feature: 'CHATBOT',
        monthlyLimit: 1000,
        priceMonthly: 1000,
        isActive: true,
      },
    });
    try {
      await expect(caller.subscriptions.purchase({ planId: expensive.id })).rejects.toThrow(
        /Insufficient wallet balance/,
      );
    } finally {
      await prisma.aiSubscriptionPlan.deleteMany({ where: { id: expensive.id } });
    }
  }, 15000);

  it('deducts the wallet and records a SUBSCRIPTION_PURCHASE debit on purchase', async () => {
    const caller = callerFor(buyer);
    const before = await prisma.wallet.findUniqueOrThrow({ where: { userId: buyerUserId } });

    const sub = await caller.subscriptions.purchase({ planId });

    const after = await prisma.wallet.findUniqueOrThrow({ where: { userId: buyerUserId } });
    expect(Number(after.balance)).toBe(Number(before.balance) - 200); // priceMonthly
    expect(sub.status).toBe('ACTIVE');

    const txn = await prisma.walletTransaction.findFirst({
      where: { walletId: after.id, type: 'DEBIT', source: 'SUBSCRIPTION_PURCHASE' },
    });
    expect(txn).toBeTruthy();
    expect(Number(txn!.amount)).toBe(200);
  }, 15000);
});

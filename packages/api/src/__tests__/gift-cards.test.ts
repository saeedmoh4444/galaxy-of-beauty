import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers/index';
import { prisma } from '@galaxy/db';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const CUSTOMER: JwtPayload = { id: 1, role: 'CUSTOMER', email: 'customer@test.com' };
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

// Money-integrity (audit gap #1): purchase must take payment. Dedicated
// buyer user + wallet so the parallel-DB suite is not disturbed.
let buyer: JwtPayload;
let buyerUserId: number;

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  buyerUserId = u.id;
  buyer = { id: u.id, role: 'CUSTOMER', email: u.email };
  await prisma.wallet.create({ data: { userId: u.id, balance: 200 } });
}, 15000);

afterAll(async () => {
  try {
    await prisma.giftCard.deleteMany({ where: { purchaserId: buyerUserId } });
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

describe('Gift Cards', () => {
  describe('Success cases', () => {
    it('should check balance with invalid code gracefully', async () => {
      const caller = await authCaller(CUSTOMER);
      await expect(caller.giftCards.checkBalance({ code: 'NONEXISTENT' })).rejects.toThrow();
    }, 15000);

    it('should list my cards as customer', async () => {
      const caller = await authCaller(CUSTOMER);
      const cards = await caller.giftCards.myCards();
      expect(Array.isArray(cards)).toBe(true);
    }, 15000);

    it('should list all cards as admin', async () => {
      const caller = await authCaller(ADMIN);
      const result = await caller.giftCards.listAll({ limit: 10 });
      expect(result).toBeDefined();
    }, 15000);

    it('rejects a purchase without sufficient wallet balance', async () => {
      const caller = await authCaller(buyer);
      await expect(caller.giftCards.purchase({ amount: 1000 })).rejects.toThrow(
        /Insufficient wallet balance/,
      );
    }, 15000);

    it('deducts the wallet and records a GIFT_CARD_PURCHASE debit on purchase', async () => {
      const caller = await authCaller(buyer);
      const before = await prisma.wallet.findUniqueOrThrow({ where: { userId: buyerUserId } });
      const card = await caller.giftCards.purchase({ amount: 150 });
      const after = await prisma.wallet.findUniqueOrThrow({ where: { userId: buyerUserId } });

      expect(Number(after.balance)).toBe(Number(before.balance) - 150);
      expect(card.amount).toBe(150);

      const txn = await prisma.walletTransaction.findFirst({
        where: { walletId: after.id, type: 'DEBIT', source: 'GIFT_CARD_PURCHASE' },
      });
      expect(txn).toBeTruthy();
      expect(Number(txn!.amount)).toBe(150);
    }, 15000);
  });
});

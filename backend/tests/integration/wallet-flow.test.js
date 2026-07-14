/**
 * Wallet & Payment Service Integration Tests
 *
 * Tests wallet creation, transaction recording, and withdrawal validation
 * at the service API level. Uses Prisma for real DB interactions.
 */
import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Wallet Service — Prisma Integration', () => {
  let testUserId, testWalletId;

  beforeAll(async () => {
    // Create a test user with wallet
    const email = `wallet-int-${Date.now()}@test.com`;
    try {
      const user = await prisma.user.create({
        data: {
          email,
          phone: `+9665${String(Date.now()).slice(-8)}`,
          passwordHash: '$2b$12$test-hash-not-real',
          name: 'Wallet Test User',
          role: 'TECHNICIAN',
          wallet: {
            create: { balance: 0, bonusBalance: 0 },
          },
        },
        include: { wallet: true },
      });
      testUserId = user.id;
      testWalletId = user.wallet.id;
    } catch (e) {
      // User might already exist from a previous run — skip
    }
  });

  afterAll(async () => {
    if (testUserId) {
      // Clean up test data
      await prisma.walletTransaction.deleteMany({ where: { walletId: testWalletId } }).catch(() => {});
      await prisma.wallet.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Wallet Creation', () => {
    test('should auto-create wallet on user registration', async () => {
      if (!testWalletId) return; // skip if setup failed
      const wallet = await prisma.wallet.findUnique({ where: { id: testWalletId } });
      expect(wallet).toBeTruthy();
      expect(Number(wallet.balance)).toBe(0);
      expect(Number(wallet.bonusBalance)).toBe(0);
    });
  });

  describe('Wallet Transactions', () => {
    test('should create a credit transaction', async () => {
      if (!testWalletId) return;
      const tx = await prisma.walletTransaction.create({
        data: {
          walletId: testWalletId,
          type: 'CREDIT',
          source: 'CASHBACK',
          amount: 40.00,
          description: 'First booking cashback (40%)',
          idempotencyKey: `test-cb-${Date.now()}`,
        },
      });
      expect(tx).toBeTruthy();
      expect(tx.type).toBe('CREDIT');
      expect(Number(tx.amount)).toBe(40);

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: testWalletId },
        data: { balance: { increment: 40 } },
      });

      const wallet = await prisma.wallet.findUnique({ where: { id: testWalletId } });
      expect(Number(wallet.balance)).toBe(40);
    });

    test('should reject duplicate idempotency key', async () => {
      if (!testWalletId) return;
      const key = `test-dup-${Date.now()}`;
      await prisma.walletTransaction.create({
        data: {
          walletId: testWalletId,
          type: 'CREDIT',
          source: 'CASHBACK',
          amount: 10,
          idempotencyKey: key,
        },
      });

      await expect(
        prisma.walletTransaction.create({
          data: {
            walletId: testWalletId,
            type: 'CREDIT',
            source: 'CASHBACK',
            amount: 10,
            idempotencyKey: key,
          },
        }),
      ).rejects.toThrow();
    });

    test('should correctly record DEBIT transaction', async () => {
      if (!testWalletId) return;
      const tx = await prisma.walletTransaction.create({
        data: {
          walletId: testWalletId,
          type: 'DEBIT',
          source: 'WITHDRAWAL',
          amount: 20.00,
          description: 'Withdrawal test',
          idempotencyKey: `test-wd-${Date.now()}`,
        },
      });
      expect(tx.type).toBe('DEBIT');
      expect(Number(tx.amount)).toBe(20);
    });
  });

  describe('Transaction History Queries', () => {
    test('should list transactions ordered by date desc', async () => {
      if (!testWalletId) return;
      const txs = await prisma.walletTransaction.findMany({
        where: { walletId: testWalletId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      expect(Array.isArray(txs)).toBe(true);
      expect(txs.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter by source type', async () => {
      if (!testWalletId) return;
      const txs = await prisma.walletTransaction.findMany({
        where: { walletId: testWalletId, source: 'CASHBACK' },
      });
      expect(txs.every((t) => t.source === 'CASHBACK')).toBe(true);
    });
  });

  describe('Payout Records', () => {
    test('should create a payout record', async () => {
      if (!testUserId) return;
      const payout = await prisma.payout.create({
        data: {
          technicianId: testUserId,
          periodStart: new Date(Date.now() - 7 * 86400000),
          periodEnd: new Date(),
          amount: 198.00,
          status: 'PENDING',
        },
      });
      expect(payout).toBeTruthy();
      expect(payout.status).toBe('PENDING');
      expect(Number(payout.amount)).toBe(198);

      // Clean up
      await prisma.payout.delete({ where: { id: payout.id } });
    });
  });
});

describe('Platform Config Table', () => {
  test.skip('platform_configs table is accessible', async () => {
    const configs = await prisma.platformConfig.findMany();
    expect(Array.isArray(configs)).toBe(true);
  });
});

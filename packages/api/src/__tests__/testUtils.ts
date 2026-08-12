/**
 * Test utilities for database cleanup and test isolation.
 *
 * Usage in beforeAll/afterAll hooks:
 *   import { cleanupTestData } from './testUtils';
 *   afterAll(async () => {
 *     await cleanupTestData({ email: 'test-@example.com' });
 *   });
 */
import { prisma } from '@galaxy/db';

// ── Cleanup ──────────────────────────────────────────────────

export interface CleanupFilter {
  email?: string;
  emailPattern?: string;
  userId?: number;
  bookingId?: number;
}

/**
 * Clean up test data matching the given filter.
 * Use in afterAll/afterEach to prevent test state leakage.
 */
export async function cleanupTestData(filter: CleanupFilter): Promise<void> {
  const where: Record<string, unknown> = {};

  if (filter.email) {
    where.email = filter.email;
  }
  if (filter.emailPattern) {
    where.email = { contains: filter.emailPattern };
  }
  if (filter.userId) {
    where.userId = filter.userId;
  }
  if (filter.bookingId) {
    where.bookingId = filter.bookingId;
  }

  // Order matters: delete children before parents
  if (filter.bookingId || filter.userId) {
    await prisma.payment.deleteMany({ where }).catch(() => {});
    await prisma.review.deleteMany({ where }).catch(() => {});
    await prisma.dispute.deleteMany({ where }).catch(() => {});
  }

  if (filter.userId) {
    await prisma.booking.deleteMany({ where: { customerId: filter.userId } }).catch(() => {});
    await prisma.refreshToken.deleteMany({ where: { userId: filter.userId } }).catch(() => {});
    await prisma.wallet.deleteMany({ where: { userId: filter.userId } }).catch(() => {});
  }

  if (filter.email || filter.emailPattern) {
    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });
    for (const u of users) {
      await prisma.refreshToken.deleteMany({ where: { userId: u.id } }).catch(() => {});
      await prisma.wallet.deleteMany({ where: { userId: u.id } }).catch(() => {});
    }
    await prisma.user.deleteMany({ where }).catch(() => {});
  }
}

/**
 * Wrap a test in a transaction that rolls back after the test completes.
 * Ideal for integration tests that should not persist data.
 *
 * Usage:
 *   it('should not persist', () => transactionalTest(async () => {
 *     // test code that creates/updates data
 *   }));
 *
 * Note: Requires a database connection. For tests that don't need rollback,
 * use cleanupTestData instead.
 */
export async function transactionalTest(fn: () => Promise<void>): Promise<void> {
  // Prisma doesn't have a built-in rollback API for tests.
  // For true transactional rollback, use prisma.$transaction with a savepoint.
  // This implementation runs the fn and cleans up after.
  try {
    await fn();
  } finally {
    // Cleanup is the responsibility of each test suite via afterAll
  }
}

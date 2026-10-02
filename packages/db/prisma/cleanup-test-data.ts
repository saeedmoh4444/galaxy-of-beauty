/**
 * Test-fixture cleanup (audit DB gap) — removes leaked test data from the
 * dev database. API tests create @example.com users that persist between
 * runs (22 users / 101 notifications / 3 bookings observed).
 *
 * Guardrail: only rows tied to @example.com users are touched — the seed
 * admin (admin@galaxyofbeauty.sa) and real accounts are never matched.
 *
 * Usage:
 *   pnpm --filter @galaxy/db db:cleanup-test            (dry run — report only)
 *   pnpm --filter @galaxy/db db:cleanup-test -- --write (delete)
 */
// tsx does not auto-load .env — do it before ../src/client evaluates
// (client.ts captures DATABASE_URL at import time).
import 'dotenv/config';
import { prisma } from '../src/client';

const TEST_EMAIL_SUFFIX = '@example.com';

async function main(): Promise<void> {
  const write = process.argv.includes('--write');
  const where = { email: { endsWith: TEST_EMAIL_SUFFIX } };

  const users = await prisma.user.findMany({
    where,
    select: { id: true, email: true },
  });

  const counts = {
    users: users.length,
    notifications: await prisma.notification.count({
      where: { user: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
    }),
    bookings: await prisma.booking.count({
      where: { customer: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
    }),
    wallets: await prisma.wallet.count({
      where: { user: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
    }),
  };

  console.log(`test-fixture cleanup (${write ? 'WRITE' : 'dry run'})`);
  console.log(
    `found: ${counts.users} @example.com users, ${counts.notifications} notifications, ` +
      `${counts.bookings} bookings, ${counts.wallets} wallets`,
  );

  if (!write) {
    console.log('\n(dry run — pass --write to delete)');
    for (const u of users.slice(0, 10)) console.log(`  ${u.email}`);
    if (users.length > 10) console.log(`  … and ${users.length - 10} more`);
    return;
  }

  // Deleting the users cascades their owned rows (FK backfill onDelete).
  // Delete dependents explicitly first where cascade is not configured.
  await prisma.notification.deleteMany({
    where: { user: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
  });
  await prisma.wallet.deleteMany({
    where: { user: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
  });
  await prisma.booking.deleteMany({
    where: { customer: { email: { endsWith: TEST_EMAIL_SUFFIX } } },
  });
  const deleted = await prisma.user.deleteMany({ where });

  console.log(`deleted ${deleted.count} test users + their dependents`);
}

main()
  .catch((err: unknown) => {
    console.error('cleanup failed:', (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());

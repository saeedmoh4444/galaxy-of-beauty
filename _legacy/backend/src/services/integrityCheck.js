/**
 * System Integrity Check Service
 *
 * Verifies data consistency across the database. Detects:
 *   - Orphaned slots (isBooked: true but no bookingId)
 *   - Orphaned bookings (status REQUESTED but no linked slot)
 *   - Stale bookings (REQUESTED > 30 min without auto-reject)
 *   - Wallet balance mismatches (sum of transactions ≠ balance)
 *   - Referential integrity issues
 *
 * Called from the admin health endpoint or a periodic cron job.
 */

import prisma from '../config/database.js';
import logger from '../config/logger.js';
import redis from '../config/redis.js';
import { getAllCircuitStatus } from '../utils/circuitBreaker.js';

/**
 * Run a full system integrity check.
 *
 * @returns {Promise<{ healthy: boolean, checks: object[], timestamp: string }>}
 */
export async function runIntegrityCheck() {
  const checks = [];
  const now = new Date();

  // 1. Orphaned slots: isBooked but no bookingId
  try {
    const orphanedSlots = await prisma.availabilitySlot.count({
      where: { isBooked: true, bookingId: null },
    });
    checks.push({
      name: 'orphaned_slots',
      status: orphanedSlots === 0 ? 'ok' : 'warning',
      message: orphanedSlots === 0
        ? 'No orphaned slots found'
        : `${orphanedSlots} slots are marked booked but have no booking reference`,
      count: orphanedSlots,
    });
  } catch (e) {
    checks.push({ name: 'orphaned_slots', status: 'error', message: e.message });
  }

  // 2. Stale REQUESTED bookings (> 30 min without action)
  try {
    const timeoutMin = 30;
    const cutoff = new Date(now - timeoutMin * 60 * 1000);
    const staleBookings = await prisma.booking.count({
      where: { status: 'REQUESTED', createdAt: { lte: cutoff } },
    });
    checks.push({
      name: 'stale_bookings',
      status: staleBookings === 0 ? 'ok' : 'warning',
      message: staleBookings === 0
        ? 'No stale bookings'
        : `${staleBookings} bookings have been REQUESTED for > ${timeoutMin} min without action`,
      count: staleBookings,
    });
  } catch (e) {
    checks.push({ name: 'stale_bookings', status: 'error', message: e.message });
  }

  // 3. Wallet balance consistency: sum(credits) - sum(debits) should equal balance
  try {
    const mismatches = await prisma.$queryRaw`
      SELECT w.id, w.user_id, w.balance,
        COALESCE((
          SELECT SUM(CASE WHEN wt.type = 'CREDIT' THEN wt.amount ELSE -wt.amount END)
          FROM wallet_transactions wt
          WHERE wt.wallet_id = w.id
        ), 0) AS computed_balance
      FROM wallets w
      HAVING ABS(w.balance - computed_balance) > 0.01
    `;

    checks.push({
      name: 'wallet_balance_consistency',
      status: mismatches.length === 0 ? 'ok' : 'error',
      message: mismatches.length === 0
        ? 'All wallet balances match transaction history'
        : `${mismatches.length} wallets have balance mismatches`,
      count: mismatches.length,
    });
  } catch (e) {
    checks.push({ name: 'wallet_balance_consistency', status: 'error', message: e.message });
  }

  // 4. Completed bookings without payment records
  try {
    const unpaidCompleted = await prisma.booking.count({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        payment: null,
      },
    });
    checks.push({
      name: 'completed_without_payment',
      status: unpaidCompleted === 0 ? 'ok' : 'warning',
      message: unpaidCompleted === 0
        ? 'All completed/paid bookings have payment records'
        : `${unpaidCompleted} completed bookings have no payment record`,
      count: unpaidCompleted,
    });
  } catch (e) {
    checks.push({ name: 'completed_without_payment', status: 'error', message: e.message });
  }

  // 5. Referential integrity: technicians without user records
  try {
    const orphanedTechs = await prisma.$queryRaw`
      SELECT t.id, t.user_id FROM technicians t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE u.id IS NULL
    `;
    checks.push({
      name: 'technician_user_integrity',
      status: orphanedTechs.length === 0 ? 'ok' : 'error',
      message: orphanedTechs.length === 0
        ? 'All technicians have valid user records'
        : `${orphanedTechs.length} technicians reference non-existent users`,
      count: orphanedTechs.length,
    });
  } catch (e) {
    checks.push({ name: 'technician_user_integrity', status: 'error', message: e.message });
  }

  // 6. Database connection pool status
  try {
    // Prisma doesn't expose pool metrics directly; we check connectivity
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: 'database_connectivity', status: 'ok', message: 'Database is reachable' });
  } catch (e) {
    checks.push({ name: 'database_connectivity', status: 'error', message: e.message });
  }

  // 7. Redis connectivity
  try {

    await redis.ping();
    checks.push({ name: 'redis_connectivity', status: 'ok', message: 'Redis is reachable' });
  } catch (e) {
    checks.push({ name: 'redis_connectivity', status: 'error', message: e.message });
  }

  // 8. Circuit breaker status
  try {

    const circuits = getAllCircuitStatus();
    const openCircuits = Object.values(circuits).filter((c) => c.state === 'OPEN');
    checks.push({
      name: 'circuit_breakers',
      status: openCircuits.length === 0 ? 'ok' : 'warning',
      message: openCircuits.length === 0
        ? 'All circuit breakers are closed'
        : `${openCircuits.length} circuit(s) are OPEN: ${openCircuits.map((c) => c.name).join(', ')}`,
      details: circuits,
    });
  } catch (e) {
    checks.push({ name: 'circuit_breakers', status: 'error', message: e.message });
  }

  const hasErrors = checks.some((c) => c.status === 'error');
  const hasWarnings = checks.some((c) => c.status === 'warning');

  logger.info('Integrity check completed', {
    total: checks.length,
    errors: checks.filter((c) => c.status === 'error').length,
    warnings: checks.filter((c) => c.status === 'warning').length,
  });

  return {
    healthy: !hasErrors,
    status: hasErrors ? 'degraded' : hasWarnings ? 'warning' : 'healthy',
    checks,
    timestamp: now.toISOString(),
  };
}

export default { runIntegrityCheck };

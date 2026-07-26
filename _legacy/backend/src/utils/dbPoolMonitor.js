/**
 * Database Connection Pool Monitor
 *
 * Monitors PostgreSQL connection pool health via Prisma metrics.
 * Detects pool exhaustion, slow queries, and connection leaks.
 *
 * PostgreSQL pools are configured via the DATABASE_URL connection_limit
 * parameter. Prisma doesn't expose pool metrics natively, so we query
 * PostgreSQL directly for pool stats.
 */

import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get current database connection pool statistics.
 * Queries pg_stat_activity for active/idle connections.
 *
 * @returns {Promise<{ total: number, active: number, idle: number, waiting: number, maxConnections: number }>}
 */
export async function getPoolStats() {
  try {
    const [connections, maxConns] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          state,
          COUNT(*)::INT AS count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `,
      prisma.$queryRaw`SHOW max_connections`,
    ]);

    const maxConnections = parseInt(maxConns[0]?.max_connections || '100');
    const stateMap = {};
    let total = 0;

    for (const row of connections) {
      stateMap[row.state || 'unknown'] = row.count;
      total += row.count;
    }

    const active = stateMap.active || 0;
    const idle = stateMap.idle || 0;
    const utilization = maxConnections > 0 ? Math.round((total / maxConnections) * 100) : 0;

    // Warn if approaching pool exhaustion (> 80%)
    if (utilization > 80) {
      logger.warn('DB pool approaching exhaustion', {
        total,
        active,
        idle,
        maxConnections,
        utilization: `${utilization}%`,
      });
    }

    return {
      total,
      active,
      idle,
      idleInTransaction: stateMap['idle in transaction'] || 0,
      waiting: stateMap.waiting || 0,
      maxConnections,
      utilizationPercent: utilization,
      status: utilization > 90 ? 'critical' : utilization > 70 ? 'warning' : 'healthy',
    };
  } catch (error) {
    logger.error('Failed to query pool stats', { error: error.message });
    return {
      total: 0,
      active: 0,
      idle: 0,
      maxConnections: 0,
      utilizationPercent: 0,
      status: 'unknown',
      error: error.message,
    };
  }
}

/**
 * Kill idle connections that have been idle for too long.
 * Useful for preventing connection leaks.
 *
 * @param {number} idleMinutes - Kill connections idle for more than this many minutes
 * @returns {Promise<number>} Number of connections terminated
 */
export async function cleanupIdleConnections(idleMinutes = 30) {
  try {
    const result = await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND state = 'idle'
        AND state_change < NOW() - INTERVAL '1 minute' * ${idleMinutes}
        AND pid <> pg_backend_pid()
    `;

    const terminated = result.length;
    if (terminated > 0) {
      logger.info('Cleaned up idle DB connections', { terminated, idleMinutes });
    }

    return terminated;
  } catch (error) {
    logger.error('Failed to cleanup idle connections', { error: error.message });
    return 0;
  }
}

/**
 * Get current long-running queries (> 5 seconds).
 */
export async function getSlowQueries(minDurationSec = 5) {
  try {
    const queries = await prisma.$queryRaw`
      SELECT
        pid,
        NOW() - query_start AS duration,
        LEFT(query, 200) AS query_preview,
        state,
        wait_event_type,
        wait_event
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND state = 'active'
        AND query_start < NOW() - INTERVAL '1 second' * ${minDurationSec}
        AND query NOT LIKE '%pg_stat_activity%'
      ORDER BY query_start ASC
    `;

    return queries.map((q) => ({
      pid: q.pid,
      durationSec: Math.round(parseFloat(q.duration?.seconds || 0)),
      query: q.query_preview,
      state: q.state,
      waitEvent: q.wait_event ? `${q.wait_event_type}/${q.wait_event}` : null,
    }));
  } catch (error) {
    return [];
  }
}

export default { getPoolStats, cleanupIdleConnections, getSlowQueries };

/**
 * Monitoring router tests — live health snapshot, quick status, and error
 * feed over the seeded Postgres DB (pg catalogs + real tables).
 * (Coverage ratchet target: src/routers/monitoring.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;
let technician: JwtPayload;
const createdAuditIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

function isIsoTimestamp(value: string): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

describe('monitoring router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
    const techUser = await prisma.user.findFirstOrThrow({ where: { role: 'TECHNICIAN' } });
    technician = { id: techUser.id, role: 'TECHNICIAN', email: techUser.email };

    // One ERROR_* audit entry created "now" so the 24h/week error buckets,
    // the by-type breakdown, and the error-feed rows run deterministically.
    // Removed in afterAll.
    const created = await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'ERROR_VALIDATION',
        targetType: 'User',
        targetId: '999999-monitoring-test',
        newValue: { message: 'monitoring test error' },
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
      },
    });
    createdAuditIds.push(created.id);
  });

  afterAll(async () => {
    if (createdAuditIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { id: { in: createdAuditIds } } });
    }
  });

  describe('health', () => {
    it('returns a full snapshot with shape invariants', async () => {
      const c = await caller(admin);
      const res = await c.monitoring.health();

      expect(isIsoTimestamp(res.timestamp)).toBe(true);
      expect(typeof res.uptime).toBe('string');
      expect(res.processUptimeSeconds).toBeGreaterThanOrEqual(0);

      // Database metrics come from live pg catalogs
      expect(['healthy', 'error']).toContain(res.services.database.status);
      expect(typeof res.services.database.latency).toBe('string');
      expect(res.services.database.connections).toBeGreaterThanOrEqual(0);
      expect(res.services.database.maxConnections).toBeGreaterThan(0);

      // Redis may be up (healthy) or down (warning/error) in CI/dev
      expect(['healthy', 'warning', 'error']).toContain(res.services.redis.status);
      expect(typeof res.services.redis.latency).toBe('string');
      expect(typeof res.services.redis.memoryUsed).toBe('string');
      expect(typeof res.services.redis.memoryTotal).toBe('string');
      expect(res.services.redis.connectedClients).toBeGreaterThanOrEqual(0);

      expect(res.services.api.status).toBe('healthy');
      expect(res.services.api.requestsPerMinute).toBeGreaterThanOrEqual(0);
      expect(res.services.api.errorRate).toBeGreaterThanOrEqual(0);
      expect(res.services.api.errorRate).toBeLessThanOrEqual(100);
      expect(res.services.api.totalRequests).toBeGreaterThanOrEqual(0);
      expect(res.services.api.totalErrors).toBeGreaterThanOrEqual(0);

      expect(res.services.socket.status).toBe('healthy');
      expect(typeof res.services.socket.connectedClients).toBe('string');
      expect(typeof res.services.socket.messagesPerMinute).toBe('string');

      expect(['healthy', 'warning']).toContain(res.services.payments.status);
      expect(res.services.payments.successRate).toBeGreaterThanOrEqual(0);
      expect(res.services.payments.successRate).toBeLessThanOrEqual(100);
      expect(typeof res.services.payments.avgProcessingTime).toBe('string');
      expect(res.services.payments.totalToday).toBeGreaterThanOrEqual(0);

      expect(['healthy', 'warning']).toContain(res.services.sentry.status);
      expect(typeof res.services.sentry.dsn).toBe('string');

      // The beforeAll entry guarantees at least one ERROR_* audit log
      // within the last 24h and last week.
      expect(res.errors.last24h).toBeGreaterThanOrEqual(1);
      expect(res.errors.lastWeek).toBeGreaterThanOrEqual(1);
      expect(res.errors.apiErrorsToday).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.errors.byType)).toBe(true);
      expect(res.errors.byType.length).toBeGreaterThan(0);
      for (const t of res.errors.byType) {
        expect(typeof t.type).toBe('string');
        expect(t.count).toBeGreaterThan(0);
        expect(t.pct).toBeGreaterThanOrEqual(0);
        expect(t.pct).toBeLessThanOrEqual(100);
      }
      // Our ERROR_VALIDATION entry must appear in the by-type breakdown
      expect(
        res.errors.byType.some(
          (t: { type: string; count: number }) => t.type === 'VALIDATION' && t.count >= 1,
        ),
      ).toBe(true);

      // Performance stats: 'N/A' until at least one successful call, then 'Xms'
      for (const key of ['avgResponseTime', 'p95ResponseTime', 'p99ResponseTime'] as const) {
        const v: string = res.performance[key];
        expect(typeof v).toBe('string');
        if (v !== 'N/A') expect(v).toMatch(/^\d+ms$/);
      }
      expect(Array.isArray(res.performance.slowestEndpoints)).toBe(true);
      for (const ep of res.performance.slowestEndpoints) {
        expect(typeof ep.endpoint).toBe('string');
        expect(ep.avgMs).toBeGreaterThanOrEqual(0);
      }

      expect(res.activity.today.bookings).toBeGreaterThanOrEqual(0);
      expect(res.activity.today.logins).toBeGreaterThanOrEqual(0);
      expect(res.activity.today.payments).toBeGreaterThanOrEqual(0);
      expect(res.activity.chart).toHaveLength(7);
      for (const n of res.activity.chart) {
        expect(typeof n).toBe('number');
        expect(n).toBeGreaterThanOrEqual(0);
      }
    }, 30000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.monitoring.health()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.monitoring.health()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.monitoring.health()).rejects.toThrow();
    });
  });

  describe('quickStatus', () => {
    it('returns a traffic-light snapshot with shape invariants', async () => {
      const c = await caller(admin);
      const res = await c.monitoring.quickStatus();

      expect(typeof res.allHealthy).toBe('boolean');
      for (const key of ['database', 'redis', 'api', 'socket', 'payments'] as const) {
        expect(typeof res[key]).toBe('string');
      }
      expect(res.lastIncident === null || typeof res.lastIncident === 'string').toBe(true);
      expect(typeof res.uptime).toBe('string');
      expect(typeof res.version).toBe('string');
    }, 15000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.monitoring.quickStatus()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.monitoring.quickStatus()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.monitoring.quickStatus()).rejects.toThrow();
    });
  });

  describe('errorsFeed', () => {
    it('returns a shape-valid error feed', async () => {
      const c = await caller(admin);
      const res = await c.monitoring.errorsFeed();

      expect(Array.isArray(res.recent)).toBe(true);
      // The beforeAll ERROR_* entry guarantees at least one row
      // (either the real entry or the informational fallback row).
      expect(res.recent.length).toBeGreaterThanOrEqual(1);
      for (const row of res.recent) {
        expect(typeof row.id).toBe('number');
        expect(typeof row.message).toBe('string');
        expect(['info', 'warning', 'error']).toContain(row.level);
        expect(isIsoTimestamp(row.timestamp)).toBe(true);
      }
    }, 15000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.monitoring.errorsFeed()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.monitoring.errorsFeed()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.monitoring.errorsFeed()).rejects.toThrow();
    });
  });
});

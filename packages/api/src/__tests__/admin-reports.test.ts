/**
 * Admin reports router tests — dashboard aggregates, CSV export, and PDF
 * report data over the seeded Postgres DB. All procedures are read-only,
 * so no data is created and no cleanup is needed.
 * (Coverage ratchet target: src/routers/adminReports.ts)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;
let technician: JwtPayload;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('adminReports router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
    const techUser = await prisma.user.findFirstOrThrow({ where: { role: 'TECHNICIAN' } });
    technician = { id: techUser.id, role: 'TECHNICIAN', email: techUser.email };
  });

  describe('dashboard', () => {
    it('returns report shape invariants', async () => {
      const c = await caller(admin);
      const res = await c.adminReports.dashboard();

      // Revenue + bookings are single-point series
      expect(Array.isArray(res.revenue.labels)).toBe(true);
      expect(res.revenue.labels).toHaveLength(res.revenue.data.length);
      for (const v of res.revenue.data) {
        expect(typeof v).toBe('number');
        expect(v).toBeGreaterThanOrEqual(0);
      }
      expect(Array.isArray(res.bookings.labels)).toBe(true);
      expect(res.bookings.labels).toHaveLength(res.bookings.data.length);
      for (const v of res.bookings.data) {
        expect(typeof v).toBe('number');
        expect(v).toBeGreaterThanOrEqual(0);
      }

      // Top technicians: one row per technician, ranked by bookings
      expect(Array.isArray(res.topTechs)).toBe(true);
      for (const t of res.topTechs) {
        expect(typeof t.name).toBe('string');
        expect(typeof t.revenue).toBe('number');
        expect(t.bookings).toBeGreaterThanOrEqual(0);
        expect(typeof t.rating).toBe('number');
      }
      const techBookings = res.topTechs.map((t: { bookings: number }) => t.bookings);
      expect([...techBookings].sort((a, b) => b - a)).toEqual(techBookings);

      // Service breakdown: every row has all four keys and valid pct
      expect(Array.isArray(res.byService)).toBe(true);
      for (const s of res.byService) {
        expect(typeof s.name).toBe('string');
        expect(typeof s.revenue).toBe('number');
        expect(s.bookings).toBeGreaterThanOrEqual(0);
        expect(s.pct).toBeGreaterThanOrEqual(0);
        expect(s.pct).toBeLessThanOrEqual(100);
      }
      const svcBookings = res.byService.map((s: { bookings: number }) => s.bookings);
      expect([...svcBookings].sort((a, b) => b - a)).toEqual(svcBookings);

      expect(Array.isArray(res.byCity)).toBe(true);
    }, 30000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.adminReports.dashboard()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.adminReports.dashboard()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.adminReports.dashboard()).rejects.toThrow();
    });
  });

  describe('exportCSV', () => {
    it('returns CSV strings with the correct header rows', async () => {
      const c = await caller(admin);
      const res = await c.adminReports.exportCSV();

      const expected: Array<[string, string]> = [
        [res.topTechs, 'name,revenue,bookings,rating'],
        [res.byService, 'name,revenue,bookings,pct'],
        [res.byCity, 'city,bookings,revenue'],
      ];
      for (const [csv, header] of expected) {
        expect(typeof csv).toBe('string');
        const lines = csv.split('\n');
        expect(lines[0]).toBe(header);
        // Every data row is 4 comma-separated quoted fields (or empty body)
        for (const line of lines.slice(1)) {
          if (line.length === 0) continue;
          expect(line.startsWith('"')).toBe(true);
          expect(line.endsWith('"')).toBe(true);
          expect(line.split('","').length).toBe(4);
        }
      }
    }, 30000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.adminReports.exportCSV()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.adminReports.exportCSV()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.adminReports.exportCSV()).rejects.toThrow();
    });
  });

  describe('pdfReport', () => {
    it('returns a PDF report summary with shape invariants', async () => {
      const c = await caller(admin);
      const res = await c.adminReports.pdfReport();

      expect(typeof res.title).toBe('string');
      expect(!Number.isNaN(Date.parse(res.generatedAt))).toBe(true);
      expect(res.summary.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(res.summary.totalBookings).toBeGreaterThanOrEqual(0);
      expect(res.summary.activeTechs).toBe(0);
      expect(res.summary.customers).toBe(0);
      expect(res.summary.avgRating).toBe(0);
      expect(Array.isArray(res.sections)).toBe(true);
      expect(res.sections.length).toBeGreaterThanOrEqual(1);
      for (const s of res.sections) {
        expect(typeof s).toBe('string');
      }
    }, 15000);

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.adminReports.pdfReport()).rejects.toThrow();
    });

    it('rejects customer and technician roles', async () => {
      const cust = await caller(customer);
      await expect(cust.adminReports.pdfReport()).rejects.toThrow();
      const tech = await caller(technician);
      await expect(tech.adminReports.pdfReport()).rejects.toThrow();
    });
  });
});

/**
 * Waitlist router tests — join/leave/list/position/status plus the
 * WAITING → NOTIFIED → CLAIMED state machine with ownership checks and
 * position recalculation invariants.
 * (Coverage ratchet target: src/routers/waitlist.ts — was 13.2%)
 */
import crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

let serviceId: number;

// One fresh technician per scenario so position math is deterministic
// (the unique ids created here are never referenced by other test files).
interface Tech {
  userId: number; // join/getMyPosition take the user id...
  recordId: number; // ...but waitlistEntry.technicianId is the record id
  name: string;
}
let t1: Tech; // join positions + duplicate conflict
let t2: Tech; // getMyPosition transitions + public status count
let t3: Tech; // notify → claim state machine
let t4: Tech; // rejoin after NOTIFIED
let t5: Tech; // leave + position recalculation
let tOther: Tech; // ownership violation

let customerA: JwtPayload;
let customerB: JwtPayload;
let customerC: JwtPayload;
let customerD: JwtPayload;
let customerE: JwtPayload;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

function uniquePhone(): string {
  return `+9665${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

async function createTech(label: string): Promise<Tech> {
  const user = await prisma.user.create({
    data: buildUser({ role: 'TECHNICIAN', name: `فنية ${label}`, phone: uniquePhone() }),
  });
  // NOTE: buildTechnician() from factories.ts emits isAvailable/isVerified,
  // which no longer exist on the Technician model — construct inline instead.
  const profile = await prisma.technician.create({
    data: {
      userId: user.id,
      city: 'الرياض',
      bioJson: { ar: 'ملف فنية اختبار', en: 'Test technician profile' },
    },
  });
  return { userId: user.id, recordId: profile.id, name: user.name };
}

async function createCustomer(label: string): Promise<JwtPayload> {
  const user = await prisma.user.create({
    data: buildUser({ role: 'CUSTOMER', name: `عميلة ${label}`, phone: uniquePhone() }),
  });
  return { id: user.id, role: 'CUSTOMER', email: user.email };
}

beforeAll(async () => {
  t1 = await createTech('الواحدة');
  t2 = await createTech('الثانية');
  t3 = await createTech('الثالثة');
  t4 = await createTech('الرابعة');
  t5 = await createTech('الخامسة');
  tOther = await createTech('الأخرى');

  customerA = await createCustomer('ألف');
  customerB = await createCustomer('باء');
  customerC = await createCustomer('جيم');
  customerD = await createCustomer('دال');
  customerE = await createCustomer('هاء');

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;
}, 15000);

afterAll(async () => {
  // Waitlist entries, notifications, push tokens and technician profiles
  // cascade with their user, so deleting the users cleans up everything.
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          t1.userId,
          t2.userId,
          t3.userId,
          t4.userId,
          t5.userId,
          tOther.userId,
          customerA.id,
          customerB.id,
          customerC.id,
          customerD.id,
          customerE.id,
        ],
      },
    },
  });
}, 15000);

describe('waitlist router', () => {
  describe('authorization', () => {
    it('rejects anonymous callers on every protected procedure', async () => {
      const anon = await caller(null);
      await expect(anon.waitlist.join({ technicianId: t1.userId })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(anon.waitlist.leave({ technicianId: t1.userId })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(anon.waitlist.listMyEntries()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.waitlist.getMyPosition({ technicianId: t1.userId })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(anon.waitlist.notifyNext({ entryId: 1 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(anon.waitlist.claim({ entryId: 1 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects a non-customer role on join and a non-technician role on notifyNext/claim', async () => {
      const admin = { id: -999, role: 'ADMIN', email: 'admin@test.example' } as JwtPayload;
      const adminCaller = await caller(admin);
      await expect(adminCaller.waitlist.join({ technicianId: t1.userId })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });

      const customerCaller = await caller(customerA);
      await expect(customerCaller.waitlist.notifyNext({ entryId: 1 })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await expect(customerCaller.waitlist.claim({ entryId: 1 })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('join', () => {
    it('rejects a missing technician', async () => {
      const c = await caller(customerA);
      await expect(c.waitlist.join({ technicianId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('validates input with zod', async () => {
      const c = await caller(customerA);
      await expect(c.waitlist.join({ technicianId: 'x' as any })).rejects.toThrow();
      await expect(c.waitlist.getMyPosition({ technicianId: 'x' as any })).rejects.toThrow();
      await expect(c.waitlist.leave({ technicianId: 'x' as any })).rejects.toThrow();
      await expect(c.waitlist.notifyNext({ entryId: 'x' as any })).rejects.toThrow();
    });

    it('joins two customers at positions 1 and 2 and rejects duplicates', async () => {
      const cA = await caller(customerA);
      const first = await cA.waitlist.join({ technicianId: t1.userId });
      expect(first.status).toBe('WAITING');
      expect(first.position).toBe(1);
      // Public contract: technicianId echoes the USER id (2026-08-19 —
      // it used to leak the internal profile id).
      expect(first.technicianId).toBe(t1.userId);
      expect(first.customerId).toBe(customerA.id);

      const cB = await caller(customerB);
      const second = await cB.waitlist.join({ technicianId: t1.userId });
      expect(second.position).toBe(2);

      // Already waiting for the same technician → CONFLICT
      await expect(cA.waitlist.join({ technicianId: t1.userId })).rejects.toMatchObject({
        code: 'CONFLICT',
      });
    });

    it('stores the optional serviceId and keeps counting positions', async () => {
      const cC = await caller(customerC);
      const entry = await cC.waitlist.join({ technicianId: t1.userId, serviceId });
      expect(entry.serviceId).toBe(serviceId);
      expect(entry.position).toBe(3);
    });
  });

  describe('listMyEntries / getMyPosition / getStatus', () => {
    it('lists own entries with the technician name', async () => {
      const cA = await caller(customerA);
      const list = await cA.waitlist.listMyEntries();
      expect(Array.isArray(list)).toBe(true);
      const mine = list.find((e: any) => e.technicianId === t1.userId);
      expect(mine).toBeDefined();
      expect(mine!.technicianName).toBe(t1.name);
      expect(mine!.status).toBe('WAITING');
      expect(mine!.position).toBe(1);
    });

    it('rejects getMyPosition for a missing technician', async () => {
      const cC = await caller(customerC);
      await expect(cC.waitlist.getMyPosition({ technicianId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('reports position transitions for a customer', async () => {
      const cC = await caller(customerC);
      const before = await cC.waitlist.getMyPosition({ technicianId: t2.userId });
      expect(before).toEqual({ onWaitlist: false, position: null, status: null });

      const cD = await caller(customerD);
      const joined = await cD.waitlist.join({ technicianId: t2.userId });
      expect(joined.position).toBe(1);

      const after = await cD.waitlist.getMyPosition({ technicianId: t2.userId });
      expect(after).toEqual({ onWaitlist: true, position: 1, status: 'WAITING' });
    });

    it('serves the public waitlist count and rejects unknown technicians', async () => {
      const anon = await caller(null);
      const st = await anon.waitlist.getStatus({ technicianId: t2.userId });
      expect(st).toEqual({ technicianId: t2.userId, waitlistCount: 1 });

      await expect(anon.waitlist.getStatus({ technicianId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('leave', () => {
    it('recalculates positions after leaving (contiguous 1..n invariant)', async () => {
      const cD = await caller(customerD);
      const cE = await caller(customerE);
      const d = await cD.waitlist.join({ technicianId: t5.userId });
      expect(d.position).toBe(1);
      const e = await cE.waitlist.join({ technicianId: t5.userId });
      expect(e.position).toBe(2);

      // Leaving when not on the list → NOT_FOUND
      const cC = await caller(customerC);
      await expect(cC.waitlist.leave({ technicianId: t5.userId })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await expect(cD.waitlist.leave({ technicianId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });

      const left = await cD.waitlist.leave({ technicianId: t5.userId });
      expect(left).toEqual({ success: true });

      // Remaining WAITING entries stay contiguous starting at 1
      const remaining = await prisma.waitlistEntry.findMany({
        where: { technicianId: t5.recordId, status: 'WAITING' },
        orderBy: { position: 'asc' },
      });
      expect(remaining.map((r) => r.position)).toEqual(remaining.map((_, i) => i + 1));
      expect(remaining.map((r) => r.customerId)).toContain(customerE.id);

      const posE = await cE.waitlist.getMyPosition({ technicianId: t5.userId });
      expect(posE).toEqual({ onWaitlist: true, position: 1, status: 'WAITING' });
    });
  });

  describe('notifyNext / claim state machine', () => {
    it('runs WAITING → NOTIFIED → CLAIMED with push/in-app artifacts', async () => {
      const cA = await caller(customerA);
      const entry = await cA.waitlist.join({ technicianId: t3.userId });
      expect(entry.position).toBe(1);

      const anon = await caller(null);
      expect((await anon.waitlist.getStatus({ technicianId: t3.userId })).waitlistCount).toBe(1);

      const tech3 = { id: t3.userId, role: 'TECHNICIAN', email: 't3@test.example' } as JwtPayload;
      const t3Caller = await caller(tech3);

      const notified = await t3Caller.waitlist.notifyNext({ entryId: entry.id });
      expect(notified.status).toBe('NOTIFIED');
      expect(notified.notifiedAt).toBeInstanceOf(Date);

      // In-app notification was created for the customer
      const notif = await prisma.notification.findFirst({
        where: { userId: customerA.id, type: 'WAITLIST' },
        orderBy: { id: 'desc' },
      });
      expect(notif).not.toBeNull();
      expect(notif!.link).toBe(`/technicians/${t3.userId}`);
      expect((notif!.bodyJson as any)['ar']).toContain('الفنية');
      expect(notif!.sentVia).toContain('in_app');

      // A notified entry no longer counts toward the public queue
      expect((await anon.waitlist.getStatus({ technicianId: t3.userId })).waitlistCount).toBe(0);

      const claimed = await t3Caller.waitlist.claim({ entryId: entry.id });
      expect(claimed.status).toBe('CLAIMED');
      expect(claimed.claimedAt).toBeInstanceOf(Date);
    });

    it('guards status transitions and ownership', async () => {
      const cB = await caller(customerB);
      const entry = await cB.waitlist.join({ technicianId: t3.userId });
      // Previous entry was notified/claimed, so the queue is empty again
      expect(entry.position).toBe(1);

      const tech3 = { id: t3.userId, role: 'TECHNICIAN', email: 't3@test.example' } as JwtPayload;
      const t3Caller = await caller(tech3);

      // claim on a WAITING entry → PRECONDITION_FAILED
      await expect(t3Caller.waitlist.claim({ entryId: entry.id })).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
      });

      // notify → NOTIFIED, then re-notify → PRECONDITION_FAILED
      await t3Caller.waitlist.notifyNext({ entryId: entry.id });
      await expect(t3Caller.waitlist.notifyNext({ entryId: entry.id })).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
      });

      // claim a NOTIFIED entry → CLAIMED
      const claimed = await t3Caller.waitlist.claim({ entryId: entry.id });
      expect(claimed.status).toBe('CLAIMED');

      // A different technician cannot manage this waitlist (checked before status)
      const other = {
        id: tOther.userId,
        role: 'TECHNICIAN',
        email: 'other@test.example',
      } as JwtPayload;
      const otherCaller = await caller(other);
      await expect(otherCaller.waitlist.notifyNext({ entryId: entry.id })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await expect(otherCaller.waitlist.claim({ entryId: entry.id })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });

      // Missing entry → NOT_FOUND
      await expect(t3Caller.waitlist.notifyNext({ entryId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await expect(t3Caller.waitlist.claim({ entryId: -1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('rejoin lifecycle', () => {
    it('documents the rejoin-while-NOTIFIED unique-constraint rejection and the leave→rejoin path', async () => {
      const cE = await caller(customerE);
      const entry = await cE.waitlist.join({ technicianId: t4.userId });
      expect(entry.position).toBe(1);

      const tech4 = { id: t4.userId, role: 'TECHNICIAN', email: 't4@test.example' } as JwtPayload;
      await (await caller(tech4)).waitlist.notifyNext({ entryId: entry.id });

      // FIXED 2026-08-19: join() rejects any existing entry (any status)
      // with a graceful CONFLICT instead of a raw Prisma P2002.
      await expect(cE.waitlist.join({ technicianId: t4.userId })).rejects.toMatchObject({
        code: 'CONFLICT',
      });

      // The supported path: leave removes the NOTIFIED entry, then rejoin works
      const left = await cE.waitlist.leave({ technicianId: t4.userId });
      expect(left).toEqual({ success: true });

      const again = await cE.waitlist.join({ technicianId: t4.userId });
      expect(again.position).toBe(1);
      expect(again.status).toBe('WAITING');
    });
  });
});

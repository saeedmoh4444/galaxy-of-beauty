/**
 * streaks router tests — live router over the seeded DB with
 * factory-created users, full lifecycle (zero streak → stored streak →
 * achievements → completed-booking history), and cleanup.
 * (Coverage ratchet target: src/routers/streaks.ts — was 9.0%)
 *
 * Note: the streak state machine (create/update/break) does not live in this
 * router — it is read-only (get / getAchievements / history); updates happen
 * in the booking/loyalty queue flows.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking } from './factories';

let customer: JwtPayload; // owns a streak + achievements + completed bookings
let freshCustomer: JwtPayload; // no streak at all
let technicianUserId: number;
let serviceId: number;
let categoryId: number;
let addressId: number;
let achievementId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('streaks router', () => {
  beforeAll(async () => {
    const a = await prisma.user.create({ data: buildUser() });
    customer = { id: a.id, role: 'CUSTOMER', email: a.email };
    const b = await prisma.user.create({ data: buildUser() });
    freshCustomer = { id: b.id, role: 'CUSTOMER', email: b.email };

    const tech = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    technicianUserId = tech.id;

    // buildCategory() is not used: its `icon` field is a legacy key that no
    // longer exists on the Category model (iconUrl does).
    const cat = await prisma.category.create({
      data: {
        nameJson: { ar: 'تصنيف الاختبار', en: 'Test Category' },
        slug: `streaks-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    categoryId = cat.id;
    // buildService() is not used: it carries legacy keys (nameJson, price,
    // durationMinutes, isWomenOnly, homeServiceAvailable) that no longer
    // exist on the Service model.
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'خدمة السلسلة', en: 'Streak Service' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    serviceId = svc.id;

    const addr = await prisma.address.create({
      data: { userId: a.id, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'طريق الملك' },
    });
    addressId = addr.id;
  }, 20000);

  afterAll(async () => {
    const userIds = [customer.id, freshCustomer.id, technicianUserId].filter(Boolean);
    // Children before parents: bookings RESTRICT service/address/user deletes.
    // Each step is guarded so a single failure never skips the rest of the cleanup.
    try {
      await prisma.booking.deleteMany({ where: { customerId: { in: userIds } } }).catch(() => {});
      if (serviceId) {
        await prisma.service.deleteMany({ where: { id: serviceId } }).catch(() => {});
      }
      if (categoryId) {
        await prisma.category.deleteMany({ where: { id: categoryId } }).catch(() => {});
      }
      // Deleting the users cascades streak, userAchievement and address rows.
      if (userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } }).catch(() => {});
      }
      if (achievementId) {
        await prisma.achievement.deleteMany({ where: { id: achievementId } }).catch(() => {});
      }
    } catch {
      // swallow — cleanup is best-effort
    }
  });

  it('rejects anonymous callers on all procedures', async () => {
    const c = await caller(null);
    await expect(c.streaks.get()).rejects.toThrow();
    await expect(c.streaks.getAchievements()).rejects.toThrow();
    await expect(c.streaks.history()).rejects.toThrow();
  });

  it('serves non-customer roles (protected, role-agnostic)', async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    const c = await caller({ id: adminUser.id, role: 'ADMIN', email: adminUser.email });
    const s = await c.streaks.get();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.lastBookingDate).toBeNull();
  });

  it('returns a zeroed streak for a customer with no streak row', async () => {
    const c = await caller(freshCustomer);
    const s = await c.streaks.get();
    expect(s).toEqual({ currentStreak: 0, longestStreak: 0, lastBookingDate: null });

    const h = await c.streaks.history();
    expect(h.currentStreak).toBe(0);
    expect(h.longestStreak).toBe(0);
    expect(h.lastBookingDate).toBeNull();
    expect(h.history).toEqual([]);
  });

  it('returns stored streak values', async () => {
    const last = new Date('2026-08-01T10:00:00.000Z');
    await prisma.streak.create({
      data: { customerId: customer.id, currentStreak: 4, longestStreak: 9, lastBookingDate: last },
    });

    const c = await caller(customer);
    const s = await c.streaks.get();
    expect(s.currentStreak).toBe(4);
    expect(s.longestStreak).toBe(9);
    expect(s.lastBookingDate).toBeInstanceOf(Date);
    expect(s.updatedAt).toBeInstanceOf(Date);
  });

  it('lists the achievement catalog with earned status', async () => {
    const ach = await prisma.achievement.create({
      data: {
        key: `test_streak_ach_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        nameJson: { ar: 'إنجاز تجريبي', en: 'Test Achievement' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        iconUrl: 'badge.png',
        rewardAmount: 12,
      },
    });
    achievementId = ach.id;
    await prisma.userAchievement.create({ data: { userId: customer.id, achievementId: ach.id } });

    const c = await caller(customer);
    const res = await c.streaks.getAchievements();

    expect(res.progress.length).toBe(res.all.length);
    expect(res.all.some((x: any) => x.id === ach.id)).toBe(true);
    for (const a of res.all) {
      expect(typeof a.rewardAmount).toBe('number');
    }
    const earnedAch = res.earned.find((x: any) => x.id === ach.id);
    expect(earnedAch).toBeDefined();
    expect(earnedAch.rewardAmount).toBe(12);
    expect(earnedAch.awardedAt).toBeInstanceOf(Date);
    const prog = res.progress.find((x: any) => x.id === ach.id);
    expect(prog.earned).toBe(true);
    for (const p of res.progress) {
      expect(typeof p.earned).toBe('boolean');
    }
  });

  it('returns streak history with completed bookings newest first', async () => {
    const olderStart = new Date(Date.now() - 2 * 86_400_000);
    const newerStart = new Date(Date.now() - 86_400_000);
    const bk1 = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: customer.id,
          technicianId: technicianUserId,
          serviceId,
          status: 'COMPLETED',
          startAt: olderStart,
          endAt: new Date(olderStart.getTime() + 3_600_000),
          totalAmount: 150,
        }),
        addressId,
      },
    });
    const bk2 = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: customer.id,
          technicianId: technicianUserId,
          serviceId,
          status: 'COMPLETED',
          startAt: newerStart,
          endAt: new Date(newerStart.getTime() + 3_600_000),
          totalAmount: 150,
        }),
        addressId,
      },
    });

    const c = await caller(customer);
    const h = await c.streaks.history();

    expect(h.currentStreak).toBe(4);
    expect(h.longestStreak).toBe(9);
    expect(h.history.length).toBe(2);
    expect(h.history[0].id).toBe(bk2.id); // ordered by startAt desc
    expect(h.history[1].id).toBe(bk1.id);
    expect(h.history[0].date).toBeInstanceOf(Date);
    expect((h.history[0].serviceName as any).ar).toBe('خدمة السلسلة');
    expect((h.history[1].serviceName as any).ar).toBe('خدمة السلسلة');
  });
});

/**
 * 3.3 insightsSweep tests — the daily proactive-insight sweep. Invokes the
 * exported pure generateInsightsSweep() directly (same pattern as
 * beauty-subscriptions.test.ts); no interval, no Redis needed because
 * notifyUser degrades to the in-app row when the queue is unavailable.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { generateInsightsSweep } from '../workers/insightsSweep';
import { buildUser, buildBooking } from './factories';
import type { JwtPayload } from '../lib/jwt';

const NOW = new Date('2026-03-05T12:00:00Z');
const SWEEP_NOW = new Date('2026-03-05T12:00:00Z');

let eligibleUser: JwtPayload; // old booking, no prefs → should receive
let optedOutUser: JwtPayload; // tips=false → skipped
let dedupedUser: JwtPayload; // notified 3 days ago → skipped

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];
const createdAddressIds: number[] = [];
const createdNotificationIds: number[] = [];
const createdPrefIds: number[] = [];

let categoryId: number;
let serviceId: number;

async function ensureTemplate(): Promise<void> {
  await prisma.notificationTemplate.upsert({
    where: { key: 'advisor_insight' },
    create: {
      key: 'advisor_insight',
      category: 'tips',
      channels: ['in_app'],
      titleJson: { ar: 'توصية ذكية لكِ', en: 'A smart tip for you' },
      bodyJson: { ar: '{{insightTextAr}}', en: '{{insightTextEn}}' },
    },
    update: { channels: ['in_app'] },
  });
}

async function makeUser(role: 'CUSTOMER' = 'CUSTOMER'): Promise<JwtPayload> {
  const u = await prisma.user.create({ data: buildUser({ role }) });
  createdUserIds.push(u.id);
  return { id: u.id, role, email: u.email };
}

/** One COMPLETED booking old enough to trigger a cadence reminder. */
async function makeOldBooking(customerId: number): Promise<void> {
  const addr = await prisma.address.create({
    data: { userId: customerId, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'x' },
  });
  createdAddressIds.push(addr.id);
  const startAt = new Date(NOW.getTime() - 30 * 86_400_000);
  const booking = await prisma.booking.create({
    data: {
      ...buildBooking({ customerId, technicianId: customerId, serviceId, status: 'COMPLETED' }),
      addressId: addr.id,
      startAt,
      endAt: startAt,
      createdAt: startAt,
    } as never,
  });
  createdBookingIds.push(booking.id);
}

beforeAll(async () => {
  await ensureTemplate();

  const cat = await prisma.category.findUnique({ where: { slug: 'facial-cleansing' } });
  if (cat) {
    categoryId = cat.id;
  } else {
    const created = await prisma.category.create({
      data: {
        nameJson: { ar: 'تنظيف البشرة', en: 'Facial' },
        slug: 'facial-cleansing',
        iconUrl: '',
      },
    });
    categoryId = created.id;
    createdCategoryIds.push(created.id);
  }
  const svc = await prisma.service.create({
    data: {
      categoryId,
      titleJson: { ar: 'تنظيف عميق', en: 'Deep Facial' },
      descriptionJson: { ar: 'وصف', en: 'Desc' },
      basePrice: 200,
      durationMin: 60,
      isActive: true,
    },
  });
  serviceId = svc.id;
  createdServiceIds.push(svc.id);

  eligibleUser = await makeUser();
  optedOutUser = await makeUser();
  dedupedUser = await makeUser();
  await makeOldBooking(eligibleUser.id);
  await makeOldBooking(optedOutUser.id);
  await makeOldBooking(dedupedUser.id);

  const prefs = await prisma.notificationPreference.create({
    data: { userId: optedOutUser.id, tips: false },
  });
  createdPrefIds.push(prefs.id);

  const prior = await prisma.notification.create({
    data: {
      userId: dedupedUser.id,
      type: 'advisor_insight',
      titleJson: { ar: 'توصية ذكية لكِ', en: 'A smart tip for you' },
      bodyJson: { ar: 'قديم', en: 'old' },
      sentVia: ['in_app'],
      createdAt: new Date(NOW.getTime() - 3 * 86_400_000),
    },
  });
  createdNotificationIds.push(prior.id);
}, 20000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { id: { in: createdNotificationIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.address.deleteMany({ where: { id: { in: createdAddressIds } } });
  await prisma.notificationPreference.deleteMany({ where: { id: { in: createdPrefIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('generateInsightsSweep (3.3)', () => {
  it('sends an in-app advisor insight to eligible users only', async () => {
    const sent = await generateInsightsSweep(SWEEP_NOW);
    expect(sent).toBeGreaterThanOrEqual(1);

    const eligibleRows = await prisma.notification.findMany({
      where: { userId: eligibleUser.id, type: 'advisor_insight' },
    });
    expect(eligibleRows.length).toBe(1);
    expect((eligibleRows[0]!.bodyJson as { ar: string }).ar.length).toBeGreaterThan(10);

    const optOutRows = await prisma.notification.findMany({
      where: { userId: optedOutUser.id, type: 'advisor_insight' },
    });
    expect(optOutRows.length).toBe(0);

    // The prior 3-day-old row remains; no NEW row beyond it.
    const dedupeRows = await prisma.notification.findMany({
      where: { userId: dedupedUser.id, type: 'advisor_insight' },
      orderBy: { id: 'asc' },
    });
    expect(dedupeRows.length).toBe(1);
    expect(dedupeRows[0]!.id).toBe(createdNotificationIds[0]);

    // Clean up the row the sweep wrote for our eligible user.
    await prisma.notification.deleteMany({
      where: { userId: eligibleUser.id, type: 'advisor_insight' },
    });
  });

  it('beautyInsights.advisor returns the live insight list', async () => {
    const caller = (appRouter as any).createCaller({ user: eligibleUser, ip: '127.0.0.1' });
    const insights = await caller.beautyInsights.advisor();
    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThanOrEqual(1);
    expect(insights[0]).toHaveProperty('type');
    expect(insights[0]).toHaveProperty('titleAr');
    expect(insights[0]).toHaveProperty('link');
  });
});

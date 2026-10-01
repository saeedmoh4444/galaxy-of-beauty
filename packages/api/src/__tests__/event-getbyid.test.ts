/**
 * Audit stage 12 — events detail: mobile had no detail route, and no
 * public procedure to fetch a single event. getById serves the mobile
 * detail screen: public + published-only (unpublished events 404, never
 * leak), NOT_FOUND for unknown ids.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { safeFutureDate } from './factories';

const createdEventIds: number[] = [];

async function caller(user: null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const pub = await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'ورشة عامة', en: 'Public Workshop' },
      eventType: 'workshop',
      startsAt: safeFutureDate(10),
      endsAt: new Date(Date.now() + 86400000 * 10 + 7200000),
      isPublished: true,
    },
  });
  const draft = await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'مسودة', en: 'Draft' },
      eventType: 'launch',
      startsAt: safeFutureDate(11),
      endsAt: new Date(Date.now() + 86400000 * 11 + 7200000),
      isPublished: false,
    },
  });
  createdEventIds.push(pub.id, draft.id);
}, 15000);

afterAll(async () => {
  try {
    await prisma.beautyEvent.deleteMany({ where: { id: { in: createdEventIds } } });
  } catch {}
});

describe('beautyEvents.getById — detail screen (stage 12)', () => {
  it('returns a published event by id to anonymous callers', async () => {
    const c = await caller(null);
    const event = await c.beautyEvents.getById({ id: createdEventIds[0] });
    expect(event).not.toBeNull();
    expect(event.nameJson).toEqual({ ar: 'ورشة عامة', en: 'Public Workshop' });
  });

  it('does not leak unpublished events (404)', async () => {
    const c = await caller(null);
    await expect(c.beautyEvents.getById({ id: createdEventIds[1] })).rejects.toThrow();
  });

  it('throws NOT_FOUND for unknown ids', async () => {
    const c = await caller(null);
    await expect(c.beautyEvents.getById({ id: 999_999_999 })).rejects.toThrow();
  });
});

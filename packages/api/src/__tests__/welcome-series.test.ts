/**
 * ENHANCEMENT_PLAN 8.3 Email & Push Marketing Automation — welcome series.
 *
 * Drives: welcomeDayFor (pure age-bucket), the daily welcome sweep
 * (days 1/3/7), the day-0 welcome sent at signup, and the seeded
 * welcome_day0/1/3/7 notification templates.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { welcomeDayFor, sendWelcomeSeriesEmails, sendWelcomeDay0 } from '../workers/welcomeSeries';

const TEMPLATE_KEYS = ['welcome_day0', 'welcome_day1', 'welcome_day3', 'welcome_day7'];

const createdUserIds: number[] = [];
let day1UserId = 0;
let day2UserId = 0;
let halfDayUserId = 0;

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

beforeAll(async () => {
  // notifyUser silently no-ops on unknown templates — provision ours.
  for (const key of TEMPLATE_KEYS) {
    await prisma.notificationTemplate.upsert({
      where: { key },
      update: {},
      create: {
        key,
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'أهلًا بكِ', en: 'Welcome' },
        bodyJson: { ar: '{{customerName}}', en: '{{customerName}}' },
      },
    });
  }

  const [day1, day2, half] = await Promise.all([
    prisma.user.create({
      data: { ...buildUser(), createdAt: daysAgo(1) },
    }),
    prisma.user.create({
      data: { ...buildUser(), createdAt: daysAgo(2) },
    }),
    prisma.user.create({
      data: { ...buildUser(), createdAt: daysAgo(0.5) },
    }),
  ]);
  day1UserId = day1.id;
  day2UserId = day2.id;
  halfDayUserId = half.id;
  createdUserIds.push(day1.id, day2.id, half.id);
}, 30000);

afterAll(async () => {
  try {
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('welcomeDayFor', () => {
  it('buckets membership age into 1, 3, 7 and rejects everything else', () => {
    expect(welcomeDayFor(daysAgo(1))).toBe(1);
    expect(welcomeDayFor(daysAgo(3))).toBe(3);
    expect(welcomeDayFor(daysAgo(7))).toBe(7);
    expect(welcomeDayFor(daysAgo(0))).toBeNull(); // day 0 = signup hook
    expect(welcomeDayFor(daysAgo(2))).toBeNull();
    expect(welcomeDayFor(daysAgo(30))).toBeNull();
  });
});

describe('sendWelcomeSeriesEmails', () => {
  it('notifies exactly the day-1 member and skips others', async () => {
    const count = await sendWelcomeSeriesEmails();
    expect(count).toBe(1);

    const row = await prisma.notification.findFirst({
      where: { userId: day1UserId, type: 'welcome_day1' },
    });
    expect(row).not.toBeNull();

    for (const id of [day2UserId, halfDayUserId]) {
      const none = await prisma.notification.findFirst({ where: { userId: id } });
      expect(none).toBeNull();
    }
  });
});

describe('sendWelcomeDay0', () => {
  it('sends the day-0 welcome to a brand-new member', async () => {
    const user = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(user.id);

    await sendWelcomeDay0(user.id, user.name ?? '');

    const row = await prisma.notification.findFirst({
      where: { userId: user.id, type: 'welcome_day0' },
    });
    expect(row).not.toBeNull();
  });
});

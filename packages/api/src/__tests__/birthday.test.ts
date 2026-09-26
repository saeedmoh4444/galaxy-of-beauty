/**
 * ENHANCEMENT_PLAN 8.3 — slice E: birthday automation.
 *
 * Drives: User.birthDate, the pure is-birthday matcher, and the daily
 * sweep — on a member's birthday it creates the year's BirthdayReward
 * (20% off, the existing claim flow issues the code) + sends the birthday
 * notification, once per year.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import {
  isBirthdayToday,
  sendBirthdayEmails,
  BIRTHDAY_DISCOUNT_PERCENT,
} from '../workers/birthday';

const createdUserIds: number[] = [];
let birthdayUserId = 0;
let notBirthdayUserId = 0;

// Today's month/day, in a previous year — the matcher must ignore the year.
const birthdayPastYear = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 3);
  return d;
})();

beforeAll(async () => {
  await prisma.notificationTemplate.upsert({
    where: { key: 'birthday' },
    update: {},
    create: {
      key: 'birthday',
      category: 'promotions',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'عيد ميلاد سعيد!', en: 'Happy Birthday!' },
      bodyJson: { ar: '{{customerName}}', en: '{{customerName}}' },
    },
  });

  const b = await prisma.user.create({
    data: { ...buildUser(), birthDate: birthdayPastYear },
  });
  createdUserIds.push(b.id);
  birthdayUserId = b.id;

  // Tomorrow — must NOT match.
  const notB = await prisma.user.create({
    data: {
      ...buildUser(),
      birthDate: new Date(Date.now() + 86_400_000),
    },
  });
  createdUserIds.push(notB.id);
  notBirthdayUserId = notB.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.birthdayReward.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('isBirthdayToday', () => {
  it('matches month/day regardless of year', () => {
    expect(isBirthdayToday(birthdayPastYear)).toBe(true);
    expect(isBirthdayToday(new Date())).toBe(true);
    expect(isBirthdayToday(new Date(Date.now() + 86_400_000))).toBe(false);
    expect(isBirthdayToday(null)).toBe(false);
  });
});

describe('sendBirthdayEmails', () => {
  it('creates the yearly reward + notification for the birthday member only', async () => {
    const count = await sendBirthdayEmails();
    expect(count).toBeGreaterThanOrEqual(1);

    const year = new Date().getFullYear();
    const reward = await prisma.birthdayReward.findUnique({
      where: { userId_year: { userId: birthdayUserId, year } },
    });
    expect(reward).not.toBeNull();
    expect(reward!.rewardType).toBe('discount_percent');
    expect(Number(reward!.rewardValue)).toBe(BIRTHDAY_DISCOUNT_PERCENT);

    const note = await prisma.notification.findFirst({
      where: { userId: birthdayUserId, type: 'birthday' },
    });
    expect(note).not.toBeNull();

    const notB = await prisma.notification.findFirst({
      where: { userId: notBirthdayUserId, type: 'birthday' },
    });
    expect(notB).toBeNull();
  });

  it('is idempotent — a second sweep changes nothing', async () => {
    await sendBirthdayEmails();
    const year = new Date().getFullYear();
    const rewards = await prisma.birthdayReward.count({
      where: { userId: birthdayUserId, year },
    });
    expect(rewards).toBe(1);
    const notes = await prisma.notification.count({
      where: { userId: birthdayUserId, type: 'birthday' },
    });
    expect(notes).toBe(1);
  });
});

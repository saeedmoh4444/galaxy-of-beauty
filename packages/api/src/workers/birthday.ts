/**
 * 8.3 Email & Push Marketing Automation — birthday.
 *
 * Daily sweep: members whose birthDate matches today's month/day get the
 * year's BirthdayReward (20% off — the existing birthdayRewards.claim
 * flow issues the code) + a birthday notification, once per year.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
export const BIRTHDAY_DISCOUNT_PERCENT = 20;

/** True when birthDate's month/day matches today (year ignored). */
export function isBirthdayToday(birthDate: Date | null, now: Date = new Date()): boolean {
  if (!birthDate) return false;
  return birthDate.getMonth() === now.getMonth() && birthDate.getDate() === now.getDate();
}

export async function sendBirthdayEmails(): Promise<number> {
  const now = new Date();
  const year = now.getFullYear();

  const members = await prisma.user.findMany({
    where: { role: 'CUSTOMER', birthDate: { not: null } },
    select: { id: true, name: true, birthDate: true },
  });

  let sent = 0;
  for (const u of members) {
    if (!isBirthdayToday(u.birthDate, now)) continue;

    // Idempotent reward creation (unique userId_year) — the existing
    // claim flow turns it into the BDAY code.
    await prisma.birthdayReward.upsert({
      where: { userId_year: { userId: u.id, year } },
      update: {},
      create: {
        userId: u.id,
        year,
        rewardType: 'discount_percent',
        rewardValue: BIRTHDAY_DISCOUNT_PERCENT,
      },
    });

    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        userId: u.id,
        type: 'birthday',
        createdAt: { gte: new Date(now.getTime() - 20 * 3_600_000) },
      },
    });
    if (alreadyNotified) continue;

    await notifyUser({
      userId: u.id,
      templateKey: 'birthday',
      vars: { customerName: u.name ?? '', discount: BIRTHDAY_DISCOUNT_PERCENT },
      link: '/birthday-rewards',
    });
    sent++;
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startBirthday(): void {
  if (intervalId) return;
  void sendBirthdayEmails();
  intervalId = setInterval(() => {
    void sendBirthdayEmails();
  }, SWEEP_INTERVAL_MS);
}

export function stopBirthday(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

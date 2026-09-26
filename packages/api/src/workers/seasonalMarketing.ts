/**
 * 8.3 Email & Push Marketing Automation — season-start announcements.
 *
 * Daily sweep: for each active season (lib/season getActiveSeasons —
 * Hijri/Gregorian), members get one seasonal_start notification per
 * season per dedup window. Seasons are injectable for deterministic
 * tests.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';
import { getActiveSeasons } from '../lib/season';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
export const SEASON_DEDUP_DAYS = 45; // longer than RAMADAN's window

const SEASON_LABEL_AR: Record<string, string> = {
  RAMADAN: 'رمضان',
  EID: 'العيد',
  GRADUATION: 'التخرج',
  VALENTINE: 'فالنتاين',
};
const SEASON_LABEL_EN: Record<string, string> = {
  RAMADAN: 'Ramadan',
  EID: 'Eid',
  GRADUATION: 'Graduation',
  VALENTINE: 'Valentine',
};

export async function sendSeasonalEmails(
  seasons: string[] = getActiveSeasons(),
  now: Date = new Date(),
): Promise<number> {
  if (seasons.length === 0) return 0;

  const cutoff = new Date(now.getTime() - SEASON_DEDUP_DAYS * 86_400_000);
  const members = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, name: true, preferredLanguage: true },
  });

  let sent = 0;
  for (const season of seasons) {
    // notifyUser stamps the row type with the template key, so dedup on
    // the per-season link instead.
    const link = `/seasonal-calendar?season=${season}`;
    for (const u of members) {
      const recent = await prisma.notification.findFirst({
        where: { userId: u.id, type: 'seasonal_start', link, createdAt: { gte: cutoff } },
      });
      if (recent) continue;

      const isAr = (u.preferredLanguage ?? 'ar') === 'ar';
      await notifyUser({
        userId: u.id,
        templateKey: 'seasonal_start',
        vars: {
          customerName: u.name ?? '',
          seasonName: isAr
            ? (SEASON_LABEL_AR[season] ?? season)
            : (SEASON_LABEL_EN[season] ?? season),
        },
        link,
      });
      sent++;
    }
  }
  return sent;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startSeasonalMarketing(): void {
  if (intervalId) return;
  void sendSeasonalEmails();
  intervalId = setInterval(() => {
    void sendSeasonalEmails();
  }, SWEEP_INTERVAL_MS);
}

export function stopSeasonalMarketing(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

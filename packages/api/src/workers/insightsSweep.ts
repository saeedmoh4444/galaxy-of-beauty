/**
 * 3.3 Proactive AI advisor — daily insight sweep.
 *
 * Daily sweep (setInterval, same pattern as subscriptionRenewal):
 *   - candidate users: active bookers (a booking in the last 90 days)
 *     who have not opted out of the `tips` notification category
 *   - per candidate: buildAdvisorInsights → top insight → notifyUser
 *   - dedupe: at most one advisor_insight notification per user per 7 days
 *   - in-app only (user-approved: proactive insights never push)
 *
 * Exported functions are pure and tested directly.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from '../lib/notify';
import { buildAdvisorInsights } from '../lib/advisor';

const SWEEP_INTERVAL_MS = 3_600_000 * 24; // daily
const CANDIDATE_WINDOW_DAYS = 90;
const DEDUPE_DAYS = 7;
const CANDIDATE_BATCH = 500;

/** Generate + send the daily proactive insights. Returns count sent. */
export async function generateInsightsSweep(now = new Date()): Promise<number> {
  const since = new Date(now.getTime() - CANDIDATE_WINDOW_DAYS * 86_400_000);
  const dedupeSince = new Date(now.getTime() - DEDUPE_DAYS * 86_400_000);

  // Candidates: recent bookers who have not opted out of tips.
  const [recentBookers, optOuts] = await Promise.all([
    prisma.booking.groupBy({
      by: ['customerId'],
      where: { createdAt: { gte: since } },
      orderBy: { customerId: 'desc' },
      take: CANDIDATE_BATCH,
    }),
    prisma.notificationPreference.findMany({ where: { tips: false }, select: { userId: true } }),
  ]);
  const optOutIds = new Set(optOuts.map((p) => p.userId));
  const candidates = recentBookers.map((b) => b.customerId).filter((id) => !optOutIds.has(id));

  let sent = 0;
  for (const userId of candidates) {
    const insights = await buildAdvisorInsights(userId, now);
    if (insights.length === 0) continue;

    // Dedupe — one proactive insight per user per week.
    const alreadyNotified = await prisma.notification.findFirst({
      where: { userId, type: 'advisor_insight', createdAt: { gte: dedupeSince } },
      select: { id: true },
    });
    if (alreadyNotified) continue;

    const top = insights[0]!;
    await notifyUser({
      userId,
      templateKey: 'advisor_insight',
      vars: {
        insightTextAr: `${top.titleAr}\n${top.bodyAr}`,
        insightTextEn: `${top.titleEn}\n${top.bodyEn}`,
      },
      link: top.link,
    });
    sent++;
  }
  return sent;
}

let intervalId: NodeJS.Timeout | null = null;

export function startInsightsSweep(): void {
  if (intervalId) return; // already running
  void generateInsightsSweep().then((sent) =>
    console.log(`[3.3 advisor] initial sweep sent ${sent} insights`),
  );
  intervalId = setInterval(() => {
    void generateInsightsSweep()
      .then((sent) => console.log(`[3.3 advisor] daily sweep sent ${sent} insights`))
      .catch((err) => console.error(`[3.3 advisor] sweep failed: ${(err as Error).message}`));
  }, SWEEP_INTERVAL_MS);
  intervalId.unref?.();
}

export function stopInsightsSweep(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

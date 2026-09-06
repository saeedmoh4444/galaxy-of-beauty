/**
 * B.26 — notification framework core.
 *
 * DB-backed bilingual templates (notification_templates) rendered with
 * {{placeholder}} interpolation, gated by per-category preference toggles
 * and per-channel opt-outs, delivered as an in-app Notification row plus
 * external channels (push/sms/email) through the gob-notifications queue.
 *
 * Usage:
 *   await notifyUser({
 *     userId, templateKey: 'booking_created',
 *     vars: { customerName, serviceName }, link: `/bookings/${id}`,
 *   });
 */
import { prisma } from '@galaxy/db';
import { getNotificationQueue } from '../queues';

export type NotifyVars = Record<string, string | number>;

/** Replace {{placeholder}} tokens; unknown tokens are left intact. */
export function renderTemplate(text: string, vars: NotifyVars): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    vars[key] != null ? String(vars[key]) : match,
  );
}

/** Preference column names the template categories map onto. */
const CATEGORY_TOGGLE: Record<string, string> = {
  bookingReminders: 'bookingReminders',
  promotions: 'promotions',
  tips: 'tips',
  community: 'community',
};

export interface NotifyInput {
  userId: number;
  templateKey: string;
  vars?: NotifyVars;
  link?: string;
  /** Override the template's default channels (e.g. reminders are push-only). */
  channels?: string[];
}

export async function notifyUser({
  userId,
  templateKey,
  vars = {},
  link,
  channels,
}: NotifyInput): Promise<void> {
  const template = await prisma.notificationTemplate.findUnique({
    where: { key: templateKey },
  });
  if (!template || !template.isActive) return; // unknown template → silent no-op

  // ── Preference gates ─────────────────────────────────────────────
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  const toggle = CATEGORY_TOGGLE[template.category];
  if (toggle && prefs && (prefs as unknown as Record<string, unknown>)[toggle] === false) {
    return; // user opted out of this whole notification category
  }

  // ── Render ───────────────────────────────────────────────────────
  const titleJson = {
    ar: renderTemplate((template.titleJson as { ar: string }).ar, vars),
    en: renderTemplate((template.titleJson as { en: string }).en, vars),
  };
  const bodyJson = {
    ar: renderTemplate((template.bodyJson as { ar: string }).ar, vars),
    en: renderTemplate((template.bodyJson as { en: string }).en, vars),
  };

  // ── Channel filtering (anti-fatigue) ─────────────────────────────
  const requested = channels ?? (template.channels as string[]);
  const external: string[] = [];
  for (const ch of requested) {
    if (ch === 'in_app') continue;
    if (ch === 'sms' && prefs?.smsAlerts === false) continue;
    if (ch === 'email' && prefs?.emailDigest === false) continue;
    external.push(ch);
  }
  const sentVia = ['in_app', ...external];

  // ── In-app row (synchronous — the primary surface) ───────────────
  await prisma.notification.create({
    data: {
      userId,
      type: templateKey,
      titleJson,
      bodyJson,
      link,
      sentVia,
    },
  });

  // ── External channels via the queue (worker dispatches email/SMS/push) ──
  if (external.length > 0) {
    const queue = getNotificationQueue();
    if (queue) {
      await queue.add(
        'notification.send',
        {
          userId,
          type: templateKey,
          titleAr: titleJson.ar,
          titleEn: titleJson.en,
          bodyAr: bodyJson.ar,
          bodyEn: bodyJson.en,
          channels: external,
          link,
          skipInApp: true, // the row above already exists
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    }
  }
}

/**
 * Alerting — webhook paging on top of Sentry (AUDIT_2026-10-30 item 8).
 * ALERT_WEBHOOK_URL (Slack-compatible incoming webhook) receives the
 * alert; without it every alert degrades to a loud log. Fail-safe by
 * construction: never throws, dedupes repeats within a window so a
 * flapping gateway cannot spam the channel.
 */
import { logger } from './logger';

const DEDUPE_WINDOW_MS = 15 * 60_000;
const MAX_HISTORY = 50;
const fired: Array<{ key: string; at: number }> = [];

export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Send an alert (deduped by key within the window). Returns true when a
 * webhook was actually delivered — false on dedupe/unconfigured/failure.
 */
export async function sendAlert(
  key: string,
  title: string,
  detail: string,
  severity: AlertSeverity = 'warning',
): Promise<boolean> {
  const now = Date.now();
  const existing = fired.find((f) => f.key === key);
  if (existing && now - existing.at < DEDUPE_WINDOW_MS) {
    return false; // flapping guard — already paged recently
  }
  if (existing) fired.splice(fired.indexOf(existing), 1);
  fired.push({ key, at: now });
  if (fired.length > MAX_HISTORY) fired.splice(0, fired.length - MAX_HISTORY);

  const url = process.env['ALERT_WEBHOOK_URL'];
  if (!url) {
    logger.warn({ key, title, detail, severity }, `[alert] ${severity}: ${title}`);
    return false;
  }

  try {
    const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${emoji} *${title}*\n${detail}` }),
      signal: AbortSignal.timeout(5_000),
    });
    return true;
  } catch (err) {
    logger.error({ err }, 'alert delivery failed');
    return false;
  }
}

/** Test seam. */
export function resetAlertHistoryForTests(): void {
  fired.length = 0;
}

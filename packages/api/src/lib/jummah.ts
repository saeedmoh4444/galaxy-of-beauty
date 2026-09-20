/**
 * Jummah (Friday congregational prayer) slot blocking — 6.4 Saudi Calendar.
 *
 * Booking slots that overlap the Friday prayer window (11:30–13:30 Saudi
 * time, shared constants) are blocked: filtered from availability,
 * rejected at slot creation, and rejected at booking time.
 *
 * The window is evaluated in Asia/Riyadh regardless of server timezone
 * (CI runs UTC; prod servers may too).
 */
import { JUMMAH_START_MINUTE, JUMMAH_END_MINUTE } from '@galaxy/shared';

const RIYADH_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Riyadh',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** { weekday: 0-6 (Sun-Sat), minutesFromMidnight } of a Date in Riyadh time. */
function riyadhTime(d: Date): { weekday: number; minuteOfDay: number } {
  const parts: Record<string, string> = {};
  for (const p of RIYADH_FMT.formatToParts(d)) parts[p.type] = p.value;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekday = weekdays.indexOf(parts['weekday'] ?? '');
  // Intl '2-digit' hour can emit "24" for midnight — normalize.
  const hour = Number(parts['hour'] ?? '0') % 24;
  const minute = Number(parts['minute'] ?? '0');
  return { weekday, minuteOfDay: hour * 60 + minute };
}

/** True when the [startAt, endAt) interval overlaps the Friday prayer window. */
export function isJummahBlocked(startAt: Date, endAt: Date): boolean {
  const start = riyadhTime(startAt);
  if (start.weekday !== 5) return false; // 5 = Friday
  const end = riyadhTime(endAt);
  return start.minuteOfDay < JUMMAH_END_MINUTE && end.minuteOfDay > JUMMAH_START_MINUTE;
}

/** Human-readable blocking reason for client/error messages. */
export const JUMMAH_BLOCK_REASON = 'Jummah prayer window (Friday 11:30–13:30)';

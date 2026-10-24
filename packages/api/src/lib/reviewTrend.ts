/**
 * E4 — reputation trend bucketing. Week buckets follow the platform's
 * noon-UTC discipline: a "day" runs noon-UTC → noon-UTC, so a timestamp is
 * bucketed by subtracting 12h before taking the UTC date. Weeks start on
 * Monday (ISO-style) and labels are YYYY-MM-DD.
 */

/** Monday start of the week containing `d`, as a YYYY-MM-DD label. */
export function weekBucketStart(d: Date): string {
  const shifted = d.getTime() - 12 * 3_600_000; // noon-UTC discipline
  const day = new Date(shifted);
  const utcDay = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
  const dow = (day.getUTCDay() + 6) % 7; // Monday = 0
  const start = new Date(utcDay - dow * 86_400_000);
  return start.toISOString().slice(0, 10);
}

/** The 8 weekly bucket labels ending with the current week, oldest first. */
export function weeklyTrendLabels(now: Date = new Date()): string[] {
  const current = weekBucketStart(now);
  const labels: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(new Date(`${current}T00:00:00Z`).getTime() - i * 7 * 86_400_000);
    labels.push(start.toISOString().slice(0, 10));
  }
  return labels;
}

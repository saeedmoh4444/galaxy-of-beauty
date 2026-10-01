/**
 * Loyalty boosts display helpers (audit stage 12) — pure formatting for
 * the mobile boosts screen. Dates mirror the loyalty screen convention:
 * ar-SA / en-GB, locale-driven calendar.
 */

/** "2×" / "1.5×" — the points multiplier as a compact label. */
export function multiplierLabel(multiplier: number): string {
  return `${multiplier}×`;
}

/** "01/06/2026 – 07/06/2026" (or the Arabic-Indic equivalent) for a boost window. */
export function boostWindowLabel(locale: 'ar' | 'en', startsAt: string, endsAt: string): string {
  const localeTag = locale === 'ar' ? 'ar-SA' : 'en-GB';
  const start = new Date(startsAt).toLocaleDateString(localeTag);
  const end = new Date(endsAt).toLocaleDateString(localeTag);
  return `${start} – ${end}`;
}

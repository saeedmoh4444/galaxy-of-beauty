/**
 * 1.4 Seasonal & Event Services — season detection.
 *
 * Hijri seasons are computed from the Umm al-Qura calendar (the official
 * Saudi calendar) via Intl: month 9 = Ramadan; Shawwal 1–3 = Eid al-Fitr;
 * Dhul-Hijjah 10 = Eid al-Adha. Western seasons use Gregorian dates.
 */
export type Season = 'RAMADAN' | 'EID' | 'GRADUATION' | 'VALENTINE';

const HIJRI_FMT = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
  timeZone: 'Asia/Riyadh',
  month: 'numeric',
  day: 'numeric',
});

/** Hijri month/day of a date in Riyadh time. */
function hijriMonthDay(d: Date): { month: number; day: number } {
  const parts: Record<string, string> = {};
  for (const p of HIJRI_FMT.formatToParts(d)) parts[p.type] = p.value;
  return { month: Number(parts['month'] ?? '0'), day: Number(parts['day'] ?? '0') };
}

/** All seasons active for the given date (Riyadh-anchored). */
export function getActiveSeasons(date: Date = new Date()): Season[] {
  const seasons: Season[] = [];
  const { month, day } = hijriMonthDay(date);
  if (month === 9) seasons.push('RAMADAN');
  // Eid al-Fitr: Shawwal 1–3; Eid al-Adha: Dhul-Hijjah 10 (celebrated ~3 days)
  if ((month === 10 && day <= 3) || (month === 12 && day >= 10 && day <= 12)) {
    seasons.push('EID');
  }
  const m = date.getMonth() + 1; // Gregorian, Riyadh ≈ local business calendar
  if (m === 2 && date.getDate() <= 14) seasons.push('VALENTINE');
  if (m >= 5 && m <= 7) seasons.push('GRADUATION');
  return seasons;
}

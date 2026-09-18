/**
 * Hijri (Umm al-Qura) date formatting — Saudi-market relevance
 * (ENHANCEMENT_PLAN quick win #4).
 *
 * Uses the platform Intl islamic-umalqura calendar with a graceful
 * fallback to the plain islamic calendar on runtimes without the
 * umalqura extension (older Hermes builds).
 */

export type HijriCalendar = 'islamic-umalqura' | 'islamic';

export function formatHijriDate(
  date: Date,
  locale: 'ar' | 'en',
  calendar: HijriCalendar = 'islamic-umalqura',
): string {
  // Preferred tag: Umm al-Qura (official Saudi calendar), Arabic-Indic
  // digits in Arabic. English renders the Hijri year + "AH".
  const primaryTag = locale === 'ar' ? `ar-SA-u-ca-${calendar}-nu-arab` : `en-u-ca-${calendar}`;
  const fallbackTag = locale === 'ar' ? 'ar-SA-u-ca-islamic-nu-arab' : 'en-u-ca-islamic';

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

  try {
    return new Intl.DateTimeFormat(primaryTag, options).format(date);
  } catch {
    return new Intl.DateTimeFormat(fallbackTag, options).format(date);
  }
}

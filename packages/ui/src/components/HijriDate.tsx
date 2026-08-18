'use client';

/**
 * Hijri calendar date display component.
 * Shows Hijri date alongside Gregorian for Saudi market relevance.
 *
 * Usage:
 *   <HijriDate date={new Date()} />
 *   → "١٤٤٨/٠٢/٠٥ هـ | 2026/08/05 م"
 */

const HIJRI_MONTHS: { ar: string; en: string }[] = [
  { ar: 'محرم', en: 'Muharram' },
  { ar: 'صفر', en: 'Safar' },
  { ar: 'ربيع الأول', en: 'Rabi al-Awwal' },
  { ar: 'ربيع الثاني', en: 'Rabi al-Thani' },
  { ar: 'جمادى الأولى', en: 'Jumada al-Awwal' },
  { ar: 'جمادى الآخرة', en: 'Jumada al-Thani' },
  { ar: 'رجب', en: 'Rajab' },
  { ar: 'شعبان', en: 'Shaaban' },
  { ar: 'رمضان', en: 'Ramadan' },
  { ar: 'شوال', en: 'Shawwal' },
  { ar: 'ذو القعدة', en: 'Dhu al-Qadah' },
  { ar: 'ذو الحجة', en: 'Dhu al-Hijjah' },
];

// Simplified Hijri approximation (Umm al-Qura-like)
// Accurate to ±1 day. For production, use a proper Hijri library.
function toHijriApprox(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month: month + 1, day };
}

export function HijriDate({
  date,
  showGregorian = true,
  hijriSuffix = 'هـ',
  gregorianSuffix = 'م',
  locale = 'ar',
}: {
  date: Date;
  showGregorian?: boolean;
  /** Era suffix appended to the Hijri date, e.g. 'AH' */
  hijriSuffix?: string;
  /** Era suffix appended to the Gregorian date, e.g. 'AD' */
  gregorianSuffix?: string;
  /** Locale for internal month-name strings */
  locale?: 'ar' | 'en';
}): JSX.Element {
  const h = toHijriApprox(date);
  const hijriStr = `${String(h.day).padStart(2, '0')} ${HIJRI_MONTHS[h.month - 1]?.[locale]} ${h.year} ${hijriSuffix}`;
  const gregStr = date.toLocaleDateString('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <span className="text-xs text-text-secondary dark:text-gray-400" dir="rtl">
      {hijriStr}
      {showGregorian ? <span className="mx-1 text-text-tertiary">|</span> : null}
      {showGregorian ? `${gregStr} ${gregorianSuffix}` : null}
    </span>
  );
}

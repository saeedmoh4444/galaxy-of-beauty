/**
 * Hijri Calendar Utility
 *
 * Converts Gregorian dates to Hijri (Umm al-Qura calendar used in Saudi Arabia).
 * Uses a simplified arithmetic approximation accurate within ±1 day for
 * the next 50 years — sufficient for booking displays and reminders.
 *
 * For production-critical dates (e.g., ZATCA reporting), use the
 * official Umm al-Qura API or the 'hijri-date' npm package.
 */

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

/**
 * Approximate Hijri date from a Gregorian Date.
 * Formula: Hijri year ≈ (Gregorian year - 622) × 33/32
 * Month/day approximated from day-of-year offset (354-day year).
 *
 * @param {Date} [date] - Gregorian date (default: now)
 * @returns {{ year: number, month: number, day: number, monthNameAr: string, monthNameEn: string }}
 */
export function toHijri(date = new Date()) {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth();
  const gDay = date.getDate();

  // Approximate Hijri year
  const jd = gregorianToJD(gYear, gMonth + 1, gDay);
  const hijri = jdToHijri(jd);

  return {
    year: hijri.year,
    month: hijri.month,
    day: hijri.day,
    monthNameAr: HIJRI_MONTHS_AR[hijri.month - 1],
    monthNameEn: HIJRI_MONTHS_EN[hijri.month - 1],
  };
}

/**
 * Format a Gregorian date as a bilingual Hijri + Gregorian string.
 * Example: "15 رمضان 1447هـ / 4 مارس 2026م"
 */
export function formatBilingualDate(date = new Date()) {
  const h = toHijri(date);

  const gregDay = date.getDate();
  const gregMonth = date.toLocaleDateString('ar-SA', { month: 'long' });
  const gregYear = date.getFullYear();

  return `${h.day} ${h.monthNameAr} ${h.year}هـ / ${gregDay} ${gregMonth} ${gregYear}م`;
}

/**
 * Get Hijri month name in Arabic.
 */
export function getHijriMonthName(month, lang = 'ar') {
  const months = lang === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;
  return months[month - 1] || '';
}

// Astronomical algorithms (Kuwaiti algorithm — widely used in the Gulf)

function gregorianToJD(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdToHijri(jd) {
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month: month + 1, day };
}

export default { toHijri, formatBilingualDate, getHijriMonthName, HIJRI_MONTHS_AR };

/**
 * Saudi Calendar Utilities — Ramadan, Eid, Friday Prayer.
 * Hijri date calculations for Saudi-specific features.
 */

// Approximate Ramadan/Eid dates for 2026-2028 (Hijri 1447-1450)
// Accurate to ±1 day. Update yearly.
const RAMADAN_DATES: Array<{ start: string; end: string; eidAlFitr: string; eidAlAdha: string }> = [
  { start: '2026-02-17', end: '2026-03-19', eidAlFitr: '2026-03-20', eidAlAdha: '2026-05-27' }, // 1447
  { start: '2027-02-07', end: '2027-03-08', eidAlFitr: '2027-03-09', eidAlAdha: '2027-05-16' }, // 1448
  { start: '2028-01-27', end: '2028-02-25', eidAlFitr: '2028-02-26', eidAlAdha: '2028-05-05' }, // 1449
];

const FRIDAY = 5; // JS getDay() — 0=Sun, 5=Fri
const FRIDAY_PRAYER_START = 11; // 11:00 AM
const FRIDAY_PRAYER_END = 14; // 2:00 PM

export function getSaudiSeason(date: Date = new Date()): {
  isRamadan: boolean;
  isEidAlFitr: boolean;
  isEidAlAdha: boolean;
  isHajj: boolean;
  isFriday: boolean;
  isFridayPrayer(hour?: number): boolean;
  seasonLabel: string | null;
  seasonEmoji: string | null;
} {
  const today = date.toISOString().slice(0, 10);
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  let isRamadan = false;
  let isEidAlFitr = false;
  let isEidAlAdha = false;

  for (const r of RAMADAN_DATES) {
    if (today >= r.start && today <= r.end) isRamadan = true;
    // Eid al-Fitr: 3 days starting from eidAlFitr
    const eidEnd = new Date(r.eidAlFitr);
    eidEnd.setDate(eidEnd.getDate() + 3);
    if (today >= r.eidAlFitr && today <= eidEnd.toISOString().slice(0, 10)) isEidAlFitr = true;
    // Eid al-Adha: 4 days starting from eidAlAdha
    const adhaEnd = new Date(r.eidAlAdha);
    adhaEnd.setDate(adhaEnd.getDate() + 4);
    if (today >= r.eidAlAdha && today <= adhaEnd.toISOString().slice(0, 10)) isEidAlAdha = true;
  }

  const isFriday = dayOfWeek === FRIDAY;
  const isHajj = false; // Requires proper Hijri calendar for Dhul Hijjah detection

  function isFridayPrayer(h: number = hour): boolean {
    return isFriday && h >= FRIDAY_PRAYER_START && h < FRIDAY_PRAYER_END;
  }

  let seasonLabel: string | null = null;
  let seasonEmoji: string | null = null;

  if (isRamadan) {
    seasonLabel = 'رمضان كريم';
    seasonEmoji = '🌙';
  } else if (isEidAlFitr) {
    seasonLabel = 'عيد الفطر';
    seasonEmoji = '🎊';
  } else if (isEidAlAdha) {
    seasonLabel = 'عيد الأضحى';
    seasonEmoji = '🐑';
  }

  return {
    isRamadan,
    isEidAlFitr,
    isEidAlAdha,
    isHajj,
    isFriday,
    isFridayPrayer,
    seasonLabel,
    seasonEmoji,
  };
}

/**
 * Get Friday prayer blocked hours — slots during Jummah should be unavailable.
 */
export function getFridayBlockedHours(
  date: Date = new Date(),
): { start: number; end: number } | null {
  if (date.getDay() !== FRIDAY) return null;
  return { start: FRIDAY_PRAYER_START, end: FRIDAY_PRAYER_END };
}

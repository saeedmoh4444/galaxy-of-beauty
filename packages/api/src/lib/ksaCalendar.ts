/**
 * D5 — KSA calendar & seasonality: Hijri date overlay (Umm al-Qura
 * aligned tabular approximation, ±1 day) and KSA season windows for
 * analytics markers + seasonal deal templates (feeds C3).
 *
 * The season table holds APPROXIMATE windows per Gregorian year —
 * adjusted on official Umm al-Qura announcements. National Day is fixed.
 */

export type SeasonType = 'ramadan' | 'eid-fitr' | 'eid-adha' | 'national-day';

export interface SeasonWindow {
  type: SeasonType;
  titleAr: string;
  titleEn: string;
  startsAt: string; // ISO date (YYYY-MM-DD)
  endsAt: string; // ISO date, inclusive
}

/** Approximate KSA seasons per Gregorian year (adjust on announcements). */
export const KSA_SEASONS: Record<number, SeasonWindow[]> = {
  2026: [
    {
      type: 'ramadan',
      titleAr: 'رمضان 1447',
      titleEn: 'Ramadan 1447',
      startsAt: '2026-02-18',
      endsAt: '2026-03-19',
    },
    {
      type: 'eid-fitr',
      titleAr: 'عيد الفطر 1447',
      titleEn: 'Eid al-Fitr 1447',
      startsAt: '2026-03-20',
      endsAt: '2026-03-23',
    },
    {
      type: 'eid-adha',
      titleAr: 'عيد الأضحى 1447',
      titleEn: 'Eid al-Adha 1447',
      startsAt: '2026-05-27',
      endsAt: '2026-05-30',
    },
    {
      type: 'national-day',
      titleAr: 'اليوم الوطني 96',
      titleEn: 'National Day 96',
      startsAt: '2026-09-23',
      endsAt: '2026-09-23',
    },
  ],
  2027: [
    {
      type: 'ramadan',
      titleAr: 'رمضان 1448',
      titleEn: 'Ramadan 1448',
      startsAt: '2027-02-08',
      endsAt: '2027-03-09',
    },
    {
      type: 'eid-fitr',
      titleAr: 'عيد الفطر 1448',
      titleEn: 'Eid al-Fitr 1448',
      startsAt: '2027-03-10',
      endsAt: '2027-03-13',
    },
    {
      type: 'eid-adha',
      titleAr: 'عيد الأضحى 1448',
      titleEn: 'Eid al-Adha 1448',
      startsAt: '2027-05-16',
      endsAt: '2027-05-19',
    },
    {
      type: 'national-day',
      titleAr: 'اليوم الوطني 97',
      titleEn: 'National Day 97',
      startsAt: '2027-09-23',
      endsAt: '2027-09-23',
    },
  ],
};

/** ISO day key (YYYY-MM-DD) for a Date. */
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Hijri (Umm al-Qura-aligned tabular approximation, ±1 day): returns
 * { year, month, day } for a Gregorian date. Display-only — the season
 * windows above are the authoritative scheduling source.
 */
export function hijriDate(gregorian: Date): { year: number; month: number; day: number } {
  // Kuwaiti algorithm (tabular Islamic calendar) — the standard
  // arithmetic approximation; aligns with Umm al-Qura within a day.
  const jd = Math.floor((gregorian.getTime() + 12 * 3_600_000) / 86_400_000) + 2440588; // Julian day at UTC noon
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day }; // the Kuwaiti algorithm's month is 1-based
}

export interface SeasonMarker {
  day: string; // ISO date
  type: SeasonType;
  titleAr: string;
  titleEn: string;
}

/** Season markers intersecting [from, to] (inclusive, ISO dates). */
export function seasonMarkers(from: string, to: string): SeasonMarker[] {
  const fromYear = Number(from.slice(0, 4));
  const toYear = Number(to.slice(0, 4));
  const markers: SeasonMarker[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    for (const w of KSA_SEASONS[y] ?? []) {
      const start = w.startsAt <= to && w.endsAt >= from ? w.startsAt : null;
      if (start && start >= from && start <= to) {
        markers.push({ day: start, type: w.type, titleAr: w.titleAr, titleEn: w.titleEn });
      }
    }
  }
  return markers;
}

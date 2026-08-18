'use client';

import { useState, useEffect } from 'react';

/**
 * Saudi Prayer Times component.
 * Shows today's prayer times and highlights current/next prayer.
 * During prayer times, shows a subtle indicator.
 */

const PRAYERS = [
  { name: { ar: 'الفجر', en: 'Fajr' }, nameEn: 'Fajr', hour: 5, minute: 15 },
  { name: { ar: 'الشروق', en: 'Sunrise' }, nameEn: 'Sunrise', hour: 6, minute: 30 },
  { name: { ar: 'الظهر', en: 'Dhuhr' }, nameEn: 'Dhuhr', hour: 12, minute: 0 },
  { name: { ar: 'العصر', en: 'Asr' }, nameEn: 'Asr', hour: 15, minute: 30 },
  { name: { ar: 'المغرب', en: 'Maghrib' }, nameEn: 'Maghrib', hour: 18, minute: 30 },
  { name: { ar: 'العشاء', en: 'Isha' }, nameEn: 'Isha', hour: 20, minute: 0 },
];

function getCurrentPrayer(): {
  current: { ar: string; en: string } | null;
  next: { ar: string; en: string };
  nextTime: string;
} {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < PRAYERS.length; i++) {
    const prayerMin = PRAYERS[i]!.hour * 60 + PRAYERS[i]!.minute;
    if (currentMin < prayerMin) {
      return {
        current: i > 0 ? PRAYERS[i - 1]!.name : null,
        next: PRAYERS[i]!.name,
        nextTime: `${String(PRAYERS[i]!.hour).padStart(2, '0')}:${String(PRAYERS[i]!.minute).padStart(2, '0')}`,
      };
    }
  }

  return {
    current: PRAYERS[5]!.name,
    next: PRAYERS[0]!.name,
    nextTime: `${String(PRAYERS[0]!.hour).padStart(2, '0')}:${String(PRAYERS[0]!.minute).padStart(2, '0')}`,
  };
}

export function PrayerTimes({
  locale = 'ar',
  title = 'مواقيت الصلاة',
  upcomingPrefix = 'القادمة: ',
}: {
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  upcomingPrefix?: string;
}): JSX.Element {
  const [prayer, setPrayer] = useState(getCurrentPrayer());

  useEffect(() => {
    const interval = setInterval(() => setPrayer(getCurrentPrayer()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-edge bg-surface-muted p-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary dark:text-gray-100">{title}</span>
        {prayer.next ? (
          <span className="text-[10px] text-text-secondary dark:text-gray-400">
            {upcomingPrefix}
            {prayer.next[locale]} {prayer.nextTime}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex gap-1">
        {PRAYERS.filter((p) =>
          ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'].includes(p.name.ar),
        ).map((p) => (
          <span
            key={p.name.ar}
            className={`flex-1 rounded-md px-1 py-1 text-center text-[9px] font-medium ${
              prayer.current === p.name
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'bg-white text-text-tertiary dark:bg-gray-800 dark:text-gray-500'
            }`}
          >
            <div>{p.name[locale]}</div>
            <div className="text-[8px]">
              {String(p.hour).padStart(2, '0')}:{String(p.minute).padStart(2, '0')}
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}

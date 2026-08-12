'use client';

import { useState, useEffect } from 'react';

/**
 * Saudi Prayer Times component.
 * Shows today's prayer times and highlights current/next prayer.
 * During prayer times, shows a subtle indicator.
 */

const PRAYERS = [
  { name: 'الفجر', nameEn: 'Fajr', hour: 5, minute: 15 },
  { name: 'الشروق', nameEn: 'Sunrise', hour: 6, minute: 30 },
  { name: 'الظهر', nameEn: 'Dhuhr', hour: 12, minute: 0 },
  { name: 'العصر', nameEn: 'Asr', hour: 15, minute: 30 },
  { name: 'المغرب', nameEn: 'Maghrib', hour: 18, minute: 30 },
  { name: 'العشاء', nameEn: 'Isha', hour: 20, minute: 0 },
];

function getCurrentPrayer(): { current: string | null; next: string; nextTime: string } {
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

export function PrayerTimes(): JSX.Element {
  const [prayer, setPrayer] = useState(getCurrentPrayer());

  useEffect(() => {
    const interval = setInterval(() => setPrayer(getCurrentPrayer()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-edge bg-surface-muted p-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary dark:text-gray-100">
           مواقيت الصلاة
        </span>
        {prayer.next ? (
          <span className="text-[10px] text-text-secondary dark:text-gray-400">
            القادمة: {prayer.next} {prayer.nextTime}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex gap-1">
        {PRAYERS.filter((p) =>
          ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'].includes(p.name),
        ).map((p) => (
          <span
            key={p.name}
            className={`flex-1 rounded-md px-1 py-1 text-center text-[9px] font-medium ${
              prayer.current === p.name
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'bg-white text-text-tertiary dark:bg-gray-800 dark:text-gray-500'
            }`}
          >
            <div>{p.name}</div>
            <div className="text-[8px]">
              {String(p.hour).padStart(2, '0')}:{String(p.minute).padStart(2, '0')}
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}

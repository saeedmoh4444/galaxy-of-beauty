'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Seasonal Reminder Card — seasonal beauty care reminder.
 * From Phase W9: The Small Details.
 *
 * Usage:
 *   <BeautySeasonalReminderCard season="summer" reminders={['جددِي واقي الشمس', 'رطبي بشرتكِ']} />
 */

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const SEASONS: Record<
  Season,
  { emoji: string; title: { ar: string; en: string }; reminders: { ar: string; en: string }[] }
> = {
  spring: {
    emoji: '',
    title: { ar: 'الربيع', en: 'Spring' },
    reminders: [
      { ar: 'جددي روتين التقشير', en: 'Refresh your exfoliation routine' },
      { ar: 'انتقلي لمرطب أخف', en: 'Switch to a lighter moisturizer' },
      { ar: 'اهتمي بالحماية من الشمس', en: 'Focus on sun protection' },
      { ar: 'جربي ألوان باستيل', en: 'Try pastel shades' },
    ],
  },
  summer: {
    emoji: '️',
    title: { ar: 'الصيف', en: 'Summer' },
    reminders: [
      { ar: 'SPF 50+ يومياً', en: 'SPF 50+ daily' },
      { ar: 'مرطب جل خفيف', en: 'Light gel moisturizer' },
      { ar: 'اشربي ماء كثيراً', en: 'Drink plenty of water' },
      { ar: 'تجنبي المكياج الثقيل', en: 'Avoid heavy makeup' },
    ],
  },
  autumn: {
    emoji: '',
    title: { ar: 'الخريف', en: 'Autumn' },
    reminders: [
      { ar: 'استعيدي ترطيب بشرتكِ', en: "Restore your skin's moisture" },
      { ar: 'علاجات ما بعد الصيف', en: 'Post-summer treatments' },
      { ar: 'جربي ألوان دافئة', en: 'Try warm shades' },
      { ar: 'اهتمي بترطيب الشعر', en: 'Focus on hair hydration' },
    ],
  },
  winter: {
    emoji: '️',
    title: { ar: 'الشتاء', en: 'Winter' },
    reminders: [
      { ar: 'مرطب غني', en: 'Rich moisturizer' },
      { ar: 'بلسم شفاه', en: 'Lip balm' },
      { ar: 'قناع ترطيب أسبوعي', en: 'Weekly hydrating mask' },
      { ar: 'احمي بشرتكِ من الهواء الجاف', en: 'Protect your skin from dry air' },
    ],
  },
};

interface BeautySeasonalReminderCardProps {
  season: Season;
  className?: string;
  /** Prefix before the season name in the heading */
  reminderPrefix?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Display locale for season and reminder labels */
  locale?: 'ar' | 'en';
}

export function BeautySeasonalReminderCard({
  season,
  className = '',
  reminderPrefix = 'تذكير ',
  subtitle = 'روتينكِ يتغير مع الفصول',
  locale = 'ar',
}: BeautySeasonalReminderCardProps): JSX.Element {
  const s = SEASONS[season];

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-blue-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {s.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">
          {reminderPrefix}
          {s.title[locale]}
        </h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {s.reminders.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{r[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

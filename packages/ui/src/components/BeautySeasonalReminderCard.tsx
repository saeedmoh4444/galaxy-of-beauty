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

const SEASONS: Record<Season, { emoji: string; title: string; reminders: string[] }> = {
  spring: { emoji: '🌸', title: 'الربيع', reminders: ['جددي روتين التقشير', 'انتقلي لمرطب أخف', 'اهتمي بالحماية من الشمس', 'جربي ألوان باستيل'] },
  summer: { emoji: '☀️', title: 'الصيف', reminders: ['SPF 50+ يومياً', 'مرطب جل خفيف', 'اشربي ماء كثيراً', 'تجنبي المكياج الثقيل'] },
  autumn: { emoji: '🍂', title: 'الخريف', reminders: ['استعيدي ترطيب بشرتكِ', 'علاجات ما بعد الصيف', 'جربي ألوان دافئة', 'اهتمي بترطيب الشعر'] },
  winter: { emoji: '❄️', title: 'الشتاء', reminders: ['مرطب غني', 'بلسم شفاه', 'قناع ترطيب أسبوعي', 'احمي بشرتكِ من الهواء الجاف'] },
};

interface BeautySeasonalReminderCardProps {
  season: Season;
  className?: string;
}

export function BeautySeasonalReminderCard({ season, className = '' }: BeautySeasonalReminderCardProps): JSX.Element {
  const s = SEASONS[season];

  return (
    <div className={cn('rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-blue-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">تذكير {s.title}</h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">روتينكِ يتغير مع الفصول</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {s.reminders.map((r, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">{i + 1}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

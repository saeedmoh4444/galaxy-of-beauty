'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Daily Beauty Tip Card — rotating beauty tip of the day.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <DailyBeautyTipCard />
 */

const TIPS = [
  { emoji: '💧', tip: 'اشربي كوب ماء قبل قهوتكِ الصباحية — بشرتكِ ستشكركِ', category: 'عناية' },
  { emoji: '☀️', tip: 'واقي الشمس حتى في الأيام الغائمة — الأشعة فوق البنفسجية تخترق الغيوم', category: 'حماية' },
  { emoji: '😴', tip: 'نامي على ظهركِ — يمنع تجاعيد الوجه ويحافظ على نضارة البشرة', category: 'صحة' },
  { emoji: '🧴', tip: 'طبقي المرطب على بشرة رطبة — يمتص بشكل أفضل', category: 'عناية' },
  { emoji: '💄', tip: 'جددِي مكياجكِ كل 6 أشهر — المنتجات القديمة تجمع البكتيريا', category: 'صحة' },
  { emoji: '🥒', tip: 'شرائح الخيار الباردة تقلل انتفاخ العينين في 10 دقائق', category: 'طبيعي' },
  { emoji: '🧖‍♀️', tip: 'لا تغسلي وجهكِ بالماء الساخن — الماء الفاتر أفضل للبشرة', category: 'عناية' },
  { emoji: '🍵', tip: 'الشاي الأخضر قبل النوم يساعد في محاربة الالتهابات وتجديد البشرة', category: 'صحة' },
];

interface DailyBeautyTipCardProps {
  className?: string;
}

export function DailyBeautyTipCard({
  className = '',
}: DailyBeautyTipCardProps): JSX.Element {
  const [index] = useState(() => Math.floor(Math.random() * TIPS.length));
  const tip = TIPS[index]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">💡</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
            نصيحة اليوم
          </h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">
            {tip.category}
          </p>
        </div>
      </div>

      {/* Tip card */}
      <div className="mt-3 rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-950">
        <span className="text-3xl" aria-hidden="true">{tip.emoji}</span>
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          {tip.tip}
        </p>
      </div>

      {/* Rotating indicator */}
      <div className="mt-2 flex justify-center gap-1">
        {TIPS.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all',
              i === index % 5 ? 'bg-amber-500 w-3' : 'bg-amber-200 dark:bg-amber-800',
            )}
          />
        ))}
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        💡 نصيحة جديدة كل يوم — تعلمي وطبقي
      </p>
    </div>
  );
}

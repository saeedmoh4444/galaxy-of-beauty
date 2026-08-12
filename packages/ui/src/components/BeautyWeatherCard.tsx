'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Weather Card — weather-based beauty recommendations.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyWeatherCard condition="hot" temp={42} />
 */

type WeatherCondition = 'hot' | 'mild' | 'cold' | 'humid' | 'dusty';

interface WeatherAdvice {
  emoji: string;
  title: string;
  tips: string[];
}

const ADVICE: Record<WeatherCondition, WeatherAdvice> = {
  hot: {
    emoji: '️',
    title: 'حار',
    tips: ['SPF 50+ ضروري', 'مرطب جل خفيف', 'ماء كثير', 'تجنبي المكياج الثقيل'],
  },
  mild: {
    emoji: '️',
    title: 'معتدل',
    tips: ['SPF 30 كافي', 'روتينكِ المعتاد', 'جربي إطلالة جديدة'],
  },
  cold: {
    emoji: '️',
    title: 'بارد',
    tips: ['مرطب غني', 'بلسم شفاه', 'قناع ترطيب', 'ماء دافئ للغسيل'],
  },
  humid: {
    emoji: '',
    title: 'رطب',
    tips: ['منتجات خالية من الزيوت', 'مثبت مكياج', 'ورق نشاف', 'تونر قابض'],
  },
  dusty: {
    emoji: '️',
    title: 'مغبر',
    tips: ['غسول عميق مساءً', 'قناع منقي', 'تجنبي التقشير', 'أحكمي إغلاق المسام'],
  },
};

interface BeautyWeatherCardProps {
  condition: WeatherCondition;
  temp?: number;
  className?: string;
}

export function BeautyWeatherCard({
  condition,
  temp,
  className = '',
}: BeautyWeatherCardProps): JSX.Element {
  const a = ADVICE[condition];

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {a.emoji}
          </span>
          <div>
            <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">طقس الجمال</h4>
            <p className="text-[10px] text-sky-500 dark:text-sky-400">
              {a.title}
              {temp ? ` · ${temp}°C` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {a.tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[8px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{tip}</span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        ️ روتينكِ يتغير مع الطقس — ونحن نذكركِ
      </p>
    </div>
  );
}

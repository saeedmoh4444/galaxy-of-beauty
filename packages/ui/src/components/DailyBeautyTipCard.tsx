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
  {
    emoji: '',
    tip: {
      ar: 'اشربي كوب ماء قبل قهوتكِ الصباحية — بشرتكِ ستشكركِ',
      en: 'Drink a glass of water before your morning coffee — your skin will thank you',
    },
    category: { ar: 'عناية', en: 'Care' },
  },
  {
    emoji: '️',
    tip: {
      ar: 'واقي الشمس حتى في الأيام الغائمة — الأشعة فوق البنفسجية تخترق الغيوم',
      en: 'Sunscreen even on cloudy days — UV rays penetrate clouds',
    },
    category: { ar: 'حماية', en: 'Protection' },
  },
  {
    emoji: '',
    tip: {
      ar: 'نامي على ظهركِ — يمنع تجاعيد الوجه ويحافظ على نضارة البشرة',
      en: 'Sleep on your back — it prevents facial wrinkles and keeps skin fresh',
    },
    category: { ar: 'صحة', en: 'Health' },
  },
  {
    emoji: '',
    tip: {
      ar: 'طبقي المرطب على بشرة رطبة — يمتص بشكل أفضل',
      en: 'Apply moisturizer on damp skin — it absorbs better',
    },
    category: { ar: 'عناية', en: 'Care' },
  },
  {
    emoji: '',
    tip: {
      ar: 'جددِي مكياجكِ كل 6 أشهر — المنتجات القديمة تجمع البكتيريا',
      en: 'Refresh your makeup every 6 months — old products collect bacteria',
    },
    category: { ar: 'صحة', en: 'Health' },
  },
  {
    emoji: '',
    tip: {
      ar: 'شرائح الخيار الباردة تقلل انتفاخ العينين في 10 دقائق',
      en: 'Cold cucumber slices reduce eye puffiness in 10 minutes',
    },
    category: { ar: 'طبيعي', en: 'Natural' },
  },
  {
    emoji: '‍️',
    tip: {
      ar: 'لا تغسلي وجهكِ بالماء الساخن — الماء الفاتر أفضل للبشرة',
      en: 'Do not wash your face with hot water — lukewarm water is better for skin',
    },
    category: { ar: 'عناية', en: 'Care' },
  },
  {
    emoji: '',
    tip: {
      ar: 'الشاي الأخضر قبل النوم يساعد في محاربة الالتهابات وتجديد البشرة',
      en: 'Green tea before bed helps fight inflammation and renew skin',
    },
    category: { ar: 'صحة', en: 'Health' },
  },
];

interface DailyBeautyTipCardProps {
  className?: string;
  /** Card heading */
  title?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for tip and category labels */
  locale?: 'ar' | 'en';
}

export function DailyBeautyTipCard({
  className = '',
  title = 'نصيحة اليوم',
  footerText = 'نصيحة جديدة كل يوم — تعلمي وطبقي',
  locale = 'ar',
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
        <span className="text-lg" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{tip.category[locale]}</p>
        </div>
      </div>

      {/* Tip card */}
      <div className="mt-3 rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-950">
        <span className="text-3xl" aria-hidden="true">
          {tip.emoji}
        </span>
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          {tip.tip[locale]}
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
        {footerText}
      </p>
    </div>
  );
}

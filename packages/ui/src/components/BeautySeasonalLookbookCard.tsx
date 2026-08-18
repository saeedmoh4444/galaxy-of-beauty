'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Seasonal Lookbook Card — seasonal beauty trends & looks.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautySeasonalLookbookCard season="summer" looks={[{ emoji: '️', name: 'إطلالة الصيف' }]} />
 */

type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'ramadan' | 'eid';

interface Look {
  emoji: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
}

const SEASONAL: Record<
  Season,
  { emoji: string; title: { ar: string; en: string }; looks: Look[] }
> = {
  spring: {
    emoji: '',
    title: { ar: 'ربيع 2026', en: 'Spring 2026' },
    looks: [
      {
        emoji: '',
        name: { ar: 'إطلالة زهرية', en: 'Floral look' },
        description: {
          ar: 'ألوان باستيل ومكياج وردي ناعم',
          en: 'Pastel colors and soft pink makeup',
        },
      },
      {
        emoji: '',
        name: { ar: 'بشرة متوهجة', en: 'Glowing skin' },
        description: { ar: 'ترطيب عميق وإشراقة طبيعية', en: 'Deep hydration and natural radiance' },
      },
    ],
  },
  summer: {
    emoji: '️',
    title: { ar: 'صيف 2026', en: 'Summer 2026' },
    looks: [
      {
        emoji: '️',
        name: { ar: 'إطلالة الشاطئ', en: 'Beach look' },
        description: { ar: 'مكياج مقاوم للماء وواقي شمس', en: 'Waterproof makeup and sunscreen' },
      },
      {
        emoji: '',
        name: { ar: 'شعر منعش', en: 'Fresh hair' },
        description: { ar: 'تسريحات مرفوعة وخفيفة', en: 'Light, updo styles' },
      },
    ],
  },
  autumn: {
    emoji: '',
    title: { ar: 'خريف 2026', en: 'Autumn 2026' },
    looks: [
      {
        emoji: '',
        name: { ar: 'ألوان دافئة', en: 'Warm colors' },
        description: { ar: 'درجات برونزية وبنية في المكياج', en: 'Bronzy brown tones in makeup' },
      },
      {
        emoji: '',
        name: { ar: 'عناية بالشعر', en: 'Hair care' },
        description: { ar: 'ترطيب عميق بعد الصيف', en: 'Deep hydration after summer' },
      },
    ],
  },
  winter: {
    emoji: '️',
    title: { ar: 'شتاء 2026', en: 'Winter 2026' },
    looks: [
      {
        emoji: '',
        name: { ar: 'إطلالة الشتاء', en: 'Winter look' },
        description: { ar: 'مكياج دخاني وألوان داكنة', en: 'Smoky makeup and dark colors' },
      },
      {
        emoji: '',
        name: { ar: 'حماية البشرة', en: 'Skin protection' },
        description: { ar: 'مرطبات غنية ضد الجفاف', en: 'Rich moisturizers against dryness' },
      },
    ],
  },
  ramadan: {
    emoji: '',
    title: { ar: 'رمضان', en: 'Ramadan' },
    looks: [
      {
        emoji: '',
        name: { ar: 'إطلالة رمضانية', en: 'Ramadan look' },
        description: { ar: 'مكياج خفيف يدوم طويلاً', en: 'Light long-lasting makeup' },
      },
      {
        emoji: '',
        name: { ar: 'عناية ليلية', en: 'Night care' },
        description: {
          ar: 'روتين عناية مكثف بعد الإفطار',
          en: 'Intensive care routine after iftar',
        },
      },
    ],
  },
  eid: {
    emoji: '',
    title: { ar: 'العيد', en: 'Eid' },
    looks: [
      {
        emoji: '',
        name: { ar: 'إطلالة العيد', en: 'Eid look' },
        description: { ar: 'مكياج احتفالي جريء', en: 'Bold festive makeup' },
      },
      {
        emoji: '',
        name: { ar: 'تسريحة العيد', en: 'Eid hairstyle' },
        description: { ar: 'تسريحات أنيقة للمناسبات', en: 'Elegant occasion hairstyles' },
      },
    ],
  },
};

interface BeautySeasonalLookbookCardProps {
  season: Season;
  className?: string;
  /** Header title */
  title?: string;
  /** Locale for internal seasonal data strings */
  locale?: 'ar' | 'en';
}

export function BeautySeasonalLookbookCard({
  season,
  className = '',
  title = 'دليل الإطلالات',
  locale = 'ar',
}: BeautySeasonalLookbookCardProps): JSX.Element {
  const s = SEASONAL[season];

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{s.emoji}</span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{s.title[locale]}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {s.looks.map((look) => (
          <div
            key={look.name.ar}
            className="flex items-start gap-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-950"
          >
            <span className="text-2xl shrink-0">{look.emoji}</span>
            <div>
              <p className="text-xs font-bold text-pink-800 dark:text-pink-200">
                {look.name[locale]}
              </p>
              <p className="text-[10px] text-pink-600 dark:text-pink-400">
                {look.description[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

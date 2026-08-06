'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Seasonal Lookbook Card — seasonal beauty trends & looks.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautySeasonalLookbookCard season="summer" looks={[{ emoji: '☀️', name: 'إطلالة الصيف' }]} />
 */

type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'ramadan' | 'eid';

interface Look { emoji: string; name: string; description: string; }

const SEASONAL: Record<Season, { emoji: string; title: string; looks: Look[] }> = {
  spring: { emoji: '🌸', title: 'ربيع 2026', looks: [{ emoji: '🌺', name: 'إطلالة زهرية', description: 'ألوان باستيل ومكياج وردي ناعم' }, { emoji: '💐', name: 'بشرة متوهجة', description: 'ترطيب عميق وإشراقة طبيعية' }] },
  summer: { emoji: '☀️', title: 'صيف 2026', looks: [{ emoji: '🏖️', name: 'إطلالة الشاطئ', description: 'مكياج مقاوم للماء وواقي شمس' }, { emoji: '🌊', name: 'شعر منعش', description: 'تسريحات مرفوعة وخفيفة' }] },
  autumn: { emoji: '🍂', title: 'خريف 2026', looks: [{ emoji: '🍁', name: 'ألوان دافئة', description: 'درجات برونزية وبنية في المكياج' }, { emoji: '🧣', name: 'عناية بالشعر', description: 'ترطيب عميق بعد الصيف' }] },
  winter: { emoji: '❄️', title: 'شتاء 2026', looks: [{ emoji: '🎄', name: 'إطلالة الشتاء', description: 'مكياج دخاني وألوان داكنة' }, { emoji: '🧴', name: 'حماية البشرة', description: 'مرطبات غنية ضد الجفاف' }] },
  ramadan: { emoji: '🌙', title: 'رمضان', looks: [{ emoji: '🕌', name: 'إطلالة رمضانية', description: 'مكياج خفيف يدوم طويلاً' }, { emoji: '✨', name: 'عناية ليلية', description: 'روتين عناية مكثف بعد الإفطار' }] },
  eid: { emoji: '🎉', title: 'العيد', looks: [{ emoji: '🌟', name: 'إطلالة العيد', description: 'مكياج احتفالي جريء' }, { emoji: '💫', name: 'تسريحة العيد', description: 'تسريحات أنيقة للمناسبات' }] },
};

interface BeautySeasonalLookbookCardProps { season: Season; className?: string; }

export function BeautySeasonalLookbookCard({ season, className = '' }: BeautySeasonalLookbookCardProps): JSX.Element {
  const s = SEASONAL[season];

  return (
    <div className={cn('rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{s.emoji}</span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">دليل الإطلالات</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{s.title}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {s.looks.map((look) => (
          <div key={look.name} className="flex items-start gap-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
            <span className="text-2xl shrink-0">{look.emoji}</span>
            <div>
              <p className="text-xs font-bold text-pink-800 dark:text-pink-200">{look.name}</p>
              <p className="text-[10px] text-pink-600 dark:text-pink-400">{look.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

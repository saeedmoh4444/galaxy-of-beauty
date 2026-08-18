'use client';

import { cn } from '@galaxy/shared';

/**
 * Complimentary Amenity Badge — free essentials available in salon changing rooms.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <ComplimentaryAmenityBadge amenities={['hair_tie', 'bobby_pins', 'deodorant', 'phone_charger']} />
 */

type Amenity =
  | 'hair_tie'
  | 'bobby_pins'
  | 'deodorant'
  | 'phone_charger'
  | 'sanitary_pads'
  | 'perfume'
  | 'wet_wipes'
  | 'sewing_kit';

interface AmenityDef {
  emoji: string;
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const AMENITIES: AmenityDef[] = [
  {
    emoji: '',
    label: { ar: 'ربطة شعر', en: 'Hair tie' },
    detail: { ar: 'ربطات شعر جديدة', en: 'Fresh hair ties' },
  },
  {
    emoji: '',
    label: { ar: 'دبابيس شعر', en: 'Bobby pins' },
    detail: { ar: 'بكل الأحجام', en: 'In all sizes' },
  },
  {
    emoji: '',
    label: { ar: 'مزيل عرق', en: 'Deodorant' },
    detail: { ar: 'أنواع خالية من العطور', en: 'Fragrance-free options' },
  },
  {
    emoji: '',
    label: { ar: 'شاحن جوال', en: 'Phone charger' },
    detail: { ar: 'جميع أنواع الشواحن', en: 'All charger types' },
  },
  {
    emoji: '🩹',
    label: { ar: 'فوط صحية', en: 'Sanitary pads' },
    detail: { ar: 'مجاناً في دورة المياه', en: 'Free in the restroom' },
  },
  {
    emoji: '',
    label: { ar: 'عطر', en: 'Perfume' },
    detail: { ar: 'عطور فاخرة للمسة أخيرة', en: 'Luxury scents for a final touch' },
  },
  {
    emoji: '',
    label: { ar: 'مناديل مبللة', en: 'Wet wipes' },
    detail: { ar: 'مناديل منعشة', en: 'Refreshing wipes' },
  },
  {
    emoji: '🪡',
    label: { ar: 'عدة خياطة', en: 'Sewing kit' },
    detail: { ar: 'للطوارئ الصغيرة', en: 'For small emergencies' },
  },
];

interface ComplimentaryAmenityBadgeProps {
  amenities: Amenity[];
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal amenity data strings */
  locale?: 'ar' | 'en';
}

export function ComplimentaryAmenityBadge({
  amenities,
  className = '',
  title = 'كماليات مجانية',
  subtitle = 'كل ما تحتاجينه في غرفة التغيير — مجاناً',
  footerText = 'لأن التفاصيل الصغيرة تصنع الفرق',
  locale = 'ar',
}: ComplimentaryAmenityBadgeProps): JSX.Element | null {
  if (!amenities.length) return null;

  const map: Record<Amenity, { ar: string; en: string }> = {
    hair_tie: { ar: 'ربطة شعر', en: 'Hair tie' },
    bobby_pins: { ar: 'دبابيس شعر', en: 'Bobby pins' },
    deodorant: { ar: 'مزيل عرق', en: 'Deodorant' },
    phone_charger: { ar: 'شاحن جوال', en: 'Phone charger' },
    sanitary_pads: { ar: 'فوط صحية', en: 'Sanitary pads' },
    perfume: { ar: 'عطر', en: 'Perfume' },
    wet_wipes: { ar: 'مناديل مبللة', en: 'Wet wipes' },
    sewing_kit: { ar: 'عدة خياطة', en: 'Sewing kit' },
  };

  const active = amenities
    .map((k) => AMENITIES.find((a) => a.label.ar === map[k].ar))
    .filter(Boolean) as AmenityDef[];

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>

      {/* Amenities grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((a) => (
          <div
            key={a.label.ar}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {a.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-pink-800 dark:text-pink-200 truncate">
                {a.label[locale]}
              </p>
              <p className="text-[9px] text-pink-600 dark:text-pink-400 truncate">
                {a.detail[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

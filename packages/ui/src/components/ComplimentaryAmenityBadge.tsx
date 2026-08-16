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
  label: string;
  detail: string;
}

const AMENITIES: AmenityDef[] = [
  { emoji: '', label: 'ربطة شعر', detail: 'ربطات شعر جديدة' },
  { emoji: '', label: 'دبابيس شعر', detail: 'بكل الأحجام' },
  { emoji: '', label: 'مزيل عرق', detail: 'أنواع خالية من العطور' },
  { emoji: '', label: 'شاحن جوال', detail: 'جميع أنواع الشواحن' },
  { emoji: '🩹', label: 'فوط صحية', detail: 'مجاناً في دورة المياه' },
  { emoji: '', label: 'عطر', detail: 'عطور فاخرة للمسة أخيرة' },
  { emoji: '', label: 'مناديل مبللة', detail: 'مناديل منعشة' },
  { emoji: '🪡', label: 'عدة خياطة', detail: 'للطوارئ الصغيرة' },
];

interface ComplimentaryAmenityBadgeProps {
  amenities: Amenity[];
  className?: string;
}

export function ComplimentaryAmenityBadge({
  amenities,
  className = '',
}: ComplimentaryAmenityBadgeProps): JSX.Element | null {
  if (!amenities.length) return null;

  const map: Record<Amenity, string> = {
    hair_tie: 'ربطة شعر',
    bobby_pins: 'دبابيس شعر',
    deodorant: 'مزيل عرق',
    phone_charger: 'شاحن جوال',
    sanitary_pads: 'فوط صحية',
    perfume: 'عطر',
    wet_wipes: 'مناديل مبللة',
    sewing_kit: 'عدة خياطة',
  };

  const active = amenities
    .map((k) => AMENITIES.find((a) => a.label === map[k]))
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
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">كماليات مجانية</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">
            كل ما تحتاجينه في غرفة التغيير — مجاناً
          </p>
        </div>
      </div>

      {/* Amenities grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((a) => (
          <div
            key={a.label}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {a.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-pink-800 dark:text-pink-200 truncate">
                {a.label}
              </p>
              <p className="text-[9px] text-pink-600 dark:text-pink-400 truncate">{a.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        لأن التفاصيل الصغيرة تصنع الفرق
      </p>
    </div>
  );
}

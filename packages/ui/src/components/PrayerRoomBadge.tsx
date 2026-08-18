'use client';

import { cn } from '@galaxy/shared';

/**
 * Prayer Room Badge — signals prayer facilities at partner salons.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <PrayerRoomBadge amenities={['prayer_mats', 'abayas', 'quran', 'qibla']} />
 */

type PrayerAmenity =
  'prayer_mats' | 'abayas' | 'quran' | 'qibla' | 'wudu_area' | 'private_area' | 'prayer_times';

interface AmenityDef {
  emoji: string;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
}

const AMENITIES: AmenityDef[] = [
  {
    emoji: '',
    label: { ar: 'سجادات صلاة', en: 'Prayer mats' },
    description: { ar: 'سجادات نظيفة ومعطرة', en: 'Clean and scented prayer mats' },
  },
  {
    emoji: '',
    label: { ar: 'عبايات', en: 'Abayas' },
    description: { ar: 'عبايات نظيفة للإعارة', en: 'Clean abayas available to borrow' },
  },
  {
    emoji: '',
    label: { ar: 'مصحف', en: 'Quran' },
    description: { ar: 'قرآن كريم متوفر', en: 'Holy Quran available' },
  },
  {
    emoji: '',
    label: { ar: 'اتجاه القبلة', en: 'Qibla direction' },
    description: { ar: 'علامة اتجاه القبلة واضحة', en: 'Clear qibla direction marker' },
  },
  {
    emoji: '',
    label: { ar: 'مكان وضوء', en: 'Wudu area' },
    description: { ar: 'مكان مخصص للوضوء', en: 'Dedicated wudu area' },
  },
  {
    emoji: '',
    label: { ar: 'مساحة خاصة', en: 'Private space' },
    description: { ar: 'غرفة منفصلة للصلاة', en: 'Separate room for prayer' },
  },
  {
    emoji: '',
    label: { ar: 'مواقيت الصلاة', en: 'Prayer times' },
    description: { ar: 'منبه لمواقيت الصلاة', en: 'Prayer time reminder' },
  },
];

interface PrayerRoomBadgeProps {
  amenities: PrayerAmenity[];
  /** Show next prayer time */
  nextPrayer?: { name: string; time: string };
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label prefixing the next prayer time */
  prayerDueLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal amenity data strings */
  locale?: 'ar' | 'en';
}

export function PrayerRoomBadge({
  amenities,
  nextPrayer,
  className = '',
  title = 'مصلى متوفر',
  subtitle = 'كل ما تحتاجينه للصلاة براحة',
  prayerDueLabel = 'يحين بعد',
  footerText = 'راحتكِ الروحية جزء من جمالكِ',
  locale = 'ar',
}: PrayerRoomBadgeProps): JSX.Element | null {
  if (!amenities.length) return null;

  // Map the amenity key to the definition
  const getAmenity = (key: PrayerAmenity): AmenityDef | undefined =>
    AMENITIES.find((a) => {
      // match by normalized key
      const map: Record<PrayerAmenity, string> = {
        prayer_mats: 'سجادات صلاة',
        abayas: 'عبايات',
        quran: 'مصحف',
        qibla: 'اتجاه القبلة',
        wudu_area: 'مكان وضوء',
        private_area: 'مساحة خاصة',
        prayer_times: 'مواقيت الصلاة',
      };
      return a.label.ar === map[key];
    });

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>

      {/* Amenities grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {amenities.map((key) => {
          const def = getAmenity(key);
          if (!def) return null;

          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-950"
            >
              <span className="text-xs" aria-hidden="true">
                {def.emoji}
              </span>
              <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-200">
                {def.label[locale]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next prayer time */}
      {nextPrayer && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-2.5 dark:from-emerald-950 dark:to-teal-950">
          <div className="flex items-center gap-2">
            <span className="text-sm" aria-hidden="true"></span>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
                {nextPrayer.name}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {prayerDueLabel} {nextPrayer.time}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-black/30 dark:text-emerald-300">
            {nextPrayer.time}
          </span>
        </div>
      )}

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

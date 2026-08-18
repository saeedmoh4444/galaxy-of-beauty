'use client';

import { cn } from '@galaxy/shared';

/**
 * Quiet Corner Badge — child-friendly corner in partner salons for moms.
 * From Phase W9: The Small Details — Child-Friendly Corner.
 * Also ties to W8: Accessibility for mothers.
 *
 * Usage:
 *   <QuietCornerBadge amenities={['toys', 'coloring', 'tablet', 'play_area']} />
 */

type CornerAmenity =
  | 'toys'
  | 'coloring'
  | 'tablet'
  | 'play_area'
  | 'baby_chair'
  | 'changing_table'
  | 'nursing_area'
  | 'kids_drinks';

interface AmenityDef {
  emoji: string;
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const AMENITIES: AmenityDef[] = [
  {
    emoji: '',
    label: { ar: 'ألعاب', en: 'Toys' },
    detail: { ar: 'ألعاب آمنة ومناسبة للأطفال', en: 'Safe, age-appropriate toys' },
  },
  {
    emoji: '',
    label: { ar: 'تلوين', en: 'Coloring' },
    detail: { ar: 'دفاتر تلوين وأقلام ملونة', en: 'Coloring books and crayons' },
  },
  {
    emoji: '',
    label: { ar: 'تابلت', en: 'Tablet' },
    detail: { ar: 'تابلت تعليمي مع سماعات', en: 'Educational tablet with headphones' },
  },
  {
    emoji: '',
    label: { ar: 'ركن ألعاب', en: 'Play area' },
    detail: { ar: 'مساحة لعب آمنة ومرئية', en: 'Safe, visible play space' },
  },
  {
    emoji: '🪑',
    label: { ar: 'كرسي أطفال', en: 'Baby chair' },
    detail: { ar: 'كرسي طعام للأطفال الصغار', en: 'High chair for toddlers' },
  },
  {
    emoji: '',
    label: { ar: 'طاولة تغيير', en: 'Changing table' },
    detail: { ar: 'طاولة تغيير حفاضات نظيفة', en: 'Clean diaper changing table' },
  },
  {
    emoji: '',
    label: { ar: 'ركن رضاعة', en: 'Nursing area' },
    detail: { ar: 'مكان خاص ومريح للرضاعة', en: 'Private, comfortable nursing area' },
  },
  {
    emoji: '',
    label: { ar: 'مشروبات أطفال', en: 'Kids drinks' },
    detail: { ar: 'عصائر وحليب مجاني للأطفال', en: 'Free juices and milk for kids' },
  },
];

interface QuietCornerBadgeProps {
  amenities: CornerAmenity[];
  /** Staff member assigned to watch kids */
  supervised?: boolean;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Supervised badge label */
  supervisedLabel?: string;
  /** Supervised note text */
  supervisedNote?: string;
  /** Footer encouragement text */
  footerText?: string;
  /** Locale for internal amenity data strings */
  locale?: 'ar' | 'en';
}

export function QuietCornerBadge({
  amenities,
  supervised = false,
  className = '',
  title = 'ركن الأطفال',
  subtitle = 'لأن الأم تحتاج وقتاً لنفسها',
  supervisedLabel = '‍ مراقب',
  supervisedNote = '‍ موظفة مخصصة لمراقبة الأطفال — اطمئني على صغاركِ',
  footerText = 'أنتِ تستحقين وقتاً لنفسكِ — وصغاركِ في أيدٍ أمينة',
  locale = 'ar',
}: QuietCornerBadgeProps): JSX.Element | null {
  if (!amenities.length) return null;

  const map: Record<CornerAmenity, string> = {
    toys: 'ألعاب',
    coloring: 'تلوين',
    tablet: 'تابلت',
    play_area: 'ركن ألعاب',
    baby_chair: 'كرسي أطفال',
    changing_table: 'طاولة تغيير',
    nursing_area: 'ركن رضاعة',
    kids_drinks: 'مشروبات أطفال',
  };

  const active = amenities
    .map((k) => AMENITIES.find((a) => a.label.ar === map[k]))
    .filter(Boolean) as AmenityDef[];

  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
        {supervised && (
          <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {supervisedLabel}
          </span>
        )}
      </div>

      {/* Amenities grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((a) => (
          <div
            key={a.label.ar}
            className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-2 dark:bg-orange-950"
          >
            <span className="text-sm" aria-hidden="true">
              {a.emoji}
            </span>
            <div>
              <p className="text-[10px] font-bold text-orange-800 dark:text-orange-200">
                {a.label[locale]}
              </p>
              <p className="text-[9px] text-orange-600 dark:text-orange-400">{a.detail[locale]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Supervised note */}
      {supervised && (
        <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
          <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
            {supervisedNote}
          </p>
        </div>
      )}

      {/* Mom encouragement */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

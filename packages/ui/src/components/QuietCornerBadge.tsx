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
  label: string;
  detail: string;
}

const AMENITIES: AmenityDef[] = [
  { emoji: '', label: 'ألعاب', detail: 'ألعاب آمنة ومناسبة للأطفال' },
  { emoji: '', label: 'تلوين', detail: 'دفاتر تلوين وأقلام ملونة' },
  { emoji: '', label: 'تابلت', detail: 'تابلت تعليمي مع سماعات' },
  { emoji: '', label: 'ركن ألعاب', detail: 'مساحة لعب آمنة ومرئية' },
  { emoji: '🪑', label: 'كرسي أطفال', detail: 'كرسي طعام للأطفال الصغار' },
  { emoji: '', label: 'طاولة تغيير', detail: 'طاولة تغيير حفاضات نظيفة' },
  { emoji: '', label: 'ركن رضاعة', detail: 'مكان خاص ومريح للرضاعة' },
  { emoji: '', label: 'مشروبات أطفال', detail: 'عصائر وحليب مجاني للأطفال' },
];

interface QuietCornerBadgeProps {
  amenities: CornerAmenity[];
  /** Staff member assigned to watch kids */
  supervised?: boolean;
  className?: string;
}

export function QuietCornerBadge({
  amenities,
  supervised = false,
  className = '',
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
    .map((k) => AMENITIES.find((a) => a.label === map[k]))
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
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">ركن الأطفال</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">
            لأن الأم تحتاج وقتاً لنفسها
          </p>
        </div>
        {supervised && (
          <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            ‍ مراقب
          </span>
        )}
      </div>

      {/* Amenities grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((a) => (
          <div
            key={a.label}
            className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-2 dark:bg-orange-950"
          >
            <span className="text-sm" aria-hidden="true">
              {a.emoji}
            </span>
            <div>
              <p className="text-[10px] font-bold text-orange-800 dark:text-orange-200">
                {a.label}
              </p>
              <p className="text-[9px] text-orange-600 dark:text-orange-400">{a.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Supervised note */}
      {supervised && (
        <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
          <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
            ‍ موظفة مخصصة لمراقبة الأطفال — اطمئني على صغاركِ
          </p>
        </div>
      )}

      {/* Mom encouragement */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         أنتِ تستحقين وقتاً لنفسكِ — وصغاركِ في أيدٍ أمينة
      </p>
    </div>
  );
}

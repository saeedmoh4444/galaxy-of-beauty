'use client';

import { cn } from '@galaxy/shared';

/**
 * Wheelchair Accessible Badge — detailed wheelchair accessibility features.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <WheelchairAccessibleBadge features={['wide_doors', 'elevator', 'accessible_bathroom']} />
 */

type AccessFeature =
  | 'wide_doors'
  | 'elevator'
  | 'accessible_bathroom'
  | 'low_counter'
  | 'parking'
  | 'ramp'
  | 'turning_space'
  | 'staff_assistance';

interface FeatureDef {
  emoji: string;
  label: string;
  detail: string;
}

const FEATURES: Record<AccessFeature, FeatureDef> = {
  wide_doors: { emoji: '', label: 'أبواب واسعة', detail: '90 سم عرض الأبواب' },
  elevator: { emoji: '', label: 'مصعد', detail: 'مصعد يتسع للكرسي' },
  accessible_bathroom: { emoji: '', label: 'دورة مياه مجهزة', detail: 'مقابض ومساحة للكرسي' },
  low_counter: { emoji: '', label: 'طاولة منخفضة', detail: 'طاولة استقبال منخفضة' },
  parking: { emoji: '🅿️', label: 'موقف مخصص', detail: 'موقف قريب من المدخل' },
  ramp: { emoji: '', label: 'منحدر', detail: 'منحدر بديل عن الدرج' },
  turning_space: { emoji: '', label: 'مساحة دوران', detail: 'مساحة 150 سم للدوران' },
  staff_assistance: { emoji: '‍', label: 'مساعدة الموظفات', detail: 'موظفات مدربات للمساعدة' },
};

interface WheelchairAccessibleBadgeProps {
  features: AccessFeature[];
  className?: string;
}

export function WheelchairAccessibleBadge({
  features,
  className = '',
}: WheelchairAccessibleBadgeProps): JSX.Element | null {
  if (!features.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">
            مهيأ للكراسي المتحركة
          </h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            {features.length} ميزات إتاحة
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {features.map((f) => {
          const def = FEATURES[f];
          return (
            <div
              key={f}
              className="flex items-start gap-2 rounded-lg bg-blue-50 px-2.5 py-2 dark:bg-blue-950"
            >
              <span className="text-sm shrink-0" aria-hidden="true">
                {def.emoji}
              </span>
              <div>
                <p className="text-[10px] font-bold text-blue-800 dark:text-blue-200">
                  {def.label}
                </p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400">{def.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[9px] text-blue-600 dark:text-blue-400">
        الوصول حق للجميع — بدون استثناء
      </p>
    </div>
  );
}

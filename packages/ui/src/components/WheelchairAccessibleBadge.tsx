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
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const FEATURES: Record<AccessFeature, FeatureDef> = {
  wide_doors: {
    emoji: '',
    label: { ar: 'أبواب واسعة', en: 'Wide doors' },
    detail: { ar: '90 سم عرض الأبواب', en: '90 cm door width' },
  },
  elevator: {
    emoji: '',
    label: { ar: 'مصعد', en: 'Elevator' },
    detail: { ar: 'مصعد يتسع للكرسي', en: 'Elevator fits a wheelchair' },
  },
  accessible_bathroom: {
    emoji: '',
    label: { ar: 'دورة مياه مجهزة', en: 'Accessible bathroom' },
    detail: { ar: 'مقابض ومساحة للكرسي', en: 'Grab bars and wheelchair space' },
  },
  low_counter: {
    emoji: '',
    label: { ar: 'طاولة منخفضة', en: 'Low counter' },
    detail: { ar: 'طاولة استقبال منخفضة', en: 'Low reception counter' },
  },
  parking: {
    emoji: '🅿️',
    label: { ar: 'موقف مخصص', en: 'Reserved parking' },
    detail: { ar: 'موقف قريب من المدخل', en: 'Parking near the entrance' },
  },
  ramp: {
    emoji: '',
    label: { ar: 'منحدر', en: 'Ramp' },
    detail: { ar: 'منحدر بديل عن الدرج', en: 'Ramp alternative to stairs' },
  },
  turning_space: {
    emoji: '',
    label: { ar: 'مساحة دوران', en: 'Turning space' },
    detail: { ar: 'مساحة 150 سم للدوران', en: '150 cm turning space' },
  },
  staff_assistance: {
    emoji: '‍',
    label: { ar: 'مساعدة الموظفات', en: 'Staff assistance' },
    detail: { ar: 'موظفات مدربات للمساعدة', en: 'Trained staff to help' },
  },
};

interface WheelchairAccessibleBadgeProps {
  features: AccessFeature[];
  className?: string;
  /** Card heading */
  title?: string;
  /** Suffix after the features count */
  accessibilityCountText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for feature labels and details */
  locale?: 'ar' | 'en';
}

export function WheelchairAccessibleBadge({
  features,
  className = '',
  title = 'مهيأ للكراسي المتحركة',
  accessibilityCountText = 'ميزات إتاحة',
  footerText = 'الوصول حق للجميع — بدون استثناء',
  locale = 'ar',
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
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            {features.length} {accessibilityCountText}
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
                  {def.label[locale]}
                </p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400">{def.detail[locale]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[9px] text-blue-600 dark:text-blue-400">{footerText}</p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Cognitive Accessibility Badge — signals cognitive-friendly salon features.
 * From Phase W8: Accessibility & Inclusivity — Neurodivergent-Friendly.
 *
 * Usage:
 *   <CognitiveAccessibilityBadge features={['simple_menu', 'visual_schedule', 'clear_signage']} />
 */

type CogFeature =
  | 'simple_menu'
  | 'visual_schedule'
  | 'clear_signage'
  | 'quiet_space'
  | 'familiar_staff'
  | 'extended_time';

interface CogDef {
  emoji: string;
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const FEATURES: CogDef[] = [
  {
    emoji: '',
    label: { ar: 'قائمة مبسطة', en: 'Simple menu' },
    detail: { ar: 'خيارات واضحة بدون تعقيد', en: 'Clear options without complexity' },
  },
  {
    emoji: '️',
    label: { ar: 'جدول مرئي', en: 'Visual schedule' },
    detail: { ar: 'صور توضح كل خطوة قبل البدء', en: 'Images explain each step before you start' },
  },
  {
    emoji: '',
    label: { ar: 'لافتات واضحة', en: 'Clear signage' },
    detail: { ar: 'إشارات بسيطة ومفهومة', en: 'Simple, easy-to-understand signs' },
  },
  {
    emoji: '',
    label: { ar: 'مساحة هادئة', en: 'Quiet space' },
    detail: { ar: 'مكان للاستراحة عند الحاجة', en: 'A place to rest when needed' },
  },
  {
    emoji: '‍',
    label: { ar: 'طاقم مألوف', en: 'Familiar staff' },
    detail: { ar: 'نفس الخبيرة في كل زيارة', en: 'The same technician at every visit' },
  },
  {
    emoji: '',
    label: { ar: 'وقت ممتد', en: 'Extended time' },
    detail: { ar: 'مواعيد أطول بدون استعجال', en: 'Longer appointments without rushing' },
  },
];

interface CognitiveAccessibilityBadgeProps {
  features: CogFeature[];
  className?: string;
  /** Badge heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for feature labels and details */
  locale?: 'ar' | 'en';
}

export function CognitiveAccessibilityBadge({
  features,
  className = '',
  title = 'صديق للإدراك',
  subtitle = 'ميزات تسهل التجربة على الجميع',
  footerText = 'كل عقل جميل بطريقته',
  locale = 'ar',
}: CognitiveAccessibilityBadgeProps): JSX.Element | null {
  if (!features.length) return null;

  const map: Record<CogFeature, string> = {
    simple_menu: 'قائمة مبسطة',
    visual_schedule: 'جدول مرئي',
    clear_signage: 'لافتات واضحة',
    quiet_space: 'مساحة هادئة',
    familiar_staff: 'طاقم مألوف',
    extended_time: 'وقت ممتد',
  };

  const active = features
    .map((k) => FEATURES.find((f) => f.label.ar === map[k]))
    .filter(Boolean) as CogDef[];

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((f) => (
          <div
            key={f.label.ar}
            className="flex items-start gap-2 rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{f.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                {f.label[locale]}
              </p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{f.detail[locale]}</p>
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

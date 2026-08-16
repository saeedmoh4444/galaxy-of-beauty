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
  label: string;
  detail: string;
}

const FEATURES: CogDef[] = [
  { emoji: '', label: 'قائمة مبسطة', detail: 'خيارات واضحة بدون تعقيد' },
  { emoji: '️', label: 'جدول مرئي', detail: 'صور توضح كل خطوة قبل البدء' },
  { emoji: '', label: 'لافتات واضحة', detail: 'إشارات بسيطة ومفهومة' },
  { emoji: '', label: 'مساحة هادئة', detail: 'مكان للاستراحة عند الحاجة' },
  { emoji: '‍', label: 'طاقم مألوف', detail: 'نفس الخبيرة في كل زيارة' },
  { emoji: '', label: 'وقت ممتد', detail: 'مواعيد أطول بدون استعجال' },
];

interface CognitiveAccessibilityBadgeProps {
  features: CogFeature[];
  className?: string;
}

export function CognitiveAccessibilityBadge({
  features,
  className = '',
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
    .map((k) => FEATURES.find((f) => f.label === map[k]))
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
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">صديق للإدراك</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">
            ميزات تسهل التجربة على الجميع
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {active.map((f) => (
          <div
            key={f.label}
            className="flex items-start gap-2 rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{f.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">{f.label}</p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        كل عقل جميل بطريقته
      </p>
    </div>
  );
}

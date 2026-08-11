'use client';

import { cn } from '@galaxy/shared';

/**
 * Hearing Assistance Badge — signals hearing loop & communication support.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <HearingAssistanceBadge features={['hearing_loop', 'written_communication', 'visual_alerts']} />
 */

type HearingFeature =
  | 'hearing_loop'
  | 'written_communication'
  | 'visual_alerts'
  | 'lip_reading'
  | 'sign_language'
  | 'quiet_environment';

interface FeatureDef {
  emoji: string;
  label: string;
  detail: string;
}

const FEATURES: Record<HearingFeature, FeatureDef> = {
  hearing_loop: { emoji: '🦻', label: 'حلقة سمعية', detail: 'نظام تضخيم صوت للأجهزة السمعية' },
  written_communication: { emoji: '📝', label: 'تواصل كتابي', detail: 'ورقة وقلم للتواصل الكتابي' },
  visual_alerts: { emoji: '💡', label: 'تنبيهات بصرية', detail: 'إشعارات ضوئية بدل الصوتية' },
  lip_reading: { emoji: '👄', label: 'قراءة شفاه', detail: 'خبيرات يتحدثن بوضوح للقراءة' },
  sign_language: { emoji: '🤟', label: 'لغة إشارة', detail: 'خبيرات بلغة الإشارة' },
  quiet_environment: { emoji: '🤫', label: 'بيئة هادئة', detail: 'ضوضاء منخفضة للتركيز' },
};

interface HearingAssistanceBadgeProps {
  features: HearingFeature[];
  className?: string;
}

export function HearingAssistanceBadge({
  features,
  className = '',
}: HearingAssistanceBadgeProps): JSX.Element | null {
  if (!features.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🦻
        </span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">مساعدة سمعية</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">
            {features.length} وسائل دعم سمعي
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {features.map((f) => {
          const def = FEATURES[f];
          return (
            <div
              key={f}
              className="flex items-start gap-2 rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950"
            >
              <span className="text-sm shrink-0" aria-hidden="true">
                {def.emoji}
              </span>
              <div>
                <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">{def.label}</p>
                <p className="text-[9px] text-sky-600 dark:text-sky-400">{def.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[9px] text-sky-600 dark:text-sky-400">
        🦻 نسمعكِ بكل الطرق — الجمال للجميع
      </p>
    </div>
  );
}

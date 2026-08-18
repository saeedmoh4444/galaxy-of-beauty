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
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const FEATURES: Record<HearingFeature, FeatureDef> = {
  hearing_loop: {
    emoji: '',
    label: { ar: 'حلقة سمعية', en: 'Hearing loop' },
    detail: { ar: 'نظام تضخيم صوت للأجهزة السمعية', en: 'Sound amplification for hearing devices' },
  },
  written_communication: {
    emoji: '',
    label: { ar: 'تواصل كتابي', en: 'Written communication' },
    detail: { ar: 'ورقة وقلم للتواصل الكتابي', en: 'Pen and paper for written communication' },
  },
  visual_alerts: {
    emoji: '',
    label: { ar: 'تنبيهات بصرية', en: 'Visual alerts' },
    detail: { ar: 'إشعارات ضوئية بدل الصوتية', en: 'Light notifications instead of sound' },
  },
  lip_reading: {
    emoji: '',
    label: { ar: 'قراءة شفاه', en: 'Lip reading' },
    detail: { ar: 'خبيرات يتحدثن بوضوح للقراءة', en: 'Technicians speak clearly for reading' },
  },
  sign_language: {
    emoji: '',
    label: { ar: 'لغة إشارة', en: 'Sign language' },
    detail: { ar: 'خبيرات بلغة الإشارة', en: 'Sign language technicians' },
  },
  quiet_environment: {
    emoji: '',
    label: { ar: 'بيئة هادئة', en: 'Quiet environment' },
    detail: { ar: 'ضوضاء منخفضة للتركيز', en: 'Low noise for focus' },
  },
};

interface HearingAssistanceBadgeProps {
  features: HearingFeature[];
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  supportCountText?: string;
  footerText?: string;
  className?: string;
}

export function HearingAssistanceBadge({
  features,
  className = '',
  locale = 'ar',
  title = 'مساعدة سمعية',
  supportCountText = 'وسائل دعم سمعي',
  footerText = 'نسمعكِ بكل الطرق — الجمال للجميع',
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
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">
            {features.length} {supportCountText}
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
                <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">
                  {def.label[locale]}
                </p>
                <p className="text-[9px] text-sky-600 dark:text-sky-400">{def.detail[locale]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[9px] text-sky-600 dark:text-sky-400">{footerText}</p>
    </div>
  );
}

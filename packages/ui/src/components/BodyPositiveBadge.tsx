'use client';

import { cn } from '@galaxy/shared';

/**
 * Body Positive Badge — signals body-positive salon policies.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <BodyPositiveBadge features={['real_imagery', 'size_inclusive', 'skin_inclusive']} />
 */

type BodyPosFeature =
  | 'real_imagery'
  | 'size_inclusive'
  | 'skin_inclusive'
  | 'age_positive'
  | 'scar_friendly'
  | 'no_retouching';

interface FeatureDef {
  emoji: string;
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
}

const FEATURES: FeatureDef[] = [
  {
    emoji: '',
    label: { ar: 'صور حقيقية', en: 'Real photos' },
    detail: {
      ar: 'نستخدم صور نساء حقيقيات — بدون تعديل أو فوتوشوب',
      en: 'We use photos of real women — no retouching or Photoshop',
    },
  },
  {
    emoji: '',
    label: { ar: 'شامل الأحجام', en: 'Size inclusive' },
    detail: {
      ar: 'روبات، كراسي، ومناشف لكل أحجام الأجسام',
      en: 'Robes, chairs and towels for all body sizes',
    },
  },
  {
    emoji: '',
    label: { ar: 'كل ألوان البشرة', en: 'All skin tones' },
    detail: {
      ar: 'خبيرات متدربات على كل درجات البشرة',
      en: 'Specialists trained on every skin tone',
    },
  },
  {
    emoji: '',
    label: { ar: 'إيجابية العمر', en: 'Age positive' },
    detail: {
      ar: 'الجمال ليس له عمر — كل مرحلة عمرية جميلة',
      en: 'Beauty has no age — every stage of life is beautiful',
    },
  },
  {
    emoji: '',
    label: { ar: 'صديق للندبات', en: 'Scar friendly' },
    detail: {
      ar: 'لا نحكم على الندبات أو علامات التمدد — بل نحتضنها',
      en: 'We never judge scars or stretch marks — we embrace them',
    },
  },
  {
    emoji: '',
    label: { ar: 'بدون تنقيح', en: 'No retouching' },
    detail: {
      ar: 'صور قبل/بعد حقيقية 100% — لا فوتوشوب',
      en: '100% real before/after photos — no Photoshop',
    },
  },
];

interface BodyPositiveBadgeProps {
  features: BodyPosFeature[];
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Pledge section title */
  pledgeTitle?: string;
  /** Pledge body text */
  pledgeText?: string;
  /** Footer affirmation */
  affirmation?: string;
  /** Locale for internal feature data strings */
  locale?: 'ar' | 'en';
}

export function BodyPositiveBadge({
  features,
  className = '',
  title = 'إيجابية الجسد',
  subtitle = 'كل امرأة، كل جسد، كل جمال — كما أنتِ، بدون تغيير',
  pledgeTitle = ' تعهدنا لكِ',
  pledgeText = 'نؤمن أن الجمال الحقيقي هو أن تكوني على طبيعتكِ. لن نطلب منكِ أبداً تغيير شكل جسدكِ أو لون بشرتكِ أو ملامحكِ. نحن هنا لنبرز جمالكِ الطبيعي — ليس لنغيره.',
  affirmation = 'أنتِ جميلة كما أنتِ',
  locale = 'ar',
}: BodyPositiveBadgeProps): JSX.Element | null {
  if (!features.length) return null;

  const map: Record<BodyPosFeature, string> = {
    real_imagery: 'صور حقيقية',
    size_inclusive: 'شامل الأحجام',
    skin_inclusive: 'كل ألوان البشرة',
    age_positive: 'إيجابية العمر',
    scar_friendly: 'صديق للندبات',
    no_retouching: 'بدون تنقيح',
  };

  const active = features
    .map((k) => FEATURES.find((f) => f.label.ar === map[k]))
    .filter(Boolean) as FeatureDef[];

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 p-5 dark:border-rose-900 dark:from-rose-950 dark:via-purple-950 dark:to-blue-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
      </div>

      {/* Features */}
      <div className="mt-3 space-y-2">
        {active.map((f) => (
          <div
            key={f.label.ar}
            className="flex items-start gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-lg shrink-0" aria-hidden="true">
              {f.emoji}
            </span>
            <div>
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                {f.label[locale]}
              </p>
              <p className="text-[10px] text-text-secondary dark:text-gray-300">
                {f.detail[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pledge */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">{pledgeTitle}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-purple-600 dark:text-purple-400">
          {pledgeText}
        </p>
      </div>

      {/* Affirmation */}
      <p className="mt-2 text-center text-[9px] italic text-purple-500 dark:text-purple-400">
        &ldquo;{affirmation}&rdquo;
      </p>
    </div>
  );
}

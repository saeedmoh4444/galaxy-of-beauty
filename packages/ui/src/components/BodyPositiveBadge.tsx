'use client';

import { cn } from '@galaxy/shared';

/**
 * Body Positive Badge — signals body-positive salon policies.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <BodyPositiveBadge features={['real_imagery', 'size_inclusive', 'skin_inclusive']} />
 */

type BodyPosFeature = 'real_imagery' | 'size_inclusive' | 'skin_inclusive' | 'age_positive' | 'scar_friendly' | 'no_retouching';

interface FeatureDef {
  emoji: string;
  label: string;
  detail: string;
}

const FEATURES: FeatureDef[] = [
  { emoji: '📸', label: 'صور حقيقية', detail: 'نستخدم صور نساء حقيقيات — بدون تعديل أو فوتوشوب' },
  { emoji: '👗', label: 'شامل الأحجام', detail: 'روبات، كراسي، ومناشف لكل أحجام الأجسام' },
  { emoji: '🎨', label: 'كل ألوان البشرة', detail: 'خبيرات متدربات على كل درجات البشرة' },
  { emoji: '🌺', label: 'إيجابية العمر', detail: 'الجمال ليس له عمر — كل مرحلة عمرية جميلة' },
  { emoji: '🤍', label: 'صديق للندبات', detail: 'لا نحكم على الندبات أو علامات التمدد — بل نحتضنها' },
  { emoji: '✨', label: 'بدون تنقيح', detail: 'صور قبل/بعد حقيقية 100% — لا فوتوشوب' },
];

interface BodyPositiveBadgeProps {
  features: BodyPosFeature[];
  className?: string;
}

export function BodyPositiveBadge({
  features,
  className = '',
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

  const active = features.map((k) => FEATURES.find((f) => f.label === map[k])).filter(Boolean) as FeatureDef[];

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 p-5 dark:border-rose-900 dark:from-rose-950 dark:via-purple-950 dark:to-blue-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">💜</span>
        <h4 className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">
          إيجابية الجسد
        </h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          كل امرأة، كل جسد، كل جمال — كما أنتِ، بدون تغيير
        </p>
      </div>

      {/* Features */}
      <div className="mt-3 space-y-2">
        {active.map((f) => (
          <div
            key={f.label}
            className="flex items-start gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-lg shrink-0" aria-hidden="true">{f.emoji}</span>
            <div>
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                {f.label}
              </p>
              <p className="text-[10px] text-text-secondary dark:text-gray-300">
                {f.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pledge */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
          ✨ تعهدنا لكِ
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-purple-600 dark:text-purple-400">
          نؤمن أن الجمال الحقيقي هو أن تكوني على طبيعتكِ. لن نطلب منكِ أبداً تغيير شكل
          جسدكِ أو لون بشرتكِ أو ملامحكِ. نحن هنا لنبرز جمالكِ الطبيعي — ليس لنغيره.
        </p>
      </div>

      {/* Affirmation */}
      <p className="mt-2 text-center text-[9px] italic text-purple-500 dark:text-purple-400">
        💜 &ldquo;أنتِ جميلة كما أنتِ&rdquo;
      </p>
    </div>
  );
}

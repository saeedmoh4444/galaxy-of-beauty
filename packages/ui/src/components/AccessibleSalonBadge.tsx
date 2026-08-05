'use client';

import { cn } from '@galaxy/shared';

/**
 * Accessible Salon Badge — signals inclusivity and accessibility features.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <AccessibleSalonBadge features={['wheelchair', 'skin_tones', 'hair_textures', 'body_positive']} />
 */

type AccessFeature =
  | 'wheelchair'
  | 'skin_tones'
  | 'hair_textures'
  | 'body_positive'
  | 'sign_language'
  | 'braille_menu'
  | 'service_animal'
  | 'elevator';

interface FeatureDef {
  emoji: string;
  label: string;
  detail: string;
  color: string;
}

const FEATURES: FeatureDef[] = [
  {
    emoji: '♿',
    label: 'كرسي متحرك',
    detail: 'مداخل واسعة، مصعد، حمام مجهز',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  {
    emoji: '🎨',
    label: 'كل ألوان البشرة',
    detail: 'خبيرات مدربات على كل ألوان البشرة (فيتزباتريك I-VI)',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  {
    emoji: '🦱',
    label: 'كل أنواع الشعر',
    detail: 'مصففات مدربات على كل أنماط التجعيد (1A إلى 4C)',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
  {
    emoji: '💜',
    label: 'إيجابية الجسد',
    detail: 'صور حقيقية، روبات وكراسي لجميع الأحجام',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
  {
    emoji: '🤟',
    label: 'لغة الإشارة',
    detail: 'خبيرات مدربات على لغة الإشارة (قريباً)',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  },
  {
    emoji: '📋',
    label: 'قائمة برايل',
    detail: 'قائمة خدمات بطريقة برايل للمكفوفات',
    color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  },
  {
    emoji: '🐕‍🦺',
    label: 'حيوان الخدمة',
    detail: 'نرحب بحيوانات الخدمة في الصالون',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    emoji: '🛗',
    label: 'مصعد',
    detail: 'مصعد متاح لجميع الطوابق',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  },
];

interface AccessibleSalonBadgeProps {
  features: AccessFeature[];
  className?: string;
}

export function AccessibleSalonBadge({
  features,
  className = '',
}: AccessibleSalonBadgeProps): JSX.Element | null {
  if (!features.length) return null;

  // Map key to definition
  const map: Record<AccessFeature, string> = {
    wheelchair: 'كرسي متحرك',
    skin_tones: 'كل ألوان البشرة',
    hair_textures: 'كل أنواع الشعر',
    body_positive: 'إيجابية الجسد',
    sign_language: 'لغة الإشارة',
    braille_menu: 'قائمة برايل',
    service_animal: 'حيوان الخدمة',
    elevator: 'مصعد',
  };

  const getFeature = (key: AccessFeature): FeatureDef | undefined =>
    FEATURES.find((f) => f.label === map[key]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🌈</span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">
            صالون شامل للجميع
          </h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            {features.length} ميزات إتاحة
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-3 space-y-2">
        {features.map((key) => {
          const f = getFeature(key);
          if (!f) return null;

          return (
            <div
              key={key}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-2.5',
                f.color,
              )}
            >
              <span className="text-lg shrink-0" aria-hidden="true">{f.emoji}</span>
              <div>
                <p className="text-xs font-bold">{f.label}</p>
                <p className="text-[10px] opacity-70">{f.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer pledge */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-950 dark:to-purple-950">
        <p className="text-center text-[10px] font-medium text-blue-700 dark:text-blue-300">
          💙 كل امرأة، كل جسد، كل جمال — مرحباً بكِ كما أنتِ
        </p>
      </div>
    </div>
  );
}

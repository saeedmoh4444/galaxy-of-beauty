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
  label: { ar: string; en: string };
  detail: { ar: string; en: string };
  color: string;
}

const FEATURES: FeatureDef[] = [
  {
    emoji: '',
    label: { ar: 'كرسي متحرك', en: 'Wheelchair accessible' },
    detail: {
      ar: 'مداخل واسعة، مصعد، حمام مجهز',
      en: 'Wide entrances, elevator, accessible restroom',
    },
    color:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  {
    emoji: '',
    label: { ar: 'كل ألوان البشرة', en: 'All skin tones' },
    detail: {
      ar: 'خبيرات مدربات على كل ألوان البشرة (فيتزباتريك I-VI)',
      en: 'Specialists trained on all skin tones (Fitzpatrick I-VI)',
    },
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  {
    emoji: '',
    label: { ar: 'كل أنواع الشعر', en: 'All hair types' },
    detail: {
      ar: 'مصففات مدربات على كل أنماط التجعيد (1A إلى 4C)',
      en: 'Stylists trained on all curl patterns (1A to 4C)',
    },
    color:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
  {
    emoji: '',
    label: { ar: 'إيجابية الجسد', en: 'Body positive' },
    detail: {
      ar: 'صور حقيقية، روبات وكراسي لجميع الأحجام',
      en: 'Real photos, robes and chairs for all sizes',
    },
    color:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
  {
    emoji: '',
    label: { ar: 'لغة الإشارة', en: 'Sign language' },
    detail: {
      ar: 'خبيرات مدربات على لغة الإشارة (قريباً)',
      en: 'Specialists trained in sign language (coming soon)',
    },
    color:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  },
  {
    emoji: '',
    label: { ar: 'قائمة برايل', en: 'Braille menu' },
    detail: {
      ar: 'قائمة خدمات بطريقة برايل للمكفوفات',
      en: 'Services menu in Braille for blind customers',
    },
    color:
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  },
  {
    emoji: '‍',
    label: { ar: 'حيوان الخدمة', en: 'Service animal' },
    detail: {
      ar: 'نرحب بحيوانات الخدمة في الصالون',
      en: 'Service animals are welcome in the salon',
    },
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    emoji: '',
    label: { ar: 'مصعد', en: 'Elevator' },
    detail: { ar: 'مصعد متاح لجميع الطوابق', en: 'Elevator available on all floors' },
    color:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  },
];

interface AccessibleSalonBadgeProps {
  features: AccessFeature[];
  className?: string;
  /** Badge header title */
  title?: string;
  /** Text following the features count */
  accessibilityCountText?: string;
  /** Footer pledge text */
  pledgeText?: string;
  /** Locale for internal feature data strings */
  locale?: 'ar' | 'en';
}

export function AccessibleSalonBadge({
  features,
  className = '',
  title = 'صالون شامل للجميع',
  accessibilityCountText = 'ميزات إتاحة',
  pledgeText = 'كل امرأة، كل جسد، كل جمال — مرحباً بكِ كما أنتِ',
  locale = 'ar',
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
    FEATURES.find((f) => f.label.ar === map[key]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            {features.length} {accessibilityCountText}
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
              className={cn('flex items-start gap-2.5 rounded-xl border p-2.5', f.color)}
            >
              <span className="text-lg shrink-0" aria-hidden="true">
                {f.emoji}
              </span>
              <div>
                <p className="text-xs font-bold">{f.label[locale]}</p>
                <p className="text-[10px] opacity-70">{f.detail[locale]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer pledge */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-950 dark:to-purple-950">
        <p className="text-center text-[10px] font-medium text-blue-700 dark:text-blue-300">
          {pledgeText}
        </p>
      </div>
    </div>
  );
}

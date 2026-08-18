'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Journey Timeline — visual life-stage beauty journey from 15 to 75+.
 * From Phase W2: Life Stage Beauty.
 *
 * Usage:
 *   <BeautyJourneyTimeline activeStage="discovery" />
 */

type LifeStage =
  'first_steps' | 'discovery' | 'career' | 'wedding_motherhood' | 'confidence' | 'golden';

interface StageDef {
  emoji: string;
  title: { ar: string; en: string };
  ageRange: string;
  services: { ar: string; en: string }[];
  color: string;
  gradient: string;
}

const STAGES: LifeStage[] = [
  'first_steps',
  'discovery',
  'career',
  'wedding_motherhood',
  'confidence',
  'golden',
];

const STAGE_DEFS: Record<LifeStage, StageDef> = {
  first_steps: {
    emoji: '',
    title: { ar: 'خطواتي الأولى', en: 'First steps' },
    ageRange: '15-18',
    services: [
      { ar: 'أول درس مكياج', en: 'First makeup lesson' },
      { ar: 'أساسيات العناية بالبشرة', en: 'Skincare basics' },
      { ar: 'أول باقة عناية', en: 'First care package' },
    ],
    color: 'text-pink-600 dark:text-pink-300',
    gradient: 'from-pink-400 to-rose-400',
  },
  discovery: {
    emoji: '',
    title: { ar: 'اكتشاف وتعبير', en: 'Discovery and expression' },
    ageRange: '18-25',
    services: [
      { ar: 'إتقان المكياج', en: 'Mastering makeup' },
      { ar: 'تجربة ألوان الشعر', en: 'Experimenting with hair colors' },
      { ar: 'ميزانية الجمال', en: 'Beauty budget' },
    ],
    color: 'text-purple-600 dark:text-purple-300',
    gradient: 'from-purple-400 to-violet-400',
  },
  career: {
    emoji: '',
    title: { ar: 'مهنة وثقة', en: 'Career and confidence' },
    ageRange: '25-35',
    services: [
      { ar: 'مكياج احترافي', en: 'Professional makeup' },
      { ar: 'خدمات سريعة 30 دقيقة', en: 'Quick 30-minute services' },
      { ar: 'إطلالة المقابلات', en: 'Interview looks' },
    ],
    color: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-400 to-sky-400',
  },
  wedding_motherhood: {
    emoji: '',
    title: { ar: 'زواج وأمومة', en: 'Marriage and motherhood' },
    ageRange: '25-40',
    services: [
      { ar: 'رحلة العروس', en: 'The bridal journey' },
      { ar: 'عناية الحمل', en: 'Pregnancy care' },
      { ar: 'باقة الأم الجديدة', en: 'New-mom package' },
    ],
    color: 'text-rose-600 dark:text-rose-300',
    gradient: 'from-rose-400 to-pink-400',
  },
  confidence: {
    emoji: '',
    title: { ar: 'ثقة وأناقة', en: 'Confidence and elegance' },
    ageRange: '40-55',
    services: [
      { ar: 'علاجات مكافحة الشيخوخة', en: 'Anti-aging treatments' },
      { ar: 'عناية هرمونية', en: 'Hormonal care' },
      { ar: 'باقة المرأة التنفيذية', en: 'Executive woman package' },
    ],
    color: 'text-amber-600 dark:text-amber-300',
    gradient: 'from-amber-400 to-orange-400',
  },
  golden: {
    emoji: '',
    title: { ar: 'الجمال الذهبي', en: 'Golden beauty' },
    ageRange: '55+',
    services: [
      { ar: 'علاجات لطيفة', en: 'Gentle treatments' },
      { ar: 'أساليب كلاسيكية', en: 'Classic styles' },
      { ar: 'باقة حفيدة العروس', en: "Bride's granddaughter package" },
    ],
    color: 'text-emerald-600 dark:text-emerald-300',
    gradient: 'from-emerald-400 to-teal-400',
  },
};

interface BeautyJourneyTimelineProps {
  /** Currently active life stage */
  activeStage?: LifeStage;
  /** User's current age (highlights closest stage) */
  userAge?: number;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Suffix after the age range */
  ageSuffix?: string;
  /** Label on the current stage badge */
  hereLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal stage data strings */
  locale?: 'ar' | 'en';
}

function getStageForAge(age: number): LifeStage {
  if (age <= 18) return 'first_steps';
  if (age <= 25) return 'discovery';
  if (age <= 35) return 'career';
  if (age <= 40) return 'wedding_motherhood';
  if (age <= 55) return 'confidence';
  return 'golden';
}

export function BeautyJourneyTimeline({
  activeStage,
  userAge,
  className = '',
  title = 'رحلتي الجمالية',
  subtitle = 'لكل مرحلة عمرية جمالها الخاص',
  ageSuffix = 'سنة',
  hereLabel = 'أنتِ هنا',
  footerText = 'الجمال يتطور معكِ — ونحن معكِ في كل مرحلة',
  locale = 'ar',
}: BeautyJourneyTimelineProps): JSX.Element {
  const currentStage = activeStage ?? (userAge ? getStageForAge(userAge) : 'discovery');
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{title}</h4>
        <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Timeline */}
      <div className="mt-4 space-y-0">
        {STAGES.map((stage, i) => {
          const def = STAGE_DEFS[stage];
          const isActive = stage === currentStage;
          const isPast = i < currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={stage} className="relative flex gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-all',
                    isActive
                      ? 'border-current bg-white shadow-sm dark:bg-gray-800'
                      : isPast
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
                  )}
                  style={{
                    borderColor: isActive ? undefined : undefined,
                    color: isActive ? undefined : undefined,
                  }}
                >
                  <span className={cn(isFuture && 'opacity-40')}>{def.emoji}</span>
                </div>

                {/* Vertical line */}
                {i < STAGES.length - 1 && (
                  <div
                    className={cn(
                      'h-full min-h-[24px] w-0.5',
                      isPast
                        ? 'bg-emerald-200 dark:bg-emerald-800'
                        : 'bg-gray-200 dark:bg-gray-700',
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'pb-3 flex-1 rounded-lg px-3 py-1.5 transition-all',
                  isActive && 'bg-gray-50 dark:bg-gray-800',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isActive
                          ? def.color
                          : isFuture
                            ? 'text-text-tertiary dark:text-gray-500'
                            : 'text-text-secondary dark:text-gray-300',
                      )}
                    >
                      {def.title[locale]}
                    </span>
                    <span className="ml-2 text-[10px] text-text-tertiary dark:text-gray-500">
                      {def.ageRange} {ageSuffix}
                    </span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-current px-2 py-0.5 text-[9px] font-bold text-white opacity-80">
                      {hereLabel}
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400"></span>
                  )}
                </div>

                {/* Services — show for active and past */}
                {(isActive || isPast) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {def.services.map((s) => (
                      <span
                        key={s.ar}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-medium',
                          isActive
                            ? 'bg-gray-100 text-text-secondary dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        )}
                      >
                        {s[locale]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] italic text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

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
  title: string;
  ageRange: string;
  services: string[];
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
    title: 'خطواتي الأولى',
    ageRange: '15-18',
    services: ['أول درس مكياج', 'أساسيات العناية بالبشرة', 'أول باقة عناية'],
    color: 'text-pink-600 dark:text-pink-300',
    gradient: 'from-pink-400 to-rose-400',
  },
  discovery: {
    emoji: '',
    title: 'اكتشاف وتعبير',
    ageRange: '18-25',
    services: ['إتقان المكياج', 'تجربة ألوان الشعر', 'ميزانية الجمال'],
    color: 'text-purple-600 dark:text-purple-300',
    gradient: 'from-purple-400 to-violet-400',
  },
  career: {
    emoji: '',
    title: 'مهنة وثقة',
    ageRange: '25-35',
    services: ['مكياج احترافي', 'خدمات سريعة 30 دقيقة', 'إطلالة المقابلات'],
    color: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-400 to-sky-400',
  },
  wedding_motherhood: {
    emoji: '',
    title: 'زواج وأمومة',
    ageRange: '25-40',
    services: ['رحلة العروس', 'عناية الحمل', 'باقة الأم الجديدة'],
    color: 'text-rose-600 dark:text-rose-300',
    gradient: 'from-rose-400 to-pink-400',
  },
  confidence: {
    emoji: '',
    title: 'ثقة وأناقة',
    ageRange: '40-55',
    services: ['علاجات مكافحة الشيخوخة', 'عناية هرمونية', 'باقة المرأة التنفيذية'],
    color: 'text-amber-600 dark:text-amber-300',
    gradient: 'from-amber-400 to-orange-400',
  },
  golden: {
    emoji: '',
    title: 'الجمال الذهبي',
    ageRange: '55+',
    services: ['علاجات لطيفة', 'أساليب كلاسيكية', 'باقة حفيدة العروس'],
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
}: BeautyJourneyTimelineProps): JSX.Element {
  const currentStage = activeStage ?? (userAge ? getStageForAge(userAge) : 'discovery');
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
           رحلتي الجمالية
        </h4>
        <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-400">
          لكل مرحلة عمرية جمالها الخاص
        </p>
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
                      {def.title}
                    </span>
                    <span className="ml-2 text-[10px] text-text-tertiary dark:text-gray-500">
                      {def.ageRange} سنة
                    </span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-current px-2 py-0.5 text-[9px] font-bold text-white opacity-80">
                      أنتِ هنا
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
                        key={s}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-medium',
                          isActive
                            ? 'bg-gray-100 text-text-secondary dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        )}
                      >
                        {s}
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
         الجمال يتطور معكِ — ونحن معكِ في كل مرحلة
      </p>
    </div>
  );
}

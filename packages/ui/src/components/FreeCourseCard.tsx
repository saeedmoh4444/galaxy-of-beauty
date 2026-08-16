'use client';

import { cn } from '@galaxy/shared';

/**
 * Free Course Card — Galaxy Beauty Academy free educational content.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <FreeCourseCard
 *     course={{ title: 'أساسيات العناية بالبشرة', level: 'beginner', duration: '45 دقيقة', lessons: 6 }}
 *   />
 */

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
type CourseLang = 'ar' | 'en' | 'both';

interface LevelDef {
  emoji: string;
  label: string;
  color: string;
}

const LEVELS: Record<CourseLevel, LevelDef> = {
  beginner: {
    emoji: '',
    label: 'مبتدئة',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  intermediate: {
    emoji: '',
    label: 'متوسطة',
    color: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  advanced: {
    emoji: '',
    label: 'متقدمة',
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
};

interface FreeCourse {
  title: string;
  level: CourseLevel;
  language?: CourseLang;
  /** Estimated duration, e.g. "45 دقيقة" */
  duration: string;
  /** Number of video lessons */
  lessons: number;
  /** Instructor name */
  instructor?: string;
  /** Enrolled count */
  enrolled?: number;
  /** Category emoji */
  emoji?: string;
  /** Certificate available */
  hasCertificate?: boolean;
  /** Newly added flag */
  isNew?: boolean;
}

interface FreeCourseCardProps {
  course: FreeCourse;
  onEnroll?: () => void;
  className?: string;
}

const LANG_LABELS: Record<CourseLang, string> = {
  ar: ' بالعربية',
  en: ' بالإنجليزية',
  both: ' العربية + الإنجليزية',
};

export function FreeCourseCard({
  course,
  onEnroll,
  className = '',
}: FreeCourseCardProps): JSX.Element {
  const level = LEVELS[course.level];

  return (
    <div
      className={cn(
        'group rounded-2xl border border-teal-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Course icon + title */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-xl dark:from-teal-900 dark:to-emerald-900">
          {course.emoji || ''}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{course.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', level.color)}>
              {level.emoji} {level.label}
            </span>
            {course.language && (
              <span className="text-[10px] text-text-tertiary dark:text-gray-500">
                {LANG_LABELS[course.language]}
              </span>
            )}
          </div>
        </div>

        {/* Free badge */}
        <span className="shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
          مجاني
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
          <span aria-hidden="true">️</span>
          {course.duration}
        </div>
        <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
          <span aria-hidden="true"></span>
          {course.lessons} دروس
        </div>
        {course.instructor && (
          <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
            <span aria-hidden="true">‍</span>
            {course.instructor}
          </div>
        )}
        {course.enrolled !== undefined && (
          <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
            <span aria-hidden="true">‍</span>
            {course.enrolled.toLocaleString('ar-SA')} مسجلة
          </div>
        )}
      </div>

      {/* Progress / Certificate row */}
      {course.hasCertificate && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-50 px-2 py-1 dark:bg-teal-950">
          <span className="text-xs" aria-hidden="true"></span>
          <span className="text-[10px] font-medium text-teal-700 dark:text-teal-300">
            شهادة معتمدة عند الإكمال
          </span>
        </div>
      )}

      {/* New badge */}
      {course.isNew && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            🆕 أضيف مؤخراً
          </span>
        </div>
      )}

      {/* Enroll CTA */}
      <button
        type="button"
        onClick={onEnroll}
        className={cn(
          'mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all',
          'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700',
          'active:scale-[0.98]',
        )}
      >
        ابدئي التعلم الآن
      </button>
    </div>
  );
}

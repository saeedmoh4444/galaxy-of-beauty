'use client';

import { cn } from '@galaxy/shared';

/**
 * Sign Language Badge — signals technicians trained in sign language.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <SignLanguageBadge technicians={[{ name: 'نورة', level: 'fluent' }]} />
 */

type SignLevel = 'basic' | 'intermediate' | 'fluent';

const LEVELS: Record<SignLevel, { emoji: string; label: string; color: string }> = {
  basic: {
    emoji: '🌱',
    label: 'أساسي',
    color: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  intermediate: {
    emoji: '🌿',
    label: 'متوسط',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  fluent: {
    emoji: '🌳',
    label: 'متقن',
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  },
};

interface SLTechnician {
  name: string;
  level: SignLevel;
  specialty?: string;
}

interface SignLanguageBadgeProps {
  technicians: SLTechnician[];
  /** Whether booking with SL tech requires advance notice */
  advanceNotice?: string;
  className?: string;
}

export function SignLanguageBadge({
  technicians,
  advanceNotice = '24 ساعة',
  className = '',
}: SignLanguageBadgeProps): JSX.Element | null {
  if (!technicians.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🤟
        </span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">لغة الإشارة متوفرة</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">
            {technicians.length} خبيرات مدربات على لغة الإشارة
          </p>
        </div>
      </div>

      {/* Technicians */}
      <div className="mt-3 space-y-2">
        {technicians.map((tech) => {
          const level = LEVELS[tech.level];
          return (
            <div
              key={tech.name}
              className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-950"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm dark:bg-gray-700">
                👩‍🎨
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                  {tech.name}
                </p>
                {tech.specialty && (
                  <p className="text-[10px] text-text-tertiary dark:text-gray-500">
                    {tech.specialty}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  level.color,
                )}
              >
                {level.emoji} {level.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Advance notice */}
      <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
        <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
          💡 يُفضل الحجز قبل {advanceNotice} لضمان توفر خبيرة لغة الإشارة
        </p>
      </div>

      {/* Inclusivity footer */}
      <p className="mt-2 text-center text-[9px] text-sky-600 dark:text-sky-400">
        🤟 الجمال لغة نفهمها جميعاً
      </p>
    </div>
  );
}

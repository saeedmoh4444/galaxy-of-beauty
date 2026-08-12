'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Skill Tree Card — visual skill progression for beauty learning.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautySkillTreeCard skills={[{ name: 'مكياج أساسي', level: 3, max: 5 }]} />
 */

interface Skill {
  name: string;
  emoji: string;
  level: number;
  max: number;
}

interface BeautySkillTreeCardProps {
  skills: Skill[];
  onViewDetails?: () => void;
  className?: string;
}

const COLORS = [
  'from-pink-400 to-rose-400',
  'from-purple-400 to-violet-400',
  'from-sky-400 to-blue-400',
  'from-emerald-400 to-green-400',
  'from-amber-400 to-orange-400',
];

export function BeautySkillTreeCard({
  skills,
  onViewDetails,
  className = '',
}: BeautySkillTreeCardProps): JSX.Element | null {
  if (!skills.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-5 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🌳
          </span>
          <div>
            <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">شجرة المهارات</h4>
            <p className="text-[10px] text-teal-500 dark:text-teal-400">تقدمكِ في رحلة التعلم</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {skills.map((skill, i) => (
          <div key={skill.name} className="rounded-xl bg-teal-50 p-3 dark:bg-teal-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>{skill.emoji}</span>
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                  {skill.name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                {skill.level}/{skill.max}
              </span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {Array.from({ length: skill.max }).map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    'h-2 flex-1 rounded-full',
                    j < skill.level
                      ? `bg-gradient-to-r ${COLORS[i % COLORS.length]}`
                      : 'bg-gray-200 dark:bg-gray-700',
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewDetails}
        className="mt-3 w-full rounded-xl border border-teal-200 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
      >
        تفاصيل المهارات 🌳
      </button>
    </div>
  );
}

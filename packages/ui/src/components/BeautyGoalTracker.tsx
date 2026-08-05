'use client';

/**
 * Beauty Goal Tracker — visual progress for beauty learning goals.
 * From Phase W6: Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyGoalTracker goals={[{ label: 'تعلم أساسيات المكياج', progress: 60 }]} />
 */

interface BeautyGoal {
  label: string;
  progress: number; // 0-100
  emoji?: string;
}

interface BeautyGoalTrackerProps {
  goals: BeautyGoal[];
  className?: string;
}

export function BeautyGoalTracker({ goals, className = '' }: BeautyGoalTrackerProps): JSX.Element | null {
  if (!goals.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">🎯 أهدافي التعليمية</h4>
      {goals.map((goal, i) => (
        <div key={i} className="rounded-lg bg-white p-3 dark:bg-gray-900">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary dark:text-gray-100">
              {goal.emoji ? `${goal.emoji} ` : ''}{goal.label}
            </span>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{goal.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all duration-700"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

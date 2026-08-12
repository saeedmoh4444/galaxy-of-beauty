'use client';

import { cn } from '@galaxy/shared';

/**
 * Social Impact Counter — track progress toward employing 1000 women by 2028.
 * From Phase W10: Saudi Women Leadership — Social Impact.
 *
 * Usage:
 *   <SocialImpactCounter womenEmployed={847} />
 */

interface ImpactMetric {
  emoji: string;
  label: string;
  current: number;
  target: number;
  suffix?: string;
}

interface SocialImpactCounterProps {
  /** Currently employed women */
  womenEmployed: number;
  /** Women in training programs */
  womenInTraining?: number;
  /** Free services provided to survivors */
  survivorServices?: number;
  /** Rural women reached */
  ruralWomen?: number;
  className?: string;
}

export function SocialImpactCounter({
  womenEmployed,
  womenInTraining,
  survivorServices,
  ruralWomen,
  className = '',
}: SocialImpactCounterProps): JSX.Element {
  const metrics: ImpactMetric[] = [
    {
      emoji: '‍',
      label: 'امرأة عاملة',
      current: womenEmployed,
      target: 1000,
    },
    ...(womenInTraining
      ? [
          {
            emoji: '',
            label: 'متدربة',
            current: womenInTraining,
            target: 500,
          },
        ]
      : []),
    ...(survivorServices
      ? [
          {
            emoji: '',
            label: 'خدمة مجانية',
            current: survivorServices,
            target: 500,
          },
        ]
      : []),
    ...(ruralWomen
      ? [
          {
            emoji: '',
            label: 'امرأة ريفية',
            current: ruralWomen,
            target: 200,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200"> أثرنا الاجتماعي</h4>
        <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
          معاً نحو تمكين 1000 امرأة بحلول 2028
        </p>
      </div>

      {/* Metrics grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const pct = Math.min(100, Math.round((metric.current / metric.target) * 100));
          const isMain = metric.label === 'امرأة عاملة';

          return (
            <div
              key={i}
              className={cn(
                'rounded-xl bg-white/70 p-3 dark:bg-gray-800/70',
                isMain && 'col-span-2',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm" aria-hidden="true">
                    {metric.emoji}
                  </span>
                  <span className="text-[10px] font-bold text-text-primary dark:text-gray-100">
                    {metric.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r transition-all duration-1000',
                    isMain ? 'from-amber-500 to-yellow-500' : 'from-amber-400 to-amber-500',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Count */}
              <div className="mt-1 flex items-baseline justify-between">
                <span
                  className={cn(
                    'font-bold text-amber-800 dark:text-amber-200',
                    isMain ? 'text-lg' : 'text-sm',
                  )}
                >
                  {metric.current.toLocaleString('ar-SA')}
                </span>
                <span className="text-[10px] text-text-tertiary dark:text-gray-500">
                  الهدف {metric.target.toLocaleString('ar-SA')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Year target */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 dark:bg-black/20">
          <span className="text-xs" aria-hidden="true">
            
          </span>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
            {Math.round((womenEmployed / 1000) * 100)}% من هدف 2028
          </span>
        </div>
      </div>

      {/* Pledge */}
      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
         نؤمن بأن تمكين المرأة اقتصادياً يبني مستقبلاً أفضل للجميع
      </p>
    </div>
  );
}

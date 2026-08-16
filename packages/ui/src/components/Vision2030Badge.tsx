'use client';

import { cn } from '@galaxy/shared';

/**
 * Vision 2030 Badge — aligns with Saudi Vision 2030 women empowerment goals.
 * From Phase W10: Saudi Women Leadership — Social Impact.
 *
 * Usage:
 *   <Vision2030Badge womenEmployed={847} target={1000} />
 */

interface Vision2030BadgeProps {
  womenEmployed: number;
  target?: number;
  className?: string;
}

export function Vision2030Badge({
  womenEmployed,
  target = 1000,
  className = '',
}: Vision2030BadgeProps): JSX.Element {
  const pct = Math.round((womenEmployed / target) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-green-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">رؤية 2030</h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          نساهم في تمكين المرأة السعودية
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          هدفنا: توظيف {target} امرأة سعودية
        </p>
        <p className="mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200">
          {womenEmployed.toLocaleString('ar-SA')}
        </p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          {pct}% من الهدف
        </p>
      </div>

      {/* Vision pillars */}
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        {[
          { emoji: '‍', label: 'تمكين المرأة' },
          { emoji: '', label: 'تنويع الاقتصاد' },
          { emoji: '', label: 'ريادة عالمية' },
        ].map((p) => (
          <div key={p.label} className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <span className="text-lg" aria-hidden="true">
              {p.emoji}
            </span>
            <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {p.label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-emerald-600 dark:text-emerald-400">
        معاً نحو مستقبل أكثر إشراقاً للمرأة السعودية
      </p>
    </div>
  );
}

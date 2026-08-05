'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Scholarship Card — free beauty training for women from low-income backgrounds.
 * From Phase W6: Education & Empowerment — Scholarship Program.
 *
 * Usage:
 *   <BeautyScholarshipCard
 *     program={{ name: 'دورة مكياج احترافي', value: 3000, seats: 50 }}
 *   />
 */

interface ScholarshipProgram {
  name: string;
  value: number;
  seats: number;
  remaining?: number;
  emoji?: string;
  duration?: string;
  includes?: string[];
}

interface BeautyScholarshipCardProps {
  program: ScholarshipProgram;
  onApply?: () => void;
  onSponsor?: () => void;
  className?: string;
}

export function BeautyScholarshipCard({
  program,
  onApply,
  onSponsor,
  className = '',
}: BeautyScholarshipCardProps): JSX.Element {
  const remaining = program.remaining ?? program.seats;
  const taken = program.seats - remaining;
  const pct = Math.round((taken / program.seats) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-5 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-xl dark:from-teal-900 dark:to-emerald-900">
          {program.emoji || '🎓'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">
            منحة دراسية
          </h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100 mt-0.5">
            {program.name}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          🎓 مجانية
        </span>
      </div>

      {/* Program details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">قيمة المنحة</p>
          <p className="text-sm font-bold text-teal-800 dark:text-teal-200">
            {program.value.toLocaleString('ar-SA')} ر.س
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">المقاعد</p>
          <p className="text-sm font-bold text-teal-800 dark:text-teal-200">
            {remaining}/{program.seats}
          </p>
        </div>
      </div>

      {/* Includes */}
      {program.includes && program.includes.length > 0 && (
        <div className="mt-2 rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800">
          <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
            📦 تشمل المنحة
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {program.includes.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-2 py-0.5 text-[9px] text-text-secondary dark:bg-gray-700 dark:text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Seats progress */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-tertiary dark:text-gray-500">
            {remaining > 0
              ? `باقي ${remaining} مقعد`
              : 'اكتملت المقاعد'}
          </span>
          <span className="font-bold text-teal-700 dark:text-teal-300">
            {pct}%
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r transition-all',
              remaining > 0
                ? 'from-teal-400 to-emerald-500'
                : 'from-amber-400 to-orange-500',
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Duration */}
      {program.duration && (
        <p className="mt-1.5 text-[10px] text-text-tertiary dark:text-gray-500">
          ⏱️ المدة: {program.duration}
        </p>
      )}

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={remaining <= 0}
          className={cn(
            'flex-1 rounded-xl py-2 text-[10px] font-bold transition-all active:scale-[0.98]',
            remaining > 0
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500',
          )}
        >
          {remaining > 0 ? 'تقديم على المنحة' : 'اكتمل التسجيل'}
        </button>
        <button
          type="button"
          onClick={onSponsor}
          className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:bg-gray-800 dark:text-teal-300"
        >
          🤝 راعي
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-teal-600 dark:text-teal-400">
        💚 التعليم حق للجميع — لا تدعي الظروف تمنع حلمكِ
      </p>
    </div>
  );
}

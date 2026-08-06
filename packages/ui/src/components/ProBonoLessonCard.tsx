'use client';

import { cn } from '@galaxy/shared';

/**
 * Pro Bono Lesson Card — free community beauty lessons by volunteer experts.
 * From Phase W6: Education & Empowerment — Scholarship Program.
 *
 * Usage:
 *   <ProBonoLessonCard lessons={24} volunteers={8} />
 */

interface ProBonoLessonCardProps {
  lessons: number;
  volunteers: number;
  onVolunteer?: () => void;
  onAttend?: () => void;
  className?: string;
}

export function ProBonoLessonCard({ lessons, volunteers, onVolunteer, onAttend, className = '' }: ProBonoLessonCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 dark:border-teal-900 dark:from-teal-950 dark:to-emerald-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🤲</span>
        <h4 className="mt-1 text-sm font-bold text-teal-800 dark:text-teal-200">دروس مجتمعية</h4>
        <p className="text-[10px] text-teal-600 dark:text-teal-400">خبيرات يتطوعن لتعليم المجتمع</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">{lessons}</p>
          <p className="text-[9px] text-teal-600 dark:text-teal-400">درس مجاني</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">{volunteers}</p>
          <p className="text-[9px] text-teal-600 dark:text-teal-400">متطوعة</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onAttend} className="flex-1 rounded-xl bg-teal-600 py-2 text-[10px] font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all">احضري درساً</button>
        <button type="button" onClick={onVolunteer} className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:bg-gray-800 dark:text-teal-300">تطوعي</button>
      </div>

      <p className="mt-2 text-center text-[9px] text-teal-600 dark:text-teal-400">🤲 العلم صدقة جارية</p>
    </div>
  );
}

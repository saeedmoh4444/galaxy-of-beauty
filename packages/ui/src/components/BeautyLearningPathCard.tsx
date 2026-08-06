'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Learning Path Card — structured learning track for beauty skills.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyLearningPathCard path={{ title: 'مكياج احترافي', modules: 8, completed: 3, emoji: '💄' }} />
 */

interface LearningPath { title: string; modules: number; completed: number; emoji: string; duration?: string; }

interface BeautyLearningPathCardProps { path: LearningPath; onContinue?: () => void; className?: string; }

export function BeautyLearningPathCard({ path, onContinue, className = '' }: BeautyLearningPathCardProps): JSX.Element {
  const pct = Math.round((path.completed / path.modules) * 100);

  return (
    <div className={cn('rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-xl dark:from-indigo-900 dark:to-blue-900">{path.emoji}</div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">مسار تعليمي</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{path.title}</p>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">{path.duration || 'ذاتي'} · {path.modules} وحدات</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-indigo-600 dark:text-indigo-400">{path.completed}/{path.modules} مكتمل</span>
          <span className="font-bold text-indigo-700 dark:text-indigo-300">{pct}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button type="button" onClick={onContinue} className="mt-3 w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all">
        {path.completed === 0 ? 'ابدئي المسار' : path.completed === path.modules ? '✅ مكتمل — راجعي' : 'واصلي التعلم 📚'}
      </button>
    </div>
  );
}

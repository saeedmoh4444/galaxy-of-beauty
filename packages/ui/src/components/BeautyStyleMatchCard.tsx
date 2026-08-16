'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Style Match Card — match beauty styles to your preferences.
 * From Phase W9: The Small Details.
 *
 * Usage:
 *   <BeautyStyleMatchCard matches={[{ style: 'كلاسيكي', emoji: '', match: 92 }]} />
 */

interface StyleMatch {
  style: string;
  emoji: string;
  match: number;
  description?: string;
}

interface BeautyStyleMatchCardProps {
  matches: StyleMatch[];
  className?: string;
}

export function BeautyStyleMatchCard({
  matches,
  className = '',
}: BeautyStyleMatchCardProps): JSX.Element | null {
  if (!matches.length) return null;

  const top = matches[0]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-5 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
          تحليل الأسلوب
        </h4>
        <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">أسلوبكِ المثالي</p>
      </div>

      <div className="mt-3 rounded-xl bg-fuchsia-50 p-4 text-center dark:bg-fuchsia-950">
        <span className="text-4xl">{top.emoji}</span>
        <p className="mt-1 text-lg font-bold text-fuchsia-800 dark:text-fuchsia-200">{top.style}</p>
        <p className="mt-1 text-2xl font-extrabold text-fuchsia-700 dark:text-fuchsia-300">
          {top.match}%
        </p>
        <p className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400">توافق</p>
      </div>

      <div className="mt-3 space-y-1.5">
        {matches.slice(1).map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
          >
            <span className="text-sm">{m.emoji}</span>
            <span className="flex-1 text-[10px] text-text-primary dark:text-gray-100">
              {m.style}
            </span>
            <span className="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-300">
              {m.match}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Hero Badge — monthly member spotlight celebrating an inspiring woman.
 * From Phase W4: Sisterhood & Community — Celebrating Each Other.
 *
 * Usage:
 *   <BeautyHeroBadge
 *     member={{ name: 'نورة', story: '...', achievement: '...' }}
 *   />
 */

interface BeautyHero {
  name: string;
  story: string;
  achievement: string;
  city?: string;
  emoji?: string;
  month?: string;
}

interface BeautyHeroBadgeProps {
  member: BeautyHero;
  onNominate?: () => void;
  onReadStory?: () => void;
  className?: string;
}

export function BeautyHeroBadge({
  member,
  onNominate,
  onReadStory,
  className = '',
}: BeautyHeroBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950',
        className,
      )}
    >
      {/* Crown + title */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">👑</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          بطلة الجمال
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {member.month ? `🌟 ${member.month}` : '🌟 هذا الشهر'}
        </p>
      </div>

      {/* Hero card */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 text-3xl dark:from-amber-800 dark:to-yellow-800">
          {member.emoji || '👩'}
        </div>
        <p className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">
          {member.name}
        </p>
        {member.city && (
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">
            📍 {member.city}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-gray-300">
          &ldquo;{member.story}&rdquo;
        </p>
      </div>

      {/* Achievement */}
      <div className="mt-2 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 p-3 dark:from-amber-900 dark:to-yellow-900">
        <div className="flex items-center gap-2">
          <span className="text-lg shrink-0" aria-hidden="true">🏆</span>
          <div>
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
              إنجازها
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300">
              {member.achievement}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onReadStory}
          className="flex-1 rounded-xl bg-amber-600 py-2 text-[10px] font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          📖 اقرئي قصتها
        </button>
        <button
          type="button"
          onClick={onNominate}
          className="flex-1 rounded-xl border border-amber-200 bg-white py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-gray-800 dark:text-amber-300"
        >
          ✨ رشّحي بطلة
        </button>
      </div>

      {/* Sisterhood */}
      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        💛 كل شهر نحتفي بامرأة تلهم من حولها
      </p>
    </div>
  );
}

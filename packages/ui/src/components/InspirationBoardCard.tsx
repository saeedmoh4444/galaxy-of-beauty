'use client';

import { cn } from '@galaxy/shared';

/**
 * Inspiration Board Card — shared wishlist and beauty inspiration board.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <InspirationBoardCard
 *     pins={[{ image: '💇', title: 'تسريحة ناعمة', savedBy: 'نورة' }]}
 *   />
 */

interface InspirationPin {
  emoji: string;
  title: string;
  savedBy?: string;
  note?: string;
}

interface InspirationBoardCardProps {
  pins: InspirationPin[];
  boardName?: string;
  collaborators?: string[];
  onAddPin?: () => void;
  className?: string;
}

export function InspirationBoardCard({
  pins,
  boardName = 'لوحة إلهامي',
  collaborators,
  onAddPin,
  className = '',
}: InspirationBoardCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📌</span>
          <div>
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {boardName}
            </h4>
            <p className="text-[10px] text-rose-500 dark:text-rose-400">
              {pins.length} إلهام
              {collaborators && collaborators.length > 0 && ` · ${collaborators.length} مشاركة`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddPin}
          className="rounded-full bg-rose-100 p-1.5 text-rose-600 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400"
          aria-label="أضيفي إلهاماً"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>

      {/* Collaborators */}
      {collaborators && collaborators.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] text-text-tertiary dark:text-gray-500">👯‍♀️</span>
          <div className="flex -space-x-1.5">
            {collaborators.slice(0, 4).map((name) => (
              <span
                key={name}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-200 to-rose-200 text-[8px] font-bold text-pink-700 dark:border-gray-900 dark:from-pink-800 dark:to-rose-800 dark:text-pink-200"
              >
                {name.charAt(0)}
              </span>
            ))}
            {collaborators.length > 4 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[8px] text-gray-500 dark:border-gray-900 dark:bg-gray-700">
                +{collaborators.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pins grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {pins.slice(0, 6).map((pin, i) => (
          <div
            key={i}
            className="rounded-xl bg-rose-50 p-3 transition-all hover:shadow-sm dark:bg-rose-950"
          >
            <div className="flex h-12 items-center justify-center rounded-lg bg-white text-2xl dark:bg-gray-800">
              {pin.emoji}
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-text-primary dark:text-gray-100 truncate">
              {pin.title}
            </p>
            {pin.savedBy && (
              <p className="text-[9px] text-text-tertiary dark:text-gray-500">
                📌 {pin.savedBy}
              </p>
            )}
            {pin.note && (
              <p className="mt-0.5 text-[9px] italic text-text-tertiary dark:text-gray-500 truncate">
                &ldquo;{pin.note}&rdquo;
              </p>
            )}
          </div>
        ))}

        {/* Add pin placeholder */}
        {pins.length < 6 && (
          <button
            type="button"
            onClick={onAddPin}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-200 p-3 text-rose-400 hover:border-rose-300 hover:text-rose-500 dark:border-rose-800 dark:hover:border-rose-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            <span className="mt-1 text-[10px]">أضيفي</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        💕 شاركي إلهاماتكِ مع صديقاتكِ في دائرة الجمال
      </p>
    </div>
  );
}

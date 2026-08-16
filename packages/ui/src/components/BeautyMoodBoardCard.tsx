'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Mood Board Card — visual mood/inspiration collage for beauty.
 * From Phase W9: The Small Details & W4: Sisterhood.
 *
 * Usage:
 *   <BeautyMoodBoardCard items={[{ emoji: '', label: 'أزرق محيطي', color: '#0ea5e9' }]} />
 */

interface MoodItem {
  emoji: string;
  label: string;
  color?: string;
}

interface BeautyMoodBoardCardProps {
  items: MoodItem[];
  onAddItem?: () => void;
  className?: string;
}

export function BeautyMoodBoardCard({
  items,
  onAddItem,
  className = '',
}: BeautyMoodBoardCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">لوحة المزاج</h4>
            <p className="text-[10px] text-violet-500 dark:text-violet-400">{items.length} عنصر</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddItem}
          className="rounded-lg bg-violet-100 p-1.5 text-violet-600 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-400"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.slice(0, 6).map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-xl bg-violet-50 p-3 dark:bg-violet-950"
            style={item.color ? { backgroundColor: `${item.color}15` } : undefined}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-[9px] font-medium text-violet-700 dark:text-violet-300">
              {item.label}
            </span>
          </div>
        ))}
        {items.length < 6 && (
          <button
            type="button"
            onClick={onAddItem}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-violet-200 p-3 text-violet-400 dark:border-violet-800"
          >
            <span className="text-2xl">+</span>
            <span className="text-[9px]">أضيفي</span>
          </button>
        )}
      </div>
    </div>
  );
}

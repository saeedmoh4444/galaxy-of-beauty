'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Award Badge Card — platform awards & recognition badges.
 * From Phase W10: Saudi Women Leadership — Annual Summit.
 *
 * Usage:
 *   <BeautyAwardBadgeCard awards={[{ name: 'أفضل خبيرة مكياج', year: '2026', emoji: '🏆' }]} />
 */

interface Award {
  name: string;
  year: string;
  emoji: string;
  description?: string;
}

interface BeautyAwardBadgeCardProps {
  awards: Award[];
  className?: string;
}

export function BeautyAwardBadgeCard({
  awards,
  className = '',
}: BeautyAwardBadgeCardProps): JSX.Element | null {
  if (!awards.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          🏆
        </span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">جوائز المنصة</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          تقديراً للتميز في عالم الجمال
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {awards.map((a) => (
          <div
            key={a.name}
            className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-2xl shrink-0">{a.emoji}</span>
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">{a.name}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                {a.year}
                {a.description ? ` · ${a.description}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

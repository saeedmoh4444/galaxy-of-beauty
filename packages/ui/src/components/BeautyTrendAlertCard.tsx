'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Trend Alert Card — trending beauty styles and services.
 * From Phase W9: The Small Details & W6: Education.
 *
 * Usage:
 *   <BeautyTrendAlertCard trends={[{ name: 'ألوان الباستيل', emoji: '', heat: '' }]} />
 */

interface Trend {
  name: string;
  emoji: string;
  heat: string;
  description?: string;
}

interface BeautyTrendAlertCardProps {
  trends: Trend[];
  className?: string;
}

export function BeautyTrendAlertCard({
  trends,
  className = '',
}: BeautyTrendAlertCardProps): JSX.Element | null {
  if (!trends.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">رائج الآن</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{trends.length} صيحة</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {trends.slice(0, 4).map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-lg">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-200">{t.name}</p>
              {t.description && (
                <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.description}</p>
              )}
            </div>
            <span className="text-sm">{t.heat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

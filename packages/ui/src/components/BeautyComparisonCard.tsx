'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Comparison Card — side-by-side product/service comparison.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyComparisonCard
 *     items={[
 *       { name: 'كريم A', price: 120, rating: 4.5, pros: ['ترطيب عميق'], cons: ['ثقيل'] },
 *       { name: 'كريم B', price: 80, rating: 4.0, pros: ['خفيف'], cons: ['ترطيب أقل'] },
 *     ]}
 *   />
 */

interface ComparisonItem {
  name: string;
  emoji?: string;
  price: number;
  rating?: number;
  pros: string[];
  cons: string[];
  best?: boolean;
}

interface BeautyComparisonCardProps {
  items: ComparisonItem[];
  title?: string;
  className?: string;
}

export function BeautyComparisonCard({
  items,
  title = 'مقارنة المنتجات',
  className = '',
}: BeautyComparisonCardProps): JSX.Element | null {
  if (items.length < 2) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">⚖️</span>
        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">
          {title}
        </h4>
      </div>

      {/* Comparison columns */}
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => (
          <div
            key={item.name}
            className={cn(
              'rounded-xl p-3 text-center',
              item.best
                ? 'bg-blue-50 ring-2 ring-blue-300 dark:bg-blue-950 dark:ring-blue-700'
                : 'bg-gray-50 dark:bg-gray-800',
            )}
          >
            {item.emoji && <span className="text-2xl" aria-hidden="true">{item.emoji}</span>}
            <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {item.name}
            </p>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
              {item.price} ر.س
            </p>
            {item.rating && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                ⭐ {item.rating}
              </p>
            )}
            {item.best && (
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                🏆 الأفضل
              </span>
            )}

            {/* Pros/Cons */}
            <div className="mt-2 space-y-1 text-left">
              {item.pros.map((p) => (
                <p key={p} className="text-[9px] text-emerald-600 dark:text-emerald-400">
                  ✅ {p}
                </p>
              ))}
              {item.cons.map((c) => (
                <p key={c} className="text-[9px] text-rose-600 dark:text-rose-400">
                  ❌ {c}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        ⚖️ قارني قبل ما تقرري
      </p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Ingredient Highlight Card — featured beauty ingredient deep-dive.
 * From Phase W6: Education & Empowerment — Ingredient Dictionary.
 *
 * Usage:
 *   <BeautyIngredientHighlightCard ingredient={{ name: 'زيت الأرغان', origin: 'المغرب', benefits: ['ترطيب', 'مضاد شيخوخة'] }} />
 */

interface Ingredient {
  name: string;
  emoji?: string;
  origin: string;
  benefits: string[];
  funFact?: string;
}

interface BeautyIngredientHighlightCardProps {
  ingredient: Ingredient;
  className?: string;
}

export function BeautyIngredientHighlightCard({
  ingredient,
  className = '',
}: BeautyIngredientHighlightCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {ingredient.emoji || '🧪'}
        </span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">مكون مميز</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">
            {ingredient.name} · {ingredient.origin}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">✨ الفوائد</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {ingredient.benefits.map((b) => (
            <span
              key={b}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-amber-700 dark:bg-gray-800 dark:text-amber-300"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {ingredient.funFact && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <p className="text-[10px] text-amber-700 dark:text-amber-300">💡 {ingredient.funFact}</p>
        </div>
      )}
    </div>
  );
}

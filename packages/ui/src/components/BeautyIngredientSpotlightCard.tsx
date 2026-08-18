'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Ingredient Spotlight Card — deep-dive on a single beauty ingredient.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyIngredientSpotlightCard ingredient={{ name: 'حمض الهيالورونيك', type: 'مرطب', rating: 'A+', description: 'يحمل 1000 ضعف وزنه ماء' }} />
 */

interface Ingredient {
  name: string;
  type: string;
  rating: string;
  description: string;
  emoji?: string;
  suitableFor?: string[];
  avoidWith?: string[];
}

interface BeautyIngredientSpotlightCardProps {
  ingredient: Ingredient;
  suitableLabel?: string;
  avoidLabel?: string;
  className?: string;
}

export function BeautyIngredientSpotlightCard({
  ingredient,
  suitableLabel = 'مناسب لـ',
  avoidLabel = 'لا يخلط مع',
  className = '',
}: BeautyIngredientSpotlightCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-5 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{ingredient.emoji || ''}</span>
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {ingredient.name}
            </h4>
            <p className="text-[10px] text-amber-500 dark:text-amber-400">{ingredient.type}</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          {ingredient.rating}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          {ingredient.description}
        </p>
      </div>

      {ingredient.suitableFor && (
        <div className="mt-2">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {suitableLabel}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ingredient.suitableFor.map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {ingredient.avoidWith && (
        <div className="mt-2">
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400"> {avoidLabel}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ingredient.avoidWith.map((a) => (
              <span
                key={a}
                className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

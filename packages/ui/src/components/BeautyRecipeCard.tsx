'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Recipe Card — DIY natural beauty recipes with kitchen ingredients.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyRecipeCard
 *     recipe={{ title: 'ماسك العسل والزبادي', ingredients: ['ملعقة عسل', 'ملعقة زبادي'], duration: '15 دقيقة' }}
 *   />
 */

interface BeautyRecipe {
  title: string;
  emoji?: string;
  ingredients: string[];
  steps: string[];
  duration: string;
  forSkin?: string;
}

interface BeautyRecipeCardProps {
  recipe: BeautyRecipe;
  className?: string;
}

export function BeautyRecipeCard({ recipe, className = '' }: BeautyRecipeCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {recipe.title}
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            {recipe.duration} · طبيعي 100%
            {recipe.forSkin && ` · ${recipe.forSkin}`}
          </p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300"> المكونات</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {recipe.ingredients.map((ing) => (
            <span
              key={ing}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-emerald-800 dark:bg-gray-800 dark:text-emerald-200"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100"> الطريقة</p>
        <div className="mt-1 space-y-1">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[8px] font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                {i + 1}
              </span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Caution */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        اختبري على جزء صغير من بشرتكِ قبل الاستخدام
      </p>
    </div>
  );
}

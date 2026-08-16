'use client';

import { cn } from '@galaxy/shared';

/**
 * Ingredient Glossary Card — beauty ingredient explained in Arabic.
 * From Phase W6: Education & Empowerment — Ingredient Dictionary.
 *
 * Usage:
 *   <IngredientGlossaryCard
 *     ingredient={{ name: 'فيتامين سي', type: 'active', benefits: ['تفتيح', 'مضاد أكسدة'] }}
 *   />
 */

type IngredientType =
  'active' | 'moisturizer' | 'exfoliant' | 'antioxidant' | 'sunscreen' | 'oil' | 'natural';

interface TypeDef {
  emoji: string;
  label: string;
  color: string;
}

const TYPES: Record<IngredientType, TypeDef> = {
  active: {
    emoji: '',
    label: 'مادة فعالة',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  moisturizer: {
    emoji: '',
    label: 'مرطب',
    color: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  exfoliant: {
    emoji: '',
    label: 'مقشر',
    color: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  antioxidant: {
    emoji: '️',
    label: 'مضاد أكسدة',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  sunscreen: {
    emoji: '️',
    label: 'واقي شمس',
    color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  },
  oil: {
    emoji: '🫒',
    label: 'زيت',
    color: 'bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  },
  natural: {
    emoji: '',
    label: 'طبيعي',
    color: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
};

interface Ingredient {
  name: string;
  type: IngredientType;
  /** Arabic name if ingredient is known by English name */
  arabicName?: string;
  benefits: string[];
  /** Skin types suitable for */
  suitableFor?: string[];
  /** Warnings */
  warnings?: string[];
  /** "safe for pregnancy" etc */
  safetyNote?: string;
}

interface IngredientGlossaryCardProps {
  ingredient: Ingredient;
  className?: string;
}

export function IngredientGlossaryCard({
  ingredient,
  className = '',
}: IngredientGlossaryCardProps): JSX.Element {
  const type = TYPES[ingredient.type];

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Ingredient name + type */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-lg dark:from-teal-900 dark:to-emerald-900"></div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {ingredient.name}
          </h4>
          {ingredient.arabicName && (
            <p className="text-[10px] text-text-tertiary dark:text-gray-500">
              {ingredient.arabicName}
            </p>
          )}
          <span
            className={cn(
              'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
              type.color,
            )}
          >
            {type.emoji} {type.label}
          </span>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300"> الفوائد</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {ingredient.benefits.map((b) => (
            <span
              key={b}
              className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-medium text-emerald-800 dark:bg-black/20 dark:text-emerald-200"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Suitable for */}
      {ingredient.suitableFor && ingredient.suitableFor.length > 0 && (
        <div className="mt-2 rounded-xl bg-sky-50 p-2.5 dark:bg-sky-950">
          <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300"> مناسب لـ</p>
          <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400">
            {ingredient.suitableFor.join(' · ')}
          </p>
        </div>
      )}

      {/* Warnings */}
      {ingredient.warnings && ingredient.warnings.length > 0 && (
        <div className="mt-2 rounded-xl bg-rose-50 p-2.5 dark:bg-rose-950">
          <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300"> تحذيرات</p>
          <ul className="mt-0.5 space-y-0.5">
            {ingredient.warnings.map((w) => (
              <li key={w} className="text-[10px] text-rose-600 dark:text-rose-400">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety note */}
      {ingredient.safetyNote && (
        <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-[10px] text-text-secondary dark:text-gray-300">
            {ingredient.safetyNote}
          </p>
        </div>
      )}

      {/* Arabic content badge */}
      <div className="mt-2 flex items-center gap-1 text-[9px] text-text-tertiary dark:text-gray-500">
        <span></span>
        <span>محتوى عربي — لأن المعرفة حق للجميع</span>
      </div>
    </div>
  );
}

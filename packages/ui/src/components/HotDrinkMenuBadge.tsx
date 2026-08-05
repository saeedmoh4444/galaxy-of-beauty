'use client';

import { cn } from '@galaxy/shared';

/**
 * Hot Drink Menu Badge — complimentary beverages with every service.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <HotDrinkMenuBadge drinks={['arabic_coffee', 'karak', 'herbal_tea']} />
 */

type Drink = 'arabic_coffee' | 'karak' | 'herbal_tea' | 'green_tea' | 'chamomile' | 'mint_tea' | 'latte' | 'hot_chocolate';

interface DrinkDef {
  emoji: string;
  name: string;
  description: string;
}

const DRINKS: Record<Drink, DrinkDef> = {
  arabic_coffee: { emoji: '☕', name: 'قهوة عربية', description: 'قهوة سعودية أصيلة بالهيل والزعفران' },
  karak: { emoji: '🍵', name: 'كرك', description: 'شاي كرك هندي بالحليب والتوابل' },
  herbal_tea: { emoji: '🌿', name: 'شاي أعشاب', description: 'مزيج أعشاب طبيعي مهدئ' },
  green_tea: { emoji: '🍃', name: 'شاي أخضر', description: 'شاي أخضر منعش مع نعناع' },
  chamomile: { emoji: '🌸', name: 'بابونج', description: 'شاي بابونج للاسترخاء' },
  mint_tea: { emoji: '🌱', name: 'شاي نعناع', description: 'شاي نعناع طازج منعش' },
  latte: { emoji: '🥛', name: 'لاتيه', description: 'قهوة لاتيه كريمية' },
  hot_chocolate: { emoji: '🍫', name: 'شوكولاتة ساخنة', description: 'شوكولاتة ساخنة غنية' },
};

interface HotDrinkMenuBadgeProps {
  drinks: Drink[];
  /** Whether drinks are complimentary */
  complimentary?: boolean;
  className?: string;
}

export function HotDrinkMenuBadge({
  drinks,
  complimentary = true,
  className = '',
}: HotDrinkMenuBadgeProps): JSX.Element | null {
  if (!drinks.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">☕</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
            قائمة المشروبات
          </h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">
            {complimentary ? 'مجاناً مع كل خدمة' : 'متوفرة حسب الطلب'}
          </p>
        </div>
        {complimentary && (
          <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            🎁 مجاناً
          </span>
        )}
      </div>

      {/* Drink menu */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {drinks.map((d) => {
          const drink = DRINKS[d];
          return (
            <div
              key={d}
              className="flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950"
            >
              <span className="text-lg shrink-0" aria-hidden="true">{drink.emoji}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200 truncate">
                  {drink.name}
                </p>
                <p className="text-[9px] text-amber-600 dark:text-amber-400 truncate">
                  {drink.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warm touch */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        ☕ &ldquo;القهوة العربية جزء من كرم الضيافة السعودية&rdquo;
      </p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Hot Drink Menu Badge — complimentary beverages with every service.
 * From Phase W9: The Small Details — Thoughtful Touches.
 *
 * Usage:
 *   <HotDrinkMenuBadge drinks={['arabic_coffee', 'karak', 'herbal_tea']} />
 */

type Drink =
  | 'arabic_coffee'
  | 'karak'
  | 'herbal_tea'
  | 'green_tea'
  | 'chamomile'
  | 'mint_tea'
  | 'latte'
  | 'hot_chocolate';

interface DrinkDef {
  emoji: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
}

const DRINKS: Record<Drink, DrinkDef> = {
  arabic_coffee: {
    emoji: '',
    name: { ar: 'قهوة عربية', en: 'Arabic coffee' },
    description: {
      ar: 'قهوة سعودية أصيلة بالهيل والزعفران',
      en: 'Authentic Saudi coffee with cardamom and saffron',
    },
  },
  karak: {
    emoji: '',
    name: { ar: 'كرك', en: 'Karak tea' },
    description: {
      ar: 'شاي كرك هندي بالحليب والتوابل',
      en: 'Indian karak tea with milk and spices',
    },
  },
  herbal_tea: {
    emoji: '',
    name: { ar: 'شاي أعشاب', en: 'Herbal tea' },
    description: { ar: 'مزيج أعشاب طبيعي مهدئ', en: 'A calming natural herbal blend' },
  },
  green_tea: {
    emoji: '',
    name: { ar: 'شاي أخضر', en: 'Green tea' },
    description: { ar: 'شاي أخضر منعش مع نعناع', en: 'Refreshing green tea with mint' },
  },
  chamomile: {
    emoji: '',
    name: { ar: 'بابونج', en: 'Chamomile' },
    description: { ar: 'شاي بابونج للاسترخاء', en: 'Chamomile tea for relaxation' },
  },
  mint_tea: {
    emoji: '',
    name: { ar: 'شاي نعناع', en: 'Mint tea' },
    description: { ar: 'شاي نعناع طازج منعش', en: 'Fresh and refreshing mint tea' },
  },
  latte: {
    emoji: '',
    name: { ar: 'لاتيه', en: 'Latte' },
    description: { ar: 'قهوة لاتيه كريمية', en: 'Creamy latte coffee' },
  },
  hot_chocolate: {
    emoji: '',
    name: { ar: 'شوكولاتة ساخنة', en: 'Hot chocolate' },
    description: { ar: 'شوكولاتة ساخنة غنية', en: 'Rich hot chocolate' },
  },
};

interface HotDrinkMenuBadgeProps {
  drinks: Drink[];
  /** Whether drinks are complimentary */
  complimentary?: boolean;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle when drinks are complimentary */
  complimentaryText?: string;
  /** Subtitle when drinks are on request */
  onRequestText?: string;
  /** Free badge label */
  freeBadgeText?: string;
  /** Footer quote */
  quoteText?: string;
  /** Display locale for drink names and descriptions */
  locale?: 'ar' | 'en';
}

export function HotDrinkMenuBadge({
  drinks,
  complimentary = true,
  className = '',
  title = 'قائمة المشروبات',
  complimentaryText = 'مجاناً مع كل خدمة',
  onRequestText = 'متوفرة حسب الطلب',
  freeBadgeText = 'مجاناً',
  quoteText = '“القهوة العربية جزء من كرم الضيافة السعودية”',
  locale = 'ar',
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
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">
            {complimentary ? complimentaryText : onRequestText}
          </p>
        </div>
        {complimentary && (
          <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {freeBadgeText}
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
              <span className="text-lg shrink-0" aria-hidden="true">
                {drink.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200 truncate">
                  {drink.name[locale]}
                </p>
                <p className="text-[9px] text-amber-600 dark:text-amber-400 truncate">
                  {drink.description[locale]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warm touch */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {quoteText}
      </p>
    </div>
  );
}

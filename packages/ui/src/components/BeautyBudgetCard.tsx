'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Budget Card — curated services under 100 SAR.
 * From Phase W5: Financial Empowerment — "Beauty on a Budget".
 *
 * Usage:
 *   <BeautyBudgetCard services={[{ name: 'مانيكير سريع', price: 49, category: 'nails' }]} />
 */

type BudgetCategory = 'nails' | 'hair' | 'facial' | 'massage' | 'makeup' | 'henna' | 'brows' | 'waxing';

interface CategoryDef {
  emoji: string;
  label: string;
}

const CATEGORIES: Record<BudgetCategory, CategoryDef> = {
  nails: { emoji: '💅', label: 'أظافر' },
  hair: { emoji: '💇', label: 'شعر' },
  facial: { emoji: '🧖', label: 'بشرة' },
  massage: { emoji: '💆', label: 'مساج' },
  makeup: { emoji: '💄', label: 'مكياج' },
  henna: { emoji: '🤚', label: 'حناء' },
  brows: { emoji: '✨', label: 'حواجب' },
  waxing: { emoji: '🕯️', label: 'إزالة شعر' },
};

interface BudgetService {
  name: string;
  price: number;
  category: BudgetCategory;
  /** Original price if on sale */
  originalPrice?: number;
  /** Rating 0-5 */
  rating?: number;
  /** "30 min" etc */
  duration?: string;
}

interface BeautyBudgetCardProps {
  services: BudgetService[];
  maxPrice?: number;
  className?: string;
}

export function BeautyBudgetCard({
  services,
  maxPrice = 100,
  className = '',
}: BeautyBudgetCardProps): JSX.Element | null {
  if (!services.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-lime-100 bg-white p-5 dark:border-lime-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">💰</span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              جمال بالميزانية
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              خدمات منتقاة بأقل من {maxPrice} ريال
            </p>
          </div>
        </div>
        <span className="rounded-full bg-lime-50 px-2.5 py-1 text-[10px] font-bold text-lime-700 dark:bg-lime-950 dark:text-lime-300">
          {services.length} خدمات
        </span>
      </div>

      {/* Service list */}
      <div className="mt-3 space-y-2">
        {services.map((service, i) => {
          const cat = CATEGORIES[service.category];
          const discount = service.originalPrice
            ? Math.round((1 - service.price / service.originalPrice) * 100)
            : 0;

          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5 transition-colors hover:bg-lime-50 dark:bg-gray-800 dark:hover:bg-lime-950"
            >
              {/* Category icon */}
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm dark:bg-gray-700"
                aria-label={cat.label}
              >
                {cat.emoji}
              </span>

              {/* Name + meta */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-primary dark:text-gray-100">
                  {service.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary dark:text-gray-500">
                  <span>{cat.label}</span>
                  {service.duration && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{service.duration}</span>
                    </>
                  )}
                  {service.rating && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-500">★ {service.rating}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold text-lime-700 dark:text-lime-400">
                  {service.price} ر.س
                </div>
                {service.originalPrice && (
                  <div className="text-[10px]">
                    <span className="text-text-tertiary line-through dark:text-gray-500">
                      {service.originalPrice} ر.س
                    </span>
                    <span className="ml-1 font-bold text-rose-600 dark:text-rose-400">
                      -{discount}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-3 text-center text-[10px] text-text-tertiary dark:text-gray-500">
        ✨ الجمال مش لازم يكون غالي — اكتشفي خدمات رائعة بميزانيتكِ
      </p>
    </div>
  );
}

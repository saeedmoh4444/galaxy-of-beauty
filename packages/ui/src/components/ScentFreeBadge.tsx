'use client';

import { cn } from '@galaxy/shared';

/**
 * Scent-Free Badge — signals fragrance-free product options available.
 * From Phase W8: Accessibility — Neurodivergent-Friendly.
 *
 * Usage:
 *   <ScentFreeBadge productTypes={['facial', 'hair', 'body']} />
 */

type ProductType = 'facial' | 'hair' | 'body' | 'makeup' | 'nail' | 'wax';

interface TypeDef {
  emoji: string;
  label: { ar: string; en: string };
}

const TYPES: Record<ProductType, TypeDef> = {
  facial: { emoji: '', label: { ar: 'عناية بالبشرة', en: 'Skincare' } },
  hair: { emoji: '', label: { ar: 'عناية بالشعر', en: 'Haircare' } },
  body: { emoji: '', label: { ar: 'عناية بالجسم', en: 'Body care' } },
  makeup: { emoji: '', label: { ar: 'مكياج', en: 'Makeup' } },
  nail: { emoji: '', label: { ar: 'أظافر', en: 'Nails' } },
  wax: { emoji: '️', label: { ar: 'إزالة شعر', en: 'Hair removal' } },
};

interface ScentFreeBadgeProps {
  productTypes: ProductType[];
  /** Whether all products are fragrance-free by default */
  fullyScentFree?: boolean;
  className?: string;
  /** Badge heading */
  title?: string;
  /** Subtitle when the whole salon is fragrance-free */
  fullyScentFreeSubtitle?: string;
  /** Subtitle when products are fragrance-free on request */
  partiallyScentFreeSubtitle?: string;
  /** "Why fragrance-free" heading */
  whyTitle?: string;
  /** Benefits bullet list items */
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  benefit4?: string;
  /** Booking request note */
  requestNote?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for product type labels */
  locale?: 'ar' | 'en';
}

export function ScentFreeBadge({
  productTypes,
  fullyScentFree = false,
  className = '',
  title = 'خالٍ من العطور',
  fullyScentFreeSubtitle = 'صالون خالٍ تماماً من العطور القوية',
  partiallyScentFreeSubtitle = 'منتجات خالية من العطور متوفرة حسب الطلب',
  whyTitle = 'لماذا خالٍ من العطور؟',
  benefit1 = '• مناسب للبشرة الحساسة والحوامل',
  benefit2 = '• مريح لذوات الحساسية التنفسية',
  benefit3 = '• آمن لمرضى الشقيقة والصداع النصفي',
  benefit4 = '• خيار مريح للحواس — بدون روائح قوية',
  requestNote = 'اطلبي “خالٍ من العطور” عند الحجز — سنجهز كل شيء مسبقاً',
  footerText = 'الجمال الطبيعي لا يحتاج إلى عطور قوية',
  locale = 'ar',
}: ScentFreeBadgeProps): JSX.Element | null {
  if (!productTypes.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-green-100 bg-white p-4 dark:border-green-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">{title}</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">
            {fullyScentFree ? fullyScentFreeSubtitle : partiallyScentFreeSubtitle}
          </p>
        </div>
        {fullyScentFree && (
          <span className="ml-auto shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
            100%
          </span>
        )}
      </div>

      {/* Product type chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {productTypes.map((pt) => {
          const t = TYPES[pt];
          return (
            <span
              key={pt}
              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              {t.emoji} {t.label[locale]}
            </span>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mt-3 rounded-xl bg-green-50 p-3 dark:bg-green-950">
        <p className="text-[10px] font-bold text-green-800 dark:text-green-200">{whyTitle}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-green-700 dark:text-green-300">
          <p>{benefit1}</p>
          <p>{benefit2}</p>
          <p>{benefit3}</p>
          <p>{benefit4}</p>
        </div>
      </div>

      {/* Request note */}
      {!fullyScentFree && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
            {requestNote}
          </p>
        </div>
      )}

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Galentine's Card — celebrate female friendship on February 13.
 * From Phase W7: Mother-Daughter & Family — Friends Who Slay Together.
 *
 * Usage:
 *   <GalentinesCard friends={['نورة', 'مها']} onBook={() => {}} />
 */

interface GalentinesCardProps {
  friends: string[];
  /** February 13 is the default */
  date?: string;
  /** Discount percentage for group booking */
  discount?: number;
  totalPrice?: number;
  onBook?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Text after the date */
  subtitle?: string;
  /** Label above the friend chips */
  withYouLabel?: string;
  /** Chip label for the user herself */
  youLabel?: string;
  /** Title of the included items box */
  includesLabel?: string;
  /** Label for the total box */
  totalLabel?: string;
  /** Label for the per-person box */
  perPersonLabel?: string;
  /** Label for the discount box */
  discountLabel?: string;
  /** Currency suffix for prices */
  currencySuffix?: string;
  /** Book button label */
  bookLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal included-items data strings */
  locale?: 'ar' | 'en';
}

const INCLUDED_ITEMS: { ar: string; en: string }[] = [
  { ar: 'مانيكير للجميع', en: 'Manicure for everyone' },
  { ar: 'ماسك وجه', en: 'Face mask' },
  { ar: 'شاي وحلويات', en: 'Tea and sweets' },
  { ar: 'جلسة تصوير جماعية', en: 'Group photo session' },
  { ar: 'هدية لكل صديقة', en: 'A gift for every friend' },
  { ar: 'موسيقى وبالونات', en: 'Music and balloons' },
];

export function GalentinesCard({
  friends,
  date = '13 فبراير',
  discount = 20,
  totalPrice = 450,
  onBook,
  className = '',
  title = 'يوم الصديقات',
  subtitle = '— احتفلي بصداقاتكِ',
  withYouLabel = 'معكِ في هذا اليوم',
  youLabel = 'أنتِ',
  includesLabel = ' الباقة تشمل',
  totalLabel = 'الإجمالي',
  perPersonLabel = 'للفرد',
  discountLabel = 'الخصم',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي يوم الصديقات',
  footerText = 'لأن الصديقات هن العائلة التي نختارها',
  locale = 'ar',
}: GalentinesCardProps): JSX.Element {
  const pricePerPerson = Math.round(totalPrice / (friends.length + 1)); // +1 for the user

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-2xl dark:from-pink-800 dark:to-rose-800"></div>
        <h4 className="mt-2 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {date} {subtitle}
        </p>
      </div>

      {/* Friend list */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">{withYouLabel}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-bold text-pink-700 dark:bg-pink-900 dark:text-pink-300">
            {youLabel}
          </span>
          {friends.map((name) => (
            <span
              key={name}
              className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-medium text-rose-700 dark:bg-rose-900 dark:text-rose-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{includesLabel}</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          {INCLUDED_ITEMS.map((item) => (
            <span key={item.ar}>• {item[locale]}</span>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{totalLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {totalPrice} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{perPersonLabel}</p>
          <p className="text-xs font-bold text-pink-700 dark:text-pink-400">
            {pricePerPerson} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{discountLabel}</p>
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">-{discount}%</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm shadow-pink-200 dark:shadow-pink-900"
      >
        {bookLabel}
      </button>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{footerText}</p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Personal Styling Card — personal style and color consultation.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <PersonalStylingCard stylist="نورة" onBook={() => {}} />
 */

interface PersonalStylingCardProps {
  stylist?: string;
  price?: number;
  duration?: string;
  onBook?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Prefix before the stylist name */
  withStylistPrefix?: string;
  /** Price stat label */
  priceLabel?: string;
  /** Currency suffix for the price */
  currencySuffix?: string;
  /** Duration stat label */
  durationLabel?: string;
  /** Book button label */
  bookButtonText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for included-items labels */
  locale?: 'ar' | 'en';
}

const INCLUDES = [
  { emoji: '', label: { ar: 'تحليل لون البشرة', en: 'Skin tone analysis' } },
  { emoji: '', label: { ar: 'تحديد نمط الملابس', en: 'Determine clothing style' } },
  { emoji: '', label: { ar: 'ألوان المكياج المناسبة', en: 'Suitable makeup colors' } },
  { emoji: '', label: { ar: 'تسريحات تناسب وجهكِ', en: 'Hairstyles that suit your face' } },
  { emoji: '', label: { ar: 'جلسة تصوير للإطلالة', en: 'Outfit photo session' } },
  { emoji: '', label: { ar: 'تقرير شخصي شامل', en: 'Comprehensive personal report' } },
];

export function PersonalStylingCard({
  stylist,
  price = 400,
  duration = '90 دقيقة',
  onBook,
  className = '',
  title = 'استشارة الإطلالة',
  subtitle = 'اكتشفي ألوانكِ وأسلوبكِ الخاص',
  withStylistPrefix = '‍ مع خبيرة الإطلالة: ',
  priceLabel = 'السعر',
  currencySuffix = 'ر.س',
  durationLabel = 'المدة',
  bookButtonText = 'احجزي استشارتكِ',
  footerText = 'لأن لكل امرأة ألوانها الخاصة',
  locale = 'ar',
}: PersonalStylingCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-5 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{title}</h4>
        <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        {stylist && (
          <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-500">
            {withStylistPrefix}
            {stylist}
          </p>
        )}
      </div>

      {/* What's included */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {INCLUDES.map((item) => (
          <div
            key={item.label.ar}
            className="flex items-center gap-2 rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm shrink-0" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-[10px] font-medium text-fuchsia-800 dark:text-fuchsia-200">
              {item.label[locale]}
            </span>
          </div>
        ))}
      </div>

      {/* Price + duration */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-fuchsia-50 p-2.5 text-center dark:bg-fuchsia-950">
          <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{priceLabel}</p>
          <p className="text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">
            {price} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-fuchsia-50 p-2.5 text-center dark:bg-fuchsia-950">
          <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{durationLabel}</p>
          <p className="text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">{duration}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-fuchsia-600 py-2.5 text-xs font-bold text-white hover:bg-fuchsia-700 active:scale-[0.98] transition-all"
      >
        {bookButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

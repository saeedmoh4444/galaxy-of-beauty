'use client';

import { cn } from '@galaxy/shared';

/**
 * Career Beauty Card — professional makeup & quick lunch-break services.
 * From Phase W2: Life Stage Beauty — Career & Confidence (25-35).
 *
 * Usage:
 *   <CareerBeautyCard profession="office" onBook={() => {}} />
 */

type Profession =
  'office' | 'healthcare' | 'education' | 'entrepreneur' | 'media' | 'customer_facing';

interface ProfDef {
  emoji: string;
  title: { ar: string; en: string };
  look: { ar: string; en: string };
  services: { ar: string; en: string }[];
}

const PROFS: Record<Profession, ProfDef> = {
  office: {
    emoji: '',
    title: { ar: 'مكتبية', en: 'Office' },
    look: { ar: 'مكياج ناعم احترافي', en: 'Soft professional makeup' },
    services: [
      { ar: 'مكياج يومي سريع', en: 'Quick daily makeup' },
      { ar: 'تسريحة عملية', en: 'Practical hairstyle' },
      { ar: 'مانيكير', en: 'Manicure' },
    ],
  },
  healthcare: {
    emoji: '🩺',
    title: { ar: 'طبية', en: 'Healthcare' },
    look: { ar: 'إطلالة عملية ونظيفة', en: 'Practical, clean look' },
    services: [
      { ar: 'عناية بالبشرة', en: 'Skincare' },
      { ar: 'حواجب مرتبة', en: 'Tidy brows' },
      { ar: 'أظافر قصيرة', en: 'Short nails' },
    ],
  },
  education: {
    emoji: '',
    title: { ar: 'تعليمية', en: 'Education' },
    look: { ar: 'مكياج خفيف ولطيف', en: 'Light, gentle makeup' },
    services: [
      { ar: 'تنظيف بشرة', en: 'Skin cleansing' },
      { ar: 'ترطيب', en: 'Moisturizing' },
      { ar: 'مكياج خفيف', en: 'Light makeup' },
    ],
  },
  entrepreneur: {
    emoji: '',
    title: { ar: 'رائدة أعمال', en: 'Entrepreneur' },
    look: { ar: 'إطلالة قوية وواثقة', en: 'Strong, confident look' },
    services: [
      { ar: 'مكياج احترافي', en: 'Professional makeup' },
      { ar: 'تسريحة قوية', en: 'Power hairstyle' },
      { ar: 'استشارة ألوان', en: 'Color consultation' },
    ],
  },
  media: {
    emoji: '',
    title: { ar: 'إعلامية', en: 'Media' },
    look: { ar: 'مكياج كاميرا', en: 'Camera makeup' },
    services: [
      { ar: 'مكياج HD', en: 'HD makeup' },
      { ar: 'تسريحة', en: 'Hair styling' },
      { ar: 'مانيكير وباديكير', en: 'Manicure and pedicure' },
    ],
  },
  customer_facing: {
    emoji: '',
    title: { ar: 'خدمة عملاء', en: 'Customer service' },
    look: { ar: 'إطلالة ودودة وجذابة', en: 'Friendly, attractive look' },
    services: [
      { ar: 'مكياج طبيعي', en: 'Natural makeup' },
      { ar: 'ابتسامة هوليوود', en: 'Hollywood smile' },
      { ar: 'عناية بالأظافر', en: 'Nail care' },
    ],
  },
};

interface CareerBeautyCardProps {
  profession: Profession;
  onBook?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Label for the quick services section */
  servicesLabel?: string;
  /** Lunch break special title */
  lunchTitle?: string;
  /** Lunch break special note */
  lunchNote?: string;
  /** Lunch break special price */
  lunchPrice?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal profession data strings */
  locale?: 'ar' | 'en';
}

export function CareerBeautyCard({
  profession,
  onBook,
  className = '',
  title = 'جمال المهنة',
  servicesLabel = 'خدمات سريعة (30 دقيقة)',
  lunchTitle = 'خدمة استراحة الغداء',
  lunchNote = 'احجزي في استراحة غدائكِ — 30 دقيقة فقط',
  lunchPrice = '150 ر.س',
  bookLabel = 'احجزي استراحة جمالكِ',
  footerText = 'المرأة العاملة تستحق أن تتألق — حتى في أكثر أيامها انشغالاً',
  locale = 'ar',
}: CareerBeautyCardProps): JSX.Element {
  const prof = PROFS[profession];

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-5 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-2xl dark:from-sky-900 dark:to-blue-900">
          {prof.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {prof.title[locale]} — {prof.look[locale]}
          </p>
        </div>
      </div>

      {/* Quick services highlight */}
      <div className="mt-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-950">
        <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300">{servicesLabel}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {prof.services.map((s) => (
            <span
              key={s.ar}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-sky-700 dark:bg-gray-800 dark:text-sky-300"
            >
              {s[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Lunch break special */}
      <div className="mt-2 rounded-xl bg-gradient-to-r from-sky-100 to-blue-100 p-3 dark:from-sky-900 dark:to-blue-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden="true"></span>
            <div>
              <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">{lunchTitle}</p>
              <p className="text-[10px] text-sky-600 dark:text-sky-400">{lunchNote}</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-gray-800 dark:text-sky-300">
            {lunchPrice}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
      >
        {bookLabel}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

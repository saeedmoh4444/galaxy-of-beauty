'use client';

import { cn } from '@galaxy/shared';

/**
 * Golden Beauty Card — gentle treatments for mature skin, classic timeless styles.
 * From Phase W2: Life Stage Beauty — Golden Beauty (55+).
 *
 * Usage:
 *   <GoldenBeautyCard age={62} onBook={() => {}} />
 */

interface GoldenService {
  emoji: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  duration: { ar: string; en: string };
}

const SERVICES: GoldenService[] = [
  {
    emoji: '‍️',
    name: { ar: 'عناية لطيفة بالبشرة', en: 'Gentle skincare' },
    description: {
      ar: 'تنظيف وترطيب عميق للبشرة الناضجة',
      en: 'Deep cleansing and hydration for mature skin',
    },
    price: 200,
    duration: { ar: '60 دقيقة', en: '60 minutes' },
  },
  {
    emoji: '‍️',
    name: { ar: 'مساج كلاسيكي', en: 'Classic massage' },
    description: {
      ar: 'مساج لطيف للعضلات والمفاصل',
      en: 'Gentle massage for muscles and joints',
    },
    price: 180,
    duration: { ar: '45 دقيقة', en: '45 minutes' },
  },
  {
    emoji: '',
    name: { ar: 'تسريحة كلاسيكية', en: 'Classic hairstyle' },
    description: {
      ar: 'تسريحة ناعمة تليق بجمالكِ',
      en: 'A soft hairstyle befitting your beauty',
    },
    price: 150,
    duration: { ar: '45 دقيقة', en: '45 minutes' },
  },
  {
    emoji: '',
    name: { ar: 'مكياج ناعم', en: 'Soft makeup' },
    description: {
      ar: 'مكياج خفيف يبرز جمالكِ الطبيعي',
      en: 'Light makeup that highlights your natural beauty',
    },
    price: 160,
    duration: { ar: '40 دقيقة', en: '40 minutes' },
  },
  {
    emoji: '',
    name: { ar: 'مانيكير لطيف', en: 'Gentle manicure' },
    description: {
      ar: 'عناية بالأظافر مع ترطيب',
      en: 'Nail care with moisturizing',
    },
    price: 100,
    duration: { ar: '30 دقيقة', en: '30 minutes' },
  },
];

interface GoldenBeautyCardProps {
  age?: number;
  onBook?: (serviceName: string) => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Subtitle for golden-age clients */
  goldenSubtitle?: string;
  /** Subtitle for mature skin in general */
  matureSkinSubtitle?: string;
  /** Discount section title */
  discountTitle?: string;
  /** Discount section text */
  discountText?: string;
  /** Label for the services section */
  servicesLabel?: string;
  /** Currency suffix shown after prices */
  currencySuffix?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Gentle promise text */
  promiseText?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal service data strings */
  locale?: 'ar' | 'en';
}

export function GoldenBeautyCard({
  age,
  onBook,
  className = '',
  title = 'الجمال الذهبي',
  goldenSubtitle = 'عناية خاصة تناسب جمالكِ في سن',
  matureSkinSubtitle = 'عناية لطيفة للبشرة الناضجة',
  discountTitle = 'خصم الساعة الذهبية',
  discountText = '20% خصم على جميع الخدمات من 9 صباحاً إلى 12 ظهراً',
  servicesLabel = 'خدمات مختارة لكِ',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي',
  promiseText = 'نعدكِ: لا منتجات قاسية · لا استعجال · احترام كامل لراحتكِ',
  footerText = 'الجمال ليس له عمر — وأنتِ أجمل في كل مرحلة',
  locale = 'ar',
}: GoldenBeautyCardProps): JSX.Element {
  const isGolden = age !== undefined && age >= 55;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {isGolden ? `${goldenSubtitle} ${age}` : matureSkinSubtitle}
        </p>
      </div>

      {/* Special discount */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-lg" aria-hidden="true"></p>
        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{discountTitle}</p>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">{discountText}</p>
      </div>

      {/* Services */}
      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{servicesLabel}</p>
        {SERVICES.map((s) => (
          <div
            key={s.name.ar}
            className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60"
          >
            <span className="text-xl shrink-0" aria-hidden="true">
              {s.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                {s.name[locale]}
              </p>
              <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                {s.description[locale]} · {s.duration[locale]}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                {s.price} {currencySuffix}
              </p>
              <button
                type="button"
                onClick={() => onBook?.(s.name.ar)}
                className="mt-0.5 rounded-lg bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-amber-700"
              >
                {bookLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gentle promise */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-center text-[10px] font-medium text-amber-700 dark:text-amber-300">
          {promiseText}
        </p>
      </div>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}

'use client';

import { cn } from '@galaxy/shared';

/**
 * Three Generations Card — grandmother, mother, daughter spa day.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <ThreeGenerationsCard generations={{ grandma: 'أم خالد', mom: 'نورة', daughter: 'سارة' }} />
 */

interface GenerationMember {
  name: string;
  service?: string;
  emoji?: string;
}

const INCLUDED_ITEMS: { ar: string; en: string }[] = [
  { ar: 'عناية بالبشرة للثلاثة', en: 'Skincare for all three' },
  { ar: 'مانيكير وباديكير', en: 'Manicure and pedicure' },
  { ar: 'تسريحة شعر', en: 'Hair styling' },
  { ar: 'مكياج ناعم', en: 'Soft makeup' },
  { ar: 'شاي وحلويات', en: 'Tea and sweets' },
  { ar: 'جلسة تصوير', en: 'Photo session' },
];

interface ThreeGenerationsCardProps {
  generations: {
    grandma: GenerationMember;
    mom: GenerationMember;
    daughter: GenerationMember;
  };
  totalPrice?: number;
  duration?: string;
  onBook?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label for the duration box */
  durationLabel?: string;
  /** Label for the price box */
  priceLabel?: string;
  /** Currency suffix shown after prices */
  currencySuffix?: string;
  /** Label for the per-person box */
  perPersonLabel?: string;
  /** Label for the included items section */
  includesLabel?: string;
  /** Memory keepsake text */
  keepsakeText?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Locale for internal generation labels */
  locale?: 'ar' | 'en';
}

export function ThreeGenerationsCard({
  generations,
  totalPrice = 800,
  duration = '4 ساعات',
  onBook,
  className = '',
  title = 'ثلاث أجيال من الجمال',
  subtitle = 'جدة، أم، وابنة — يوم سبا لا يُنسى',
  durationLabel = 'المدة',
  priceLabel = 'السعر',
  currencySuffix = 'ر.س',
  perPersonLabel = 'للفرد',
  includesLabel = ' تشمل الباقة',
  keepsakeText = 'صورة تذكارية للثلاثة أجيال — هديتنا لكِ',
  bookLabel = 'احجزي للعائلة',
  locale = 'ar',
}: ThreeGenerationsCardProps): JSX.Element {
  const members: {
    key: string;
    data: GenerationMember;
    label: { ar: string; en: string };
    color: string;
    gradient: string;
  }[] = [
    {
      key: 'grandma',
      data: generations.grandma,
      label: { ar: 'الجدة', en: 'Grandma' },
      color: 'text-amber-700 dark:text-amber-300',
      gradient: 'from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900',
    },
    {
      key: 'mom',
      data: generations.mom,
      label: { ar: 'الأم', en: 'Mom' },
      color: 'text-rose-700 dark:text-rose-300',
      gradient: 'from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900',
    },
    {
      key: 'daughter',
      data: generations.daughter,
      label: { ar: 'الابنة', en: 'Daughter' },
      color: 'text-purple-700 dark:text-purple-300',
      gradient: 'from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900',
    },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-amber-50/50 p-5 dark:border-rose-900 dark:from-rose-950/30 dark:to-amber-950/30',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-text-primary dark:text-gray-100">{title}</h4>
        <p className="text-[10px] text-text-tertiary dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Three generations */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {members.map((member) => (
          <div
            key={member.key}
            className={cn('rounded-xl bg-gradient-to-br p-3 text-center', member.gradient)}
          >
            <span className="text-2xl" aria-hidden="true">
              {member.data.emoji ||
                (member.key === 'grandma' ? '' : member.key === 'mom' ? '' : '')}
            </span>
            <p className={cn('mt-1 text-[10px] font-bold', member.color)}>{member.label[locale]}</p>
            <p className="text-[10px] font-semibold text-text-primary dark:text-gray-100">
              {member.data.name}
            </p>
            {member.data.service && (
              <p className="mt-0.5 text-[9px] text-text-tertiary dark:text-gray-400">
                {member.data.service}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Package details */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{durationLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{duration}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{priceLabel}</p>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
            {totalPrice} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{perPersonLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {Math.round(totalPrice / 3)} {currencySuffix}
          </p>
        </div>
      </div>

      {/* What's included */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {includesLabel}
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          {INCLUDED_ITEMS.map((item) => (
            <span key={item.ar}>• {item[locale]}</span>
          ))}
        </div>
      </div>

      {/* Memory keepsake */}
      <div className="mt-2 rounded-lg bg-rose-50 p-2 text-center dark:bg-rose-950">
        <p className="text-[10px] font-medium text-rose-700 dark:text-rose-300">{keepsakeText}</p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-2.5 text-xs font-bold text-white hover:from-rose-600 hover:to-amber-600 active:scale-[0.98] transition-all shadow-sm"
      >
        {bookLabel}
      </button>
    </div>
  );
}

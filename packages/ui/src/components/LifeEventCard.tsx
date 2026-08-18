'use client';

import { cn } from '@galaxy/shared';

/**
 * Life Event Card — beauty packages for major life moments.
 * From Phase W2: Life Stage Beauty — Life Event Packages.
 *
 * Usage:
 *   <LifeEventCard event="wedding" onBook={() => {}} />
 */

type LifeEvent =
  | 'graduation'
  | 'new_job'
  | 'wedding'
  | 'pregnancy'
  | 'new_mother'
  | 'birthday'
  | 'hajj_umrah'
  | 'divorce_recovery';

interface EventDef {
  emoji: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  packageName: { ar: string; en: string };
  contents: { ar: string; en: string }[];
  price: number;
  color: string;
  gradient: string;
}

const EVENTS: Record<LifeEvent, EventDef> = {
  graduation: {
    emoji: '',
    title: { ar: 'تخرج', en: 'Graduation' },
    description: {
      ar: 'انطلاقة جديدة تليق بإنجازكِ',
      en: 'A fresh start worthy of your achievement',
    },
    packageName: { ar: 'إشراقة الخريجة', en: 'Graduate glow' },
    contents: [
      { ar: 'مكياج احترافي', en: 'Professional makeup' },
      { ar: 'تسريحة شعر', en: 'Hair styling' },
      { ar: 'مانيكير', en: 'Manicure' },
      { ar: 'جلسة تصوير', en: 'Photo session' },
    ],
    price: 450,
    color: 'border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20',
    gradient: 'from-amber-500 to-yellow-500',
  },
  new_job: {
    emoji: '',
    title: { ar: 'وظيفة جديدة', en: 'New job' },
    description: { ar: 'انطباع أول لا يُنسى', en: 'An unforgettable first impression' },
    packageName: { ar: 'جاهزة ليومي الأول', en: 'Ready for my first day' },
    contents: [
      { ar: 'مكياج احترافي', en: 'Professional makeup' },
      { ar: 'استشارة إطلالة', en: 'Look consultation' },
      { ar: 'جلسة تصوير للملف', en: 'Portfolio photo session' },
    ],
    price: 350,
    color: 'border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20',
    gradient: 'from-blue-500 to-sky-500',
  },
  wedding: {
    emoji: '',
    title: { ar: 'زواج', en: 'Wedding' },
    description: { ar: 'رحلة متكاملة ليوم العمر', en: 'A complete journey for the big day' },
    packageName: { ar: 'رحلة العروس', en: 'Bride journey' },
    contents: [
      { ar: '6 أشهر عناية بالبشرة', en: '6 months of skincare' },
      { ar: 'تجربة مكياج', en: 'Makeup trial' },
      { ar: 'ليلة الحناء', en: 'Henna night' },
      { ar: 'يوم الزفاف', en: 'Wedding day' },
      { ar: 'شهر عسل', en: 'Honeymoon' },
    ],
    price: 2500,
    color: 'border-rose-200 bg-rose-50/30 dark:border-rose-900 dark:bg-rose-950/20',
    gradient: 'from-rose-500 to-pink-500',
  },
  pregnancy: {
    emoji: '',
    title: { ar: 'حمل', en: 'Pregnancy' },
    description: { ar: 'عناية خاصة بكِ وبطفلكِ', en: 'Special care for you and your baby' },
    packageName: { ar: 'الأم المتوهجة', en: 'Radiant mother' },
    contents: [
      { ar: 'مساج ما قبل الولادة', en: 'Prenatal massage' },
      { ar: 'عناية بالبشرة آمنة', en: 'Safe skincare' },
      { ar: 'باديكير', en: 'Pedicure' },
      { ar: 'كريمات ترطيب', en: 'Moisturizing creams' },
    ],
    price: 300,
    color: 'border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20',
    gradient: 'from-purple-500 to-violet-500',
  },
  new_mother: {
    emoji: '',
    title: { ar: 'أمومة جديدة', en: 'New motherhood' },
    description: { ar: 'استعيدي نضارتكِ بعد الولادة', en: 'Regain your glow after childbirth' },
    packageName: { ar: 'انتعاشة الأم', en: 'Mother refresh' },
    contents: [
      { ar: 'عناية بالبشرة سريعة', en: 'Quick skincare' },
      { ar: 'تسريحة شعر سريعة', en: 'Quick hair styling' },
      { ar: 'مانيكير', en: 'Manicure' },
      { ar: 'جلسة استرخاء', en: 'Relaxation session' },
    ],
    price: 250,
    color: 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20',
    gradient: 'from-emerald-500 to-teal-500',
  },
  birthday: {
    emoji: '',
    title: { ar: 'عيد ميلاد', en: 'Birthday' },
    description: {
      ar: 'احتفلي بنفسكِ بأجمل إطلالة',
      en: 'Celebrate yourself with the most beautiful look',
    },
    packageName: { ar: 'متألقة في يومي', en: 'Radiant on my day' },
    contents: [
      { ar: 'مكياج سهرة', en: 'Evening makeup' },
      { ar: 'تسريحة شعر', en: 'Hair styling' },
      { ar: 'مانيكير وباديكير', en: 'Manicure and pedicure' },
      { ar: 'هدية مفاجأة', en: 'Surprise gift' },
    ],
    price: 400,
    color: 'border-pink-200 bg-pink-50/30 dark:border-pink-900 dark:bg-pink-950/20',
    gradient: 'from-pink-500 to-fuchsia-500',
  },
  hajj_umrah: {
    emoji: '',
    title: { ar: 'حج / عمرة', en: 'Hajj / Umrah' },
    description: {
      ar: 'استعداد روحي وجمالي للرحلة المباركة',
      en: 'Spiritual and beauty preparation for the blessed journey',
    },
    packageName: { ar: 'إشراقة الحاجّة', en: 'Pilgrim glow' },
    contents: [
      { ar: 'عناية بالبشرة', en: 'Skincare' },
      { ar: 'إزالة شعر', en: 'Hair removal' },
      { ar: 'حقيبة عناية للسفر', en: 'Travel care kit' },
      { ar: 'جلسة استرخاء', en: 'Relaxation session' },
    ],
    price: 350,
    color: 'border-teal-200 bg-teal-50/30 dark:border-teal-900 dark:bg-teal-950/20',
    gradient: 'from-teal-500 to-emerald-500',
  },
  divorce_recovery: {
    emoji: '',
    title: { ar: 'بداية جديدة', en: 'New beginning' },
    description: { ar: 'انطلاقة جديدة بعد التغيير', en: 'A new start after change' },
    packageName: { ar: 'بداية جديدة', en: 'New beginning' },
    contents: [
      { ar: 'استشارة إطلالة كاملة', en: 'Full look consultation' },
      { ar: 'مكياج تعليمي', en: 'Makeup tutorial' },
      { ar: 'تسريحة جديدة', en: 'New hairstyle' },
      { ar: 'يوم سبا مصغر', en: 'Mini spa day' },
    ],
    price: 500,
    color: 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/20',
    gradient: 'from-indigo-500 to-purple-500',
  },
};

interface LifeEventCardProps {
  event: LifeEvent;
  onBook?: () => void;
  className?: string;
  /** Label for the price section */
  priceLabel?: string;
  /** Currency suffix shown after the price */
  currencySuffix?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Locale for internal event data strings */
  locale?: 'ar' | 'en';
}

export function LifeEventCard({
  event,
  onBook,
  className = '',
  priceLabel = 'السعر',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي الآن',
  locale = 'ar',
}: LifeEventCardProps): JSX.Element {
  const e = EVENTS[event];

  return (
    <div
      className={cn('rounded-2xl border p-5 transition-shadow hover:shadow-md', e.color, className)}
    >
      {/* Event header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white',
            e.gradient,
          )}
        >
          {e.emoji}
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {e.title[locale]}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-400">
            {e.description[locale]}
          </p>
        </div>
      </div>

      {/* Package name */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {e.packageName[locale]}
        </p>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
          {e.contents.map((item) => (
            <li key={item.ar} className="text-[10px] text-text-secondary dark:text-gray-300">
              {item[locale]}
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{priceLabel}</p>
          <p className="text-lg font-bold text-text-primary dark:text-gray-100">
            {e.price} {currencySuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className={cn(
            'rounded-xl px-4 py-2.5 text-xs font-bold text-white active:scale-[0.98] transition-all shadow-sm',
            `bg-gradient-to-r ${e.gradient}`,
          )}
        >
          {bookLabel}
        </button>
      </div>
    </div>
  );
}

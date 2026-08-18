'use client';

import { cn } from '@galaxy/shared';

/**
 * Postpartum Care Card — traditional Saudi postpartum recovery (40-day نفاس).
 * From Phase W3: Health & Wellness — Pregnancy & Postpartum Beauty.
 *
 * Usage:
 *   <PostpartumCareCard daysSinceBirth={15} onBook={() => {}} />
 */

interface PostpartumService {
  emoji: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  availableFromDay: number; // days after birth
}

const SERVICES: PostpartumService[] = [
  {
    emoji: '🪢',
    name: { ar: 'ربط البطن التقليدي', en: 'Traditional belly binding' },
    description: {
      ar: 'ربط البطن بالطريقة السعودية التقليدية لدعم التعافي',
      en: 'Belly binding the traditional Saudi way to support recovery',
    },
    price: 150,
    availableFromDay: 3,
  },
  {
    emoji: '‍️',
    name: { ar: 'مساج النفاس', en: 'Postpartum massage' },
    description: {
      ar: 'مساج لطيف للجسم بالزيوت الدافئة لتخفيف الآلام',
      en: 'Gentle full-body massage with warm oils to ease pain',
    },
    price: 200,
    availableFromDay: 7,
  },
  {
    emoji: '‍️',
    name: { ar: 'علاج تساقط الشعر', en: 'Hair loss treatment' },
    description: {
      ar: 'علاج طبيعي لتساقط الشعر بعد الولادة',
      en: 'A natural treatment for postpartum hair loss',
    },
    price: 180,
    availableFromDay: 30,
  },
  {
    emoji: '‍️',
    name: { ar: 'عناية بالبشرة للنفاس', en: 'Postpartum skincare' },
    description: {
      ar: 'ترطيب عميق وتوحيد لون البشرة بعد التغيرات الهرمونية',
      en: 'Deep hydration and evening out skin tone after hormonal changes',
    },
    price: 160,
    availableFromDay: 14,
  },
  {
    emoji: '',
    name: { ar: 'إطلالة الخروج الأولى', en: 'First outing look' },
    description: {
      ar: 'مكياج ناعم وتصفيفة شعر لأول خروج بعد النفاس',
      en: 'Soft makeup and hairstyle for the first outing after postpartum',
    },
    price: 250,
    availableFromDay: 40,
  },
];

interface PostpartumCareCardProps {
  daysSinceBirth: number;
  onBook?: (serviceName: string) => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Subtitle when the 40-day period is complete */
  nifasCompleteText?: string;
  /** Word prefixing the current day of postpartum */
  nifasDayPrefix?: string;
  /** Words connecting the day count to the remaining days */
  nifasFromWord?: string;
  /** Text for the remaining days count */
  daysRemainingText?: string;
  /** Label for the recovery progress bar */
  progressLabel?: string;
  /** Label at the start of the progress bar */
  dayOneLabel?: string;
  /** Label at the end of the progress bar */
  dayFortyLabel?: string;
  /** Label for the services section */
  servicesLabel?: string;
  /** Currency suffix shown after prices */
  currencySuffix?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Text prefixing the unavailable-since count */
  availableAfterText?: string;
  /** Word for days in the unavailable count */
  dayWord?: string;
  /** Traditional wisdom footer text */
  wisdomText?: string;
  /** Locale for internal service data strings */
  locale?: 'ar' | 'en';
}

export function PostpartumCareCard({
  daysSinceBirth,
  onBook,
  className = '',
  title = 'عناية النفاس',
  nifasCompleteText = ' اكتملت الأربعون — ألف مبروك!',
  nifasDayPrefix = 'اليوم',
  nifasFromWord = 'من النفاس —',
  daysRemainingText = 'يوم متبقي',
  progressLabel = 'تقدم التعافي',
  dayOneLabel = 'اليوم 1',
  dayFortyLabel = 'اليوم 40',
  servicesLabel = 'خدمات النفاس المتاحة',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي',
  availableAfterText = 'متاحة بعد',
  dayWord = 'يوم',
  wisdomText = '"الأربعين يوم راحة وتعافي — اعتني بنفسكِ كما تعتنين بطفلكِ"',
  locale = 'ar',
}: PostpartumCareCardProps): JSX.Element {
  const isNifasComplete = daysSinceBirth >= 40;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-5 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          {isNifasComplete
            ? nifasCompleteText
            : `${nifasDayPrefix} ${daysSinceBirth} ${nifasFromWord} ${40 - daysSinceBirth} ${daysRemainingText}`}
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-tertiary dark:text-gray-400">{progressLabel}</span>
          <span className="font-bold text-purple-700 dark:text-purple-300">
            {Math.min(100, Math.round((daysSinceBirth / 40) * 100))}%
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((daysSinceBirth / 40) * 100))}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-text-tertiary dark:text-gray-500">
          <span>{dayOneLabel}</span>
          <span>{dayFortyLabel}</span>
        </div>
      </div>

      {/* Services */}
      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {servicesLabel}
        </p>
        {SERVICES.map((service) => {
          const isAvailable = daysSinceBirth >= service.availableFromDay;
          const daysUntil = service.availableFromDay - daysSinceBirth;

          return (
            <div
              key={service.name.ar}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                isAvailable
                  ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
                  : 'border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-800',
              )}
            >
              <span className="text-lg shrink-0" aria-hidden="true">
                {service.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                  {service.name[locale]}
                </p>
                <p className="text-[10px] text-text-tertiary dark:text-gray-400">
                  {service.description[locale]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {isAvailable ? (
                  <>
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      {service.price} {currencySuffix}
                    </p>
                    <button
                      type="button"
                      onClick={() => onBook?.(service.name.ar)}
                      className="mt-0.5 rounded-lg bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-purple-700"
                    >
                      {bookLabel}
                    </button>
                  </>
                ) : (
                  <p className="text-[10px] text-text-tertiary dark:text-gray-500">
                    {availableAfterText} {daysUntil} {dayWord}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Traditional wisdom */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-purple-50 to-rose-50 p-3 dark:from-purple-950 dark:to-rose-950">
        <p className="text-center text-[10px] font-medium text-purple-700 dark:text-purple-300">
          {wisdomText}
        </p>
      </div>
    </div>
  );
}

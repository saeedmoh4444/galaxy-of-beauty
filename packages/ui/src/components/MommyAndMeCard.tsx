'use client';

import { cn } from '@galaxy/shared';

/**
 * Mommy & Me Card — mother-daughter side-by-side beauty experience.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <MommyAndMeCard mom="نورة" daughter="سارة" daughterAge={8} onBook={() => {}} />
 */

interface MommyAndMeCardProps {
  mom: string;
  daughter: string;
  daughterAge: number;
  /** Selected experience type */
  experience?: 'mini_facial' | 'manicure' | 'hair_braiding' | 'spa_day' | 'makeup_lesson';
  totalPrice?: number;
  duration?: string;
  onBook?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label under the mom avatar */
  momLabel?: string;
  /** Word appended to the daughter's age */
  yearsSuffix?: string;
  /** Word for years in the age range badge */
  yearsWord?: string;
  /** Warning shown when the experience is not age-appropriate */
  notAppropriateText?: string;
  /** Label for the duration box */
  durationLabel?: string;
  /** Label for the price box */
  priceLabel?: string;
  /** Currency suffix shown after the price */
  currencySuffix?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Memory note footer text */
  memoryText?: string;
  /** Locale for internal experience data strings */
  locale?: 'ar' | 'en';
}

const EXPERIENCES = {
  mini_facial: {
    emoji: '‍️',
    title: { ar: 'عناية بالبشرة المصغرة', en: 'Mini facial' },
    description: {
      ar: 'أول تجربة عناية بالبشرة للأم وابنتها',
      en: 'A first skincare experience for mom and daughter',
    },
    ageMin: 8,
    ageMax: 15,
    includes: [
      { ar: 'تنظيف لطيف', en: 'Gentle cleansing' },
      { ar: 'ترطيب', en: 'Moisturizing' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
      { ar: 'تدليك يدين', en: 'Hand massage' },
    ],
  },
  manicure: {
    emoji: '',
    title: { ar: 'مانيكير الأم وابنتها', en: 'Mom & daughter manicure' },
    description: { ar: 'أظافر جميلة جنباً إلى جنب', en: 'Beautiful nails side by side' },
    ageMin: 6,
    ageMax: 16,
    includes: [
      { ar: 'تشذيب', en: 'Trimming' },
      { ar: 'برد', en: 'Filing' },
      { ar: 'طلاء آمن', en: 'Safe polish' },
      { ar: 'نقش بسيط', en: 'Simple design' },
    ],
  },
  hair_braiding: {
    emoji: '',
    title: { ar: 'تضفير الشعر', en: 'Hair braiding' },
    description: { ar: 'تسريحات شعر جميلة ومتناسقة', en: 'Beautiful matching hairstyles' },
    ageMin: 5,
    ageMax: 14,
    includes: [
      { ar: 'تسريحة مضفرة', en: 'Braided style' },
      { ar: 'إكسسوارات شعر', en: 'Hair accessories' },
      { ar: 'لمسة لمعان', en: 'Glossy finish' },
    ],
  },
  spa_day: {
    emoji: '',
    title: { ar: 'يوم سبا مصغر', en: 'Mini spa day' },
    description: {
      ar: 'يوم كامل من التدليل للأم وابنتها',
      en: 'A full day of pampering for mom and daughter',
    },
    ageMin: 10,
    ageMax: 17,
    includes: [
      { ar: 'مساج خفيف', en: 'Light massage' },
      { ar: 'مانيكير', en: 'Manicure' },
      { ar: 'باديكير', en: 'Pedicure' },
      { ar: 'شاي وحلويات', en: 'Tea and sweets' },
    ],
  },
  makeup_lesson: {
    emoji: '',
    title: { ar: 'درس مكياج أول', en: 'First makeup lesson' },
    description: {
      ar: 'تعلم أساسيات العناية والبشرة مع أمكِ',
      en: 'Learn skincare basics with your mom',
    },
    ageMin: 12,
    ageMax: 17,
    includes: [
      { ar: 'تنظيف البشرة', en: 'Skin cleansing' },
      { ar: 'ترطيب', en: 'Moisturizing' },
      { ar: 'مكياج خفيف جداً', en: 'Very light makeup' },
      { ar: 'نصائح للعناية', en: 'Care tips' },
    ],
  },
};

export function MommyAndMeCard({
  mom,
  daughter,
  daughterAge,
  experience = 'mini_facial',
  totalPrice = 250,
  duration = '90 دقيقة',
  onBook,
  className = '',
  title = 'ماما وأنا',
  subtitle = 'وقت خاص بين الأم وابنتها',
  momLabel = 'ماما',
  yearsSuffix = 'سنوات',
  yearsWord = 'سنة',
  notAppropriateText = 'قد لا يكون مناسباً لعمر ابنتكِ',
  durationLabel = 'المدة',
  priceLabel = 'السعر للشخصين',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي وقتكما الخاص',
  memoryText = 'صورة تذكارية لكما معاً — لأن هذه اللحظات لا تنسى',
  locale = 'ar',
}: MommyAndMeCardProps): JSX.Element {
  const exp = EXPERIENCES[experience] ?? EXPERIENCES.mini_facial;
  const isAgeAppropriate = daughterAge >= exp.ageMin && daughterAge <= exp.ageMax;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-purple-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ‍
        </span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
      </div>

      {/* Participants */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-lg dark:from-pink-800 dark:to-rose-800"></div>
          <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">{mom}</p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{momLabel}</p>
        </div>

        <span className="text-pink-400 text-lg" aria-hidden="true"></span>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-violet-200 text-lg dark:from-purple-800 dark:to-violet-800"></div>
          <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
            {daughter}
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">
            {daughterAge} {yearsSuffix}
          </p>
        </div>
      </div>

      {/* Experience card */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {exp.emoji}
          </span>
          <div>
            <p className="text-xs font-bold text-text-primary dark:text-gray-100">
              {exp.title[locale]}
            </p>
            <p className="text-[10px] text-text-secondary dark:text-gray-300">
              {exp.description[locale]}
            </p>
          </div>
        </div>

        {/* Age range badge */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[9px] font-medium',
              isAgeAppropriate
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
            )}
          >
            {exp.ageMin}-{exp.ageMax} {yearsWord}
          </span>
          {!isAgeAppropriate && (
            <span className="text-[9px] text-amber-600 dark:text-amber-400">
              {notAppropriateText}
            </span>
          )}
        </div>

        {/* Includes */}
        <div className="mt-2 flex flex-wrap gap-1">
          {exp.includes.map((item) => (
            <span
              key={item.ar}
              className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] text-pink-700 dark:bg-pink-950 dark:text-pink-300"
            >
              {item[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{durationLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{duration}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{priceLabel}</p>
          <p className="text-xs font-bold text-pink-700 dark:text-pink-400">
            {totalPrice} {currencySuffix}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-purple-600 active:scale-[0.98] transition-all shadow-sm"
      >
        {bookLabel}
      </button>

      {/* Memory */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{memoryText}</p>
    </div>
  );
}

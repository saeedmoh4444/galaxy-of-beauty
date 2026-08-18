'use client';

import { cn } from '@galaxy/shared';

/**
 * First Facial Card — gentle introduction to skincare for young teens.
 * From Phase W7: Mother-Daughter & Family — Girls' First Beauty.
 *
 * Usage:
 *   <FirstFacialCard age={13} momName="نورة" onBook={() => {}} />
 */

interface FirstFacialCardProps {
  age: number;
  momName?: string;
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  onBook?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Age-appropriateness note shown when age is out of range */
  ageNote?: string;
  /** Title of the steps box */
  stepsLabel?: string;
  /** Prefix before the mom's name */
  momPrefix?: string;
  /** Text after the mom's name */
  momWithText?: string;
  /** No heavy products pledge */
  pledgeText?: string;
  /** Book button label when the mom is present */
  bookWithMomLabel?: string;
  /** Book button label when the mom is absent */
  bookAloneLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal tips and steps data strings */
  locale?: 'ar' | 'en';
}

const SKIN_TIPS: Record<string, { ar: string; en: string }> = {
  oily: {
    ar: 'بشرتكِ دهنية — سنستخدم منتجات خفيفة خالية من الزيوت',
    en: 'Your skin is oily — we will use light, oil-free products',
  },
  dry: {
    ar: 'بشرتكِ جافة — سنركز على الترطيب العميق',
    en: 'Your skin is dry — we will focus on deep hydration',
  },
  combination: {
    ar: 'بشرتكِ مختلطة — سنستخدم منتجات متوازنة',
    en: 'Your skin is combination — we will use balanced products',
  },
  sensitive: {
    ar: 'بشرتكِ حساسة — سنستخدم منتجات لطيفة ومهدئة',
    en: 'Your skin is sensitive — we will use gentle, soothing products',
  },
  normal: {
    ar: 'بشرتكِ طبيعية — سنستخدم منتجات لطيفة للحفاظ على توازنها',
    en: 'Your skin is normal — we will use gentle products to keep its balance',
  },
};

const STEPS: { emoji: string; text: { ar: string; en: string } }[] = [
  { emoji: '', text: { ar: 'تحليل بشرتكِ بلطف', en: 'Gentle skin analysis' } },
  {
    emoji: '',
    text: { ar: 'تنظيف لطيف بدون مواد قاسية', en: 'Gentle cleansing without harsh ingredients' },
  },
  {
    emoji: '‍️',
    text: { ar: 'تدليك خفيف للوجه (3 دقائق)', en: 'Light facial massage (3 minutes)' },
  },
  { emoji: '', text: { ar: 'ترطيب وواقي شمس', en: 'Moisturizer and sunscreen' } },
  { emoji: '', text: { ar: 'نصائح للعناية اليومية', en: 'Daily care tips' } },
];

export function FirstFacialCard({
  age,
  momName,
  skinType,
  onBook,
  className = '',
  title = 'أول عناية بالبشرة',
  subtitle = 'تجربة لطيفة وممتعة لأول مرة',
  ageNote = 'مناسب للأعمار 10-17 سنة',
  stepsLabel = ' ماذا سنفعل',
  momPrefix = '‍ ',
  momWithText = 'تستطيعين الحضور معها ومشاهدة التجربة',
  pledgeText = 'لا كريم أساس ثقيل · لا مقشرات قوية · منتجات آمنة فقط',
  bookWithMomLabel = 'احجزي مع أمكِ ',
  bookAloneLabel = 'احجزي جلستكِ الأولى ',
  footerText = 'بشرتكِ تستحق بداية لطيفة — العناية قبل التجميل',
  locale = 'ar',
}: FirstFacialCardProps): JSX.Element {
  const isAgeAppropriate = age >= 10 && age <= 17;
  const tip = skinType ? SKIN_TIPS[skinType] : null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        {!isAgeAppropriate && (
          <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">{ageNote}</p>
        )}
      </div>

      {/* What we'll do */}
      <div className="mt-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{stepsLabel}</p>
        <div className="mt-1.5 space-y-1">
          {STEPS.map((s) => (
            <div key={s.text.ar} className="flex items-center gap-1.5">
              <span aria-hidden="true">{s.emoji}</span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">
                {s.text[locale]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skin type tip */}
      {tip && (
        <div className="mt-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
          <p className="text-[10px] text-blue-700 dark:text-blue-300"> {tip[locale]}</p>
        </div>
      )}

      {/* Mom section */}
      {momName && (
        <div className="mt-2 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
          <p className="text-center text-[10px] text-purple-700 dark:text-purple-300">
            {momPrefix}
            {momName} {momWithText}
          </p>
        </div>
      )}

      {/* No heavy products pledge */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
        <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
          {pledgeText}
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all"
      >
        {momName ? bookWithMomLabel : bookAloneLabel}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

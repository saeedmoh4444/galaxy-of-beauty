'use client';

import { cn } from '@galaxy/shared';

/**
 * Teen Skincare Guide — simple skincare routine for teenage skin.
 * From Phase W2: Life Stage Beauty — First Beauty Steps & W7: Girls' First Beauty.
 *
 * Usage:
 *   <TeenSkincareGuide skinType="oily" age={14} />
 */

type TeenSkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'acne_prone';

interface SkinRoutine {
  morning: { ar: string; en: string }[];
  evening: { ar: string; en: string }[];
  tips: { ar: string; en: string }[];
}

const ROUTINES: Record<TeenSkinType, SkinRoutine> = {
  oily: {
    morning: [
      { ar: 'غسول لطيف', en: 'Gentle cleanser' },
      { ar: 'تونر خالٍ من الكحول', en: 'Alcohol-free toner' },
      { ar: 'مرطب خفيف (جل)', en: 'Light moisturizer (gel)' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
    ],
    evening: [
      { ar: 'مزيل مكياج (إذا استخدمتِ)', en: 'Makeup remover (if used)' },
      { ar: 'غسول', en: 'Cleanser' },
      { ar: 'تونر', en: 'Toner' },
      { ar: 'مرطب خفيف', en: 'Light moisturizer' },
    ],
    tips: [
      {
        ar: 'لا تغسلي وجهكِ أكثر من مرتين يومياً',
        en: 'Do not wash your face more than twice a day',
      },
      { ar: 'استخدمي منتجات "خالية من الزيوت"', en: 'Use oil-free products' },
      { ar: 'أوراق التنشيف صديقتكِ', en: 'Blotting papers are your friend' },
    ],
  },
  dry: {
    morning: [
      { ar: 'غسول كريمي', en: 'Creamy cleanser' },
      { ar: 'سيروم مرطب', en: 'Hydrating serum' },
      { ar: 'مرطب غني', en: 'Rich moisturizer' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
    ],
    evening: [
      { ar: 'مزيل مكياج', en: 'Makeup remover' },
      { ar: 'غسول كريمي', en: 'Creamy cleanser' },
      { ar: 'مرطب غني', en: 'Rich moisturizer' },
      { ar: 'زيت وجه (اختياري)', en: 'Face oil (optional)' },
    ],
    tips: [
      { ar: 'تجنبي الماء الساخن على وجهكِ', en: 'Avoid hot water on your face' },
      { ar: 'استخدمي مرطبات تحتوي على سيراميد', en: 'Use moisturizers with ceramides' },
      { ar: 'اشربي ماء كثيراً', en: 'Drink plenty of water' },
    ],
  },
  combination: {
    morning: [
      { ar: 'غسول متوازن', en: 'Balanced cleanser' },
      { ar: 'تونر', en: 'Toner' },
      { ar: 'مرطب جل في T-zone', en: 'Gel moisturizer on the T-zone' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
    ],
    evening: [
      { ar: 'مزيل مكياج', en: 'Makeup remover' },
      { ar: 'غسول', en: 'Cleanser' },
      { ar: 'مرطب خفيف على كامل الوجه', en: 'Light moisturizer on the whole face' },
    ],
    tips: [
      {
        ar: 'استخدمي منتجات مختلفة للمناطق المختلفة',
        en: 'Use different products for different areas',
      },
      { ar: 'المنطقة الدهنية تحتاج عناية أخف', en: 'The oily area needs lighter care' },
      { ar: 'لا تفرطي في تجفيف البشرة', en: 'Do not over-dry your skin' },
    ],
  },
  normal: {
    morning: [
      { ar: 'غسول لطيف', en: 'Gentle cleanser' },
      { ar: 'مرطب خفيف', en: 'Light moisturizer' },
      { ar: 'واقي شمس', en: 'Sunscreen' },
    ],
    evening: [
      { ar: 'مزيل مكياج', en: 'Makeup remover' },
      { ar: 'غسول', en: 'Cleanser' },
      { ar: 'مرطب', en: 'Moisturizer' },
    ],
    tips: [
      { ar: 'حافظي على روتينكِ البسيط', en: 'Keep your routine simple' },
      { ar: 'لا تضيفي منتجات لا تحتاجينها', en: 'Do not add products you do not need' },
      { ar: 'الوقاية خير من العلاج', en: 'Prevention is better than cure' },
    ],
  },
  acne_prone: {
    morning: [
      { ar: 'غسول بحمض الساليسيليك', en: 'Salicylic acid cleanser' },
      { ar: 'مرطب خالٍ من الزيوت', en: 'Oil-free moisturizer' },
      { ar: 'واقي شمس (جل)', en: 'Sunscreen (gel)' },
    ],
    evening: [
      { ar: 'مزيل مكياج', en: 'Makeup remover' },
      { ar: 'غسول لطيف', en: 'Gentle cleanser' },
      { ar: 'علاج حبوب (حسب وصف الطبيب)', en: 'Acne treatment (as prescribed)' },
      { ar: 'مرطب خفيف', en: 'Light moisturizer' },
    ],
    tips: [
      { ar: 'لا تعبثي بالحبوب أبداً', en: 'Never pick at pimples' },
      { ar: 'غيري غطاء الوسادة أسبوعياً', en: 'Change your pillowcase weekly' },
      { ar: 'استشيري طبيبة جلدية للحالات الشديدة', en: 'Consult a dermatologist for severe cases' },
    ],
  },
};

interface TeenSkincareGuideProps {
  skinType: TeenSkinType;
  age?: number;
  className?: string;
  /** Header title */
  title?: string;
  /** Subtitle prefix for teen skin */
  teenSkinLabel?: string;
  /** Years word appended to the age */
  ageYearsSuffix?: string;
  /** Subtitle for young (non-teen) skin */
  youngSkinLabel?: string;
  /** Label for the morning routine section */
  morningLabel?: string;
  /** Label for the evening routine section */
  eveningLabel?: string;
  /** Label for the tips section */
  tipsLabel?: string;
  /** Gentle reminder text */
  reminderText?: string;
  /** Locale for internal routine data strings */
  locale?: 'ar' | 'en';
}

const SKIN_LABELS: Record<TeenSkinType, { emoji: string; label: { ar: string; en: string } }> = {
  oily: { emoji: '', label: { ar: 'دهنية', en: 'Oily' } },
  dry: { emoji: '', label: { ar: 'جافة', en: 'Dry' } },
  combination: { emoji: '', label: { ar: 'مختلطة', en: 'Combination' } },
  normal: { emoji: '', label: { ar: 'طبيعية', en: 'Normal' } },
  acne_prone: { emoji: '', label: { ar: 'معرضة للحبوب', en: 'Acne-prone' } },
};

export function TeenSkincareGuide({
  skinType,
  age,
  className = '',
  title = 'دليل العناية بالبشرة',
  teenSkinLabel = 'للبشرة المراهقة',
  ageYearsSuffix = ' سنة',
  youngSkinLabel = 'للبشرة الشابة',
  morningLabel = '️ الروتين الصباحي',
  eveningLabel = 'الروتين المسائي',
  tipsLabel = ' نصائح لبشرتكِ',
  reminderText = 'في هذا العمر: الأقل هو الأكثر — لا حاجة لمنتجات قوية أو باهظة',
  locale = 'ar',
}: TeenSkincareGuideProps): JSX.Element {
  const routine = ROUTINES[skinType];
  const skin = SKIN_LABELS[skinType];
  const isTeen = age !== undefined && age >= 12 && age <= 19;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {skin.emoji}
          </span>
          <div>
            <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
            <p className="text-[10px] text-pink-500 dark:text-pink-400">
              {isTeen ? `${teenSkinLabel} (${age} ${ageYearsSuffix})` : youngSkinLabel} —{' '}
              {skin.label[locale]}
            </p>
          </div>
        </div>
      </div>

      {/* Morning routine */}
      <div className="mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">{morningLabel}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {routine.morning.map((step, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] text-amber-800 dark:bg-gray-800 dark:text-amber-200"
            >
              {i + 1}. {step[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Evening routine */}
      <div className="mt-2 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950">
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{eveningLabel}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {routine.evening.map((step, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] text-indigo-800 dark:bg-gray-800 dark:text-indigo-200"
            >
              {i + 1}. {step[locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-2 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{tipsLabel}</p>
        <ul className="mt-1 space-y-0.5">
          {routine.tips.map((tip) => (
            <li key={tip.ar} className="text-[10px] text-pink-800 dark:text-pink-200">
              • {tip[locale]}
            </li>
          ))}
        </ul>
      </div>

      {/* Gentle reminder */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
        <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
          {reminderText}
        </p>
      </div>
    </div>
  );
}

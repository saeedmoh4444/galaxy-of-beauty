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
}

const EXPERIENCES = {
  mini_facial: {
    emoji: '🧖‍♀️',
    title: 'عناية بالبشرة المصغرة',
    description: 'أول تجربة عناية بالبشرة للأم وابنتها',
    ageMin: 8,
    ageMax: 15,
    includes: ['تنظيف لطيف', 'ترطيب', 'واقي شمس', 'تدليك يدين'],
  },
  manicure: {
    emoji: '💅',
    title: 'مانيكير الأم وابنتها',
    description: 'أظافر جميلة جنباً إلى جنب',
    ageMin: 6,
    ageMax: 16,
    includes: ['تشذيب', 'برد', 'طلاء آمن', 'نقش بسيط'],
  },
  hair_braiding: {
    emoji: '💇',
    title: 'تضفير الشعر',
    description: 'تسريحات شعر جميلة ومتناسقة',
    ageMin: 5,
    ageMax: 14,
    includes: ['تسريحة مضفرة', 'إكسسوارات شعر', 'لمسة لمعان'],
  },
  spa_day: {
    emoji: '🌸',
    title: 'يوم سبا مصغر',
    description: 'يوم كامل من التدليل للأم وابنتها',
    ageMin: 10,
    ageMax: 17,
    includes: ['مساج خفيف', 'مانيكير', 'باديكير', 'شاي وحلويات'],
  },
  makeup_lesson: {
    emoji: '💄',
    title: 'درس مكياج أول',
    description: 'تعلم أساسيات العناية والبشرة مع أمكِ',
    ageMin: 12,
    ageMax: 17,
    includes: ['تنظيف البشرة', 'ترطيب', 'مكياج خفيف جداً', 'نصائح للعناية'],
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
        <span className="text-3xl" aria-hidden="true">👩‍👧</span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">
          ماما وأنا
        </h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          وقت خاص بين الأم وابنتها
        </p>
      </div>

      {/* Participants */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-lg dark:from-pink-800 dark:to-rose-800">
            👩
          </div>
          <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
            {mom}
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">ماما</p>
        </div>

        <span className="text-pink-400 text-lg" aria-hidden="true">💕</span>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-violet-200 text-lg dark:from-purple-800 dark:to-violet-800">
            👧
          </div>
          <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
            {daughter}
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{daughterAge} سنوات</p>
        </div>
      </div>

      {/* Experience card */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{exp.emoji}</span>
          <div>
            <p className="text-xs font-bold text-text-primary dark:text-gray-100">
              {exp.title}
            </p>
            <p className="text-[10px] text-text-secondary dark:text-gray-300">
              {exp.description}
            </p>
          </div>
        </div>

        {/* Age range badge */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[9px] font-medium',
            isAgeAppropriate
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
          )}>
            {exp.ageMin}-{exp.ageMax} سنة
          </span>
          {!isAgeAppropriate && (
            <span className="text-[9px] text-amber-600 dark:text-amber-400">
              ⚠️ قد لا يكون مناسباً لعمر ابنتكِ
            </span>
          )}
        </div>

        {/* Includes */}
        <div className="mt-2 flex flex-wrap gap-1">
          {exp.includes.map((item) => (
            <span
              key={item}
              className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] text-pink-700 dark:bg-pink-950 dark:text-pink-300"
            >
              ✨ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">المدة</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {duration}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر للشخصين</p>
          <p className="text-xs font-bold text-pink-700 dark:text-pink-400">
            {totalPrice} ر.س
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-purple-600 active:scale-[0.98] transition-all shadow-sm"
      >
        احجزي وقتكما الخاص 💕
      </button>

      {/* Memory */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">
        📸 صورة تذكارية لكما معاً — لأن هذه اللحظات لا تنسى
      </p>
    </div>
  );
}

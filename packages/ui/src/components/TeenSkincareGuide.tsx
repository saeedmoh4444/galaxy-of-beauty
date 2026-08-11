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
  morning: string[];
  evening: string[];
  tips: string[];
}

const ROUTINES: Record<TeenSkinType, SkinRoutine> = {
  oily: {
    morning: ['غسول لطيف', 'تونر خالٍ من الكحول', 'مرطب خفيف (جل)', 'واقي شمس'],
    evening: ['مزيل مكياج (إذا استخدمتِ)', 'غسول', 'تونر', 'مرطب خفيف'],
    tips: [
      'لا تغسلي وجهكِ أكثر من مرتين يومياً',
      'استخدمي منتجات "خالية من الزيوت"',
      'أوراق التنشيف صديقتكِ',
    ],
  },
  dry: {
    morning: ['غسول كريمي', 'سيروم مرطب', 'مرطب غني', 'واقي شمس'],
    evening: ['مزيل مكياج', 'غسول كريمي', 'مرطب غني', 'زيت وجه (اختياري)'],
    tips: ['تجنبي الماء الساخن على وجهكِ', 'استخدمي مرطبات تحتوي على سيراميد', 'اشربي ماء كثيراً'],
  },
  combination: {
    morning: ['غسول متوازن', 'تونر', 'مرطب جل في T-zone', 'واقي شمس'],
    evening: ['مزيل مكياج', 'غسول', 'مرطب خفيف على كامل الوجه'],
    tips: [
      'استخدمي منتجات مختلفة للمناطق المختلفة',
      'المنطقة الدهنية تحتاج عناية أخف',
      'لا تفرطي في تجفيف البشرة',
    ],
  },
  normal: {
    morning: ['غسول لطيف', 'مرطب خفيف', 'واقي شمس'],
    evening: ['مزيل مكياج', 'غسول', 'مرطب'],
    tips: ['حافظي على روتينكِ البسيط', 'لا تضيفي منتجات لا تحتاجينها', 'الوقاية خير من العلاج'],
  },
  acne_prone: {
    morning: ['غسول بحمض الساليسيليك', 'مرطب خالٍ من الزيوت', 'واقي شمس (جل)'],
    evening: ['مزيل مكياج', 'غسول لطيف', 'علاج حبوب (حسب وصف الطبيب)', 'مرطب خفيف'],
    tips: [
      'لا تعبثي بالحبوب أبداً',
      'غيري غطاء الوسادة أسبوعياً',
      'استشيري طبيبة جلدية للحالات الشديدة',
    ],
  },
};

interface TeenSkincareGuideProps {
  skinType: TeenSkinType;
  age?: number;
  className?: string;
}

const SKIN_LABELS: Record<TeenSkinType, { emoji: string; label: string }> = {
  oily: { emoji: '✨', label: 'دهنية' },
  dry: { emoji: '💧', label: 'جافة' },
  combination: { emoji: '🎭', label: 'مختلطة' },
  normal: { emoji: '🌸', label: 'طبيعية' },
  acne_prone: { emoji: '🔴', label: 'معرضة للحبوب' },
};

export function TeenSkincareGuide({
  skinType,
  age,
  className = '',
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
            <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">
              دليل العناية بالبشرة
            </h4>
            <p className="text-[10px] text-pink-500 dark:text-pink-400">
              {isTeen ? `للبشرة المراهقة (${age} سنة)` : 'للبشرة الشابة'} — {skin.label}
            </p>
          </div>
        </div>
      </div>

      {/* Morning routine */}
      <div className="mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
          ☀️ الروتين الصباحي
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {routine.morning.map((step, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] text-amber-800 dark:bg-gray-800 dark:text-amber-200"
            >
              {i + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      {/* Evening routine */}
      <div className="mt-2 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950">
        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
          🌙 الروتين المسائي
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {routine.evening.map((step, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] text-indigo-800 dark:bg-gray-800 dark:text-indigo-200"
            >
              {i + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-2 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">💡 نصائح لبشرتكِ</p>
        <ul className="mt-1 space-y-0.5">
          {routine.tips.map((tip) => (
            <li key={tip} className="text-[10px] text-pink-800 dark:text-pink-200">
              • {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Gentle reminder */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
        <p className="text-center text-[10px] text-emerald-700 dark:text-emerald-300">
          🌱 في هذا العمر: الأقل هو الأكثر — لا حاجة لمنتجات قوية أو باهظة
        </p>
      </div>
    </div>
  );
}

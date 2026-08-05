'use client';

import { useState, useEffect } from 'react';

/**
 * Beauty Tip — rotating beauty tips for loading states and empty pages.
 * Women-centric, Arabic-first, educational.
 *
 * Usage:
 *   <BeautyTip />
 */

const TIPS = [
  { emoji: '💧', text: 'اشربي ٨ أكواب من الماء يومياً لبشرة متوهجة' },
  { emoji: '😴', text: 'النوم ٧-٨ ساعات يومياً هو سر الجمال' },
  { emoji: '🧴', text: 'لا تنسي واقي الشمس حتى في الأيام الغائمة' },
  { emoji: '💄', text: 'جددّي مكياجكِ كل ٦-١٢ شهر للوقاية من البكتيريا' },
  { emoji: '🕌', text: 'احجزي خدماتكِ قبل العيد بأسبوعين لتجنب الازدحام' },
  { emoji: '🌙', text: 'في رمضان: احجزي بعد الإفطار للحصول على أفضل النتائج' },
  { emoji: '💆‍♀️', text: 'التدليك المنتظم يقلل التوتر ويحسن الدورة الدموية' },
  { emoji: '🌸', text: 'قشري بشرتكِ مرة واحدة أسبوعياً فقط' },
  { emoji: '🩸', text: 'البشرة تكون أكثر حساسية خلال الدورة الشهرية — اختاري علاجات لطيفة' },
  { emoji: '🤰', text: 'أثناء الحمل: تجنبي العلاجات بالحرارة العالية والزيوت القوية' },
  { emoji: '💇‍♀️', text: 'قصي أطراف شعركِ كل ٦-٨ أسابيع للمحافظة على صحته' },
  { emoji: '🧖‍♀️', text: 'نظفي فرش المكياج أسبوعياً — البكتيريا تتراكم بسرعة!' },
  { emoji: '👰', text: 'العروس: ابدأي روتين العناية بالبشرة قبل ٦ أشهر من الزفاف' },
  { emoji: '🍵', text: 'الشاي الأخضر يقلل الهالات السوداء — ضعي الأكياس الباردة على عينيكِ' },
  { emoji: '💅', text: 'الأظافر تحتاج تنفساً — اتركيها بدون طلاء يومين بين الجلسات' },
];

export function BeautyTip({ className = '' }: { className?: string }): JSX.Element {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const tip = TIPS[index]!;
  return (
    <div className={`rounded-xl border border-pink-100 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950 ${className}`}>
      <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">💡 نصيحة جمال</p>
      <p className="mt-2 text-sm text-pink-800 dark:text-pink-200">
        <span className="mr-2 text-lg">{tip.emoji}</span>
        {tip.text}
      </p>
    </div>
  );
}

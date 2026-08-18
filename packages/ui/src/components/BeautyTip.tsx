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
  {
    emoji: '',
    text: {
      ar: 'اشربي ٨ أكواب من الماء يومياً لبشرة متوهجة',
      en: 'Drink 8 glasses of water daily for glowing skin',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'النوم ٧-٨ ساعات يومياً هو سر الجمال',
      en: 'Sleeping 7-8 hours a day is the secret to beauty',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'لا تنسي واقي الشمس حتى في الأيام الغائمة',
      en: 'Do not forget sunscreen even on cloudy days',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'جددّي مكياجكِ كل ٦-١٢ شهر للوقاية من البكتيريا',
      en: 'Refresh your makeup every 6-12 months to prevent bacteria',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'احجزي خدماتكِ قبل العيد بأسبوعين لتجنب الازدحام',
      en: 'Book your services two weeks before Eid to avoid the rush',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'في رمضان: احجزي بعد الإفطار للحصول على أفضل النتائج',
      en: 'In Ramadan: book after iftar for the best results',
    },
  },
  {
    emoji: '‍️',
    text: {
      ar: 'التدليك المنتظم يقلل التوتر ويحسن الدورة الدموية',
      en: 'Regular massage reduces stress and improves circulation',
    },
  },
  {
    emoji: '',
    text: { ar: 'قشري بشرتكِ مرة واحدة أسبوعياً فقط', en: 'Exfoliate your skin only once a week' },
  },
  {
    emoji: '🩸',
    text: {
      ar: 'البشرة تكون أكثر حساسية خلال الدورة الشهرية — اختاري علاجات لطيفة',
      en: 'Skin is more sensitive during your period — choose gentle treatments',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'أثناء الحمل: تجنبي العلاجات بالحرارة العالية والزيوت القوية',
      en: 'During pregnancy: avoid high-heat treatments and strong oils',
    },
  },
  {
    emoji: '‍️',
    text: {
      ar: 'قصي أطراف شعركِ كل ٦-٨ أسابيع للمحافظة على صحته',
      en: 'Trim your hair ends every 6-8 weeks to keep it healthy',
    },
  },
  {
    emoji: '‍️',
    text: {
      ar: 'نظفي فرش المكياج أسبوعياً — البكتيريا تتراكم بسرعة!',
      en: 'Clean your makeup brushes weekly — bacteria build up fast!',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'العروس: ابدأي روتين العناية بالبشرة قبل ٦ أشهر من الزفاف',
      en: 'Bride: start your skincare routine 6 months before the wedding',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'الشاي الأخضر يقلل الهالات السوداء — ضعي الأكياس الباردة على عينيكِ',
      en: 'Green tea reduces dark circles — place cold tea bags on your eyes',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'الأظافر تحتاج تنفساً — اتركيها بدون طلاء يومين بين الجلسات',
      en: 'Nails need to breathe — leave them polish-free two days between sessions',
    },
  },
];

export function BeautyTip({
  className = '',
  heading = ' نصيحة جمال',
  locale = 'ar',
}: {
  className?: string;
  /** Tip heading */
  heading?: string;
  /** Display locale for tip texts */
  locale?: 'ar' | 'en';
}): JSX.Element {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const tip = TIPS[index]!;
  return (
    <div
      className={`rounded-xl border border-pink-100 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950 ${className}`}
    >
      <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">{heading}</p>
      <p className="mt-2 text-sm text-pink-800 dark:text-pink-200">
        <span className="mr-2 text-lg">{tip.emoji}</span>
        {tip.text[locale]}
      </p>
    </div>
  );
}

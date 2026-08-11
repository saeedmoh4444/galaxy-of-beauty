'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Nail Care Card — nail health & care tips.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyNailCareCard />
 */

const TIPS = [
  { emoji: '💅', title: 'ترطيب يومي', desc: 'زيت الأظافر يومياً للحفاظ على الترطيب' },
  { emoji: '📏', title: 'برد باتجاه واحد', desc: 'لا تبردي ذهاباً وإياباً — يضعف الظفر' },
  { emoji: '🧤', title: 'قفازات الحماية', desc: 'احمي أظافركِ من المواد الكيميائية' },
  { emoji: '🥗', title: 'تغذية', desc: 'بيوتين وزنك وزنك — غذاء الأظافر' },
];

interface BeautyNailCareCardProps {
  className?: string;
}

export function BeautyNailCareCard({ className = '' }: BeautyNailCareCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          💅
        </span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">عناية بالأظافر</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">نصائح لأظافر قوية وجميلة</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-pink-800 dark:text-pink-200">
              {t.title}
            </p>
            <p className="text-[9px] text-pink-600 dark:text-pink-400">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

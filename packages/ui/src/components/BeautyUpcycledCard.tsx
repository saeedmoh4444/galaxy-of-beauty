'use client';
import { cn } from '@galaxy/shared';
export function BeautyUpcycledCard({
  className = '',
  locale = 'ar',
  title = 'الجمال المُعاد تدويره',
  subtitle = 'من النفايات — إلى الذهب',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'بقايا القهوة', en: 'Coffee grounds' },
            tip: { ar: 'مقشر طبيعي للجسم', en: 'Natural body scrub' },
          },
          {
            emoji: '',
            label: { ar: 'قشور الحمضيات', en: 'Citrus peels' },
            tip: { ar: 'زيوت عطرية طبيعية', en: 'Natural essential oils' },
          },
          {
            emoji: '',
            label: { ar: 'بذور الأفوكادو', en: 'Avocado seeds' },
            tip: { ar: 'صبغة وردية طبيعية', en: 'Natural pink dye' },
          },
          {
            emoji: '',
            label: { ar: 'نخالة الأرز', en: 'Rice bran' },
            tip: { ar: 'مقشر لطيف للوجه', en: 'Gentle facial exfoliant' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

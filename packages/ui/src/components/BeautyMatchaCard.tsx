'use client';
import { cn } from '@galaxy/shared';
export function BeautyMatchaCard({
  className = '',
  title = 'الماتشا',
  subtitle = 'أقوى من الشاي الأخضر بـ 10 مرات',
  locale = 'ar',
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-green-100 bg-white p-4 dark:border-green-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">{title}</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'مركز 10x — مضادات أكسدة أكثر من الشاي العادي',
              en: '10x concentrated — more antioxidants than regular tea',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كلوروفيل — ينقي البشرة من الداخل',
              en: 'Chlorophyll — purifies the skin from within',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'L-Theanine — استرخاء بدون نعاس',
              en: 'L-Theanine — relaxation without drowsiness',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مع الحليب — لاتيه ماتشا لذيذ',
              en: 'With milk — a delicious matcha latte',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-green-800 dark:text-green-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

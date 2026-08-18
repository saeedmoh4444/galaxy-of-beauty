'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailPolishCard({
  className = '',
  title = 'طلاء الأظافر',
  subtitle = 'لتطبيق مثالي',
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
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: '1. Base coat — يحمي الظفر من التصبغ',
              en: '1. Base coat — protects the nail from staining',
            },
          },
          {
            emoji: '',
            text: {
              ar: '2. طبقتان رقيقتان — أفضل من طبقة سميكة',
              en: '2. Two thin coats — better than one thick one',
            },
          },
          {
            emoji: '',
            text: { ar: '3. Top coat — لمعان وحماية', en: '3. Top coat — shine and protection' },
          },
          {
            emoji: '',
            text: {
              ar: '4. انتظري 2-3 دقائق بين الطبقات',
              en: '4. Wait 2-3 minutes between coats',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-[9px] font-bold text-purple-700 dark:bg-purple-800 dark:text-purple-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { cn } from '@galaxy/shared';
export function BeautyTravelKitCard({
  className = '',
  locale = 'ar',
  title = 'حقيبة سفر الجمال',
  subtitle = 'أساسيات لا تنسينها',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'عبوات صغيرة — أقل من 100 مل للطائرة',
              en: 'Small bottles — under 100 ml for flights',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس — أهم منتج في أي سفر',
              en: 'Sunscreen — the most important travel product',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'منتجات متعددة الاستخدام — أحمر شفاه = بلاشر',
              en: 'Multi-use products — lipstick = blush',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مناديل ميسيلار — للتنظيف بدون ماء',
              en: 'Micellar wipes — cleansing without water',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-indigo-800 dark:text-indigo-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

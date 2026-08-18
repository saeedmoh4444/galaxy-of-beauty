'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincareMistakesCard({
  className = '',
  title = 'أخطاء العناية',
  subtitle = 'توقفي عنها فوراً',
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
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'غسل الوجه بالماء الساخن — يجرد البشرة من زيوتها',
              en: 'Washing your face with hot water — strips the skin of its oils',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تخطي المرطب — حتى البشرة الدهنية تحتاج ترطيب',
              en: 'Skipping moisturizer — even oily skin needs hydration',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'عدم استخدام واقي شمس — السبب الأول للشيخوخة',
              en: 'No sunscreen — the number one cause of aging',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تغيير المنتجات كل أسبوع — أعطيها 6-8 أسابيع',
              en: 'Switching products weekly — give them 6-8 weeks',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-red-800 dark:text-red-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

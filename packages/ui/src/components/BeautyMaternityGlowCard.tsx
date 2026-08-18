'use client';
import { cn } from '@galaxy/shared';
export function BeautyMaternityGlowCard({
  className = '',
  title = 'إشراقة الحامل',
  subtitle = 'بشرة متوهجة أثناء الحمل',
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
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'الهرمونات تزيد تدفق الدم — بشرة وردية طبيعية',
              en: 'Hormones increase blood flow — a natural rosy glow',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'زيت الورد أو اللوز — لترطيب البطن',
              en: 'Rose or almond oil — to moisturize the belly',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'نامي جيداً — الإرهاق يظهر على بشرتكِ',
              en: 'Sleep well — fatigue shows on your skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تغذية صحية — فيتامينات الحمل لبشرتكِ',
              en: 'Healthy eating — prenatal vitamins for your skin',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

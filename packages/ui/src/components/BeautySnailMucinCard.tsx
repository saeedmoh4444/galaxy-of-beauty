'use client';
import { cn } from '@galaxy/shared';
export function BeautySnailMucinCard({
  className = '',
  title = 'مادة الحلزون',
  subtitle = 'سر الترطيب الكوري',
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
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'غني بالجليكوليك أسيد — مقشر لطيف طبيعي',
              en: 'Rich in glycolic acid — a gentle natural exfoliant',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ألانتوين — يهدئ ويرطب بعمق',
              en: 'Allantoin — soothes and deeply hydrates',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يعالج الندبات والتصبغات — بشرة موحدة',
              en: 'Treats scars and hyperpigmentation — even skin tone',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'آمن مع معظم المكونات — صباح ومساء',
              en: 'Safe with most ingredients — morning and night',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

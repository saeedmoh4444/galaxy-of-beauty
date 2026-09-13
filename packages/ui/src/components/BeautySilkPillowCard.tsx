'use client';
import { cn } from '@galaxy/shared';
export function BeautySilkPillowCard({
  className = '',
  title = 'وسادة الحرير',
  subtitle = 'سر جمالي أثناء النوم',
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
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">💤</span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '💇',
            text: {
              ar: 'يمنع تكسر الشعر — احتكاك أقل من القطن',
              en: 'Prevents hair breakage — less friction than cotton',
            },
          },
          {
            emoji: '😴',
            text: {
              ar: 'يمنع تجاعيد النوم — بشرة أنعم صباحاً',
              en: 'Prevents sleep wrinkles — smoother skin in the morning',
            },
          },
          {
            emoji: '💧',
            text: {
              ar: 'يحافظ على ترطيب البشرة — لا يمتص الزيوت',
              en: 'Preserves skin moisture — does not absorb oils',
            },
          },
          {
            emoji: '🧼',
            text: {
              ar: 'اغسليها كل أسبوع — بماء بارد وصابون لطيف',
              en: 'Wash it weekly — in cold water with a gentle soap',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

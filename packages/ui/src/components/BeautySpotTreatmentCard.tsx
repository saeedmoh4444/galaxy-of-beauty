'use client';
import { cn } from '@galaxy/shared';
export function BeautySpotTreatmentCard({
  className = '',
  locale = 'ar',
  title = 'علاج موضعي',
  subtitle = 'للحبوب الطارئة',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'حمض الساليسيليك — يجفف الحبة',
              en: 'Salicylic acid — dries out the pimple',
            },
          },
          {
            emoji: '',
            text: { ar: 'زيت شجرة الشاي — مضاد بكتيريا', en: 'Tea tree oil — antibacterial' },
          },
          {
            emoji: '',
            text: { ar: 'كمادة باردة — تخفف الالتهاب', en: 'Cold compress — reduces inflammation' },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تعبثي بالحبة — تترك أثراً',
              en: "Don't pick at the pimple — it leaves a mark",
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

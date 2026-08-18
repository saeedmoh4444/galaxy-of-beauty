'use client';
import { cn } from '@galaxy/shared';
export function BeautyDeclutterCard({
  className = '',
  title = 'ترتيب وتنظيف',
  subtitle = 'تخلصي من الفوضى — بشرة أسعد',
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
            emoji: '️',
            text: {
              ar: 'تخلصي من: منتجات تغير لونها أو رائحتها أو قوامها',
              en: 'Get rid of: products whose color, smell, or texture changed',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كل 3 أشهر — راجعي مجموعتكِ',
              en: 'Every 3 months — review your collection',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'احتفظي بما تستخدمينه فعلاً — وليس ما تتمنين',
              en: 'Keep what you actually use — not what you wish you did',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تبرعي بالجديد غير المستخدم — لصديقة أو جمعية',
              en: 'Donate unused new items — to a friend or charity',
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

'use client';
import { cn } from '@galaxy/shared';
export function BeautyHormonalAcneCard({
  className = '',
  title = 'حبوب هرمونية',
  subtitle = 'علاج حبوب الذقن والفك',
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
              ar: 'مكانها: الذقن والفك — علامة أنها هرمونية',
              en: 'Location: chin and jawline — a sign they are hormonal',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'علاج موضعي: بنزويل بيروكسايد أو ساليسيليك',
              en: 'Topical treatment: benzoyl peroxide or salicylic acid',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قللي السكر والألبان — تزيد الالتهاب',
              en: 'Cut back on sugar and dairy — they increase inflammation',
            },
          },
          {
            emoji: '🩺',
            text: {
              ar: 'إذا استمرت — راجعي طبيبة لتقييم الهرمونات',
              en: 'If it persists — see a doctor to evaluate your hormones',
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

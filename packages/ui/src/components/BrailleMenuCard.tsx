'use client';

import { cn } from '@galaxy/shared';

/**
 * Braille Menu Card — signals Braille service menus available at partner salons.
 * From Phase W8: Accessibility & Inclusivity — Every Woman, Every Body.
 *
 * Usage:
 *   <BrailleMenuCard languages={['arabic', 'english']} />
 */

interface BrailleMenuCardProps {
  languages?: ('arabic' | 'english')[];
  /** Whether digital voice menu is also available */
  hasVoiceMenu?: boolean;
  className?: string;
}

export function BrailleMenuCard({
  languages = ['arabic'],
  hasVoiceMenu = false,
  className = '',
}: BrailleMenuCardProps): JSX.Element {
  const langLabels: Record<string, string> = { arabic: 'العربية', english: 'English' };

  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">قائمة برايل</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
            قائمة الخدمات بطريقة برايل متوفرة
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {languages.map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {lang === 'arabic' ? '' : ''} {langLabels[lang]}
          </span>
        ))}
        {hasVoiceMenu && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            ️ قائمة صوتية
          </span>
        )}
      </div>

      {/* Accessibility features */}
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950">
        <p className="text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
           ميزات الإتاحة
        </p>
        <div className="mt-1 space-y-0.5 text-[10px] text-indigo-700 dark:text-indigo-300">
          <p>• قائمة برايل عند المدخل</p>
          <p>• أحرف كبيرة للضعف البصري</p>
          <p>• مساعدة من الموظفات عند الطلب</p>
          {hasVoiceMenu && <p>• قائمة صوتية عبر سماعات</p>}
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         كل امرأة تستحق أن تعرف خياراتها — بطريقتها
      </p>
    </div>
  );
}

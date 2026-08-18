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
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  voiceMenuText?: string;
  accessibilityLabel?: string;
  feat1?: string;
  feat2?: string;
  feat3?: string;
  feat4?: string;
  footerText?: string;
  className?: string;
}

export function BrailleMenuCard({
  languages = ['arabic'],
  hasVoiceMenu = false,
  className = '',
  locale = 'ar',
  title = 'قائمة برايل',
  subtitle = 'قائمة الخدمات بطريقة برايل متوفرة',
  voiceMenuText = '️ قائمة صوتية',
  accessibilityLabel = 'ميزات الإتاحة',
  feat1 = '• قائمة برايل عند المدخل',
  feat2 = '• أحرف كبيرة للضعف البصري',
  feat3 = '• مساعدة من الموظفات عند الطلب',
  feat4 = '• قائمة صوتية عبر سماعات',
  footerText = 'كل امرأة تستحق أن تعرف خياراتها — بطريقتها',
}: BrailleMenuCardProps): JSX.Element {
  const langLabels: Record<string, { ar: string; en: string }> = {
    arabic: { ar: 'العربية', en: 'Arabic' },
    english: { ar: 'English', en: 'English' },
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>

      {/* Languages */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {languages.map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {lang === 'arabic' ? '' : ''} {langLabels[lang]?.[locale]}
          </span>
        ))}
        {hasVoiceMenu && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {voiceMenuText}
          </span>
        )}
      </div>

      {/* Accessibility features */}
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950">
        <p className="text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
          {accessibilityLabel}
        </p>
        <div className="mt-1 space-y-0.5 text-[10px] text-indigo-700 dark:text-indigo-300">
          <p>{feat1}</p>
          <p>{feat2}</p>
          <p>{feat3}</p>
          {hasVoiceMenu && <p>{feat4}</p>}
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

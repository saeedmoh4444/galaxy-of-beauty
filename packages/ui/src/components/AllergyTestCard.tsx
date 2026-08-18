'use client';

import { cn } from '@galaxy/shared';

/**
 * Allergy Test Card — patch test reminder before new treatments.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <AllergyTestCard lastTest="2026-06" nextDue="2026-12" />
 */

interface AllergyTestCardProps {
  lastTest?: string;
  nextDue?: string;
  hasAllergies?: boolean;
  onBookTest?: () => void;
  className?: string;
  title?: string;
  allergySubtitle?: string;
  patchTestSubtitle?: string;
  lastTestLabel?: string;
  nextDueLabel?: string;
  dueButtonText?: string;
  bookButtonText?: string;
  footerText?: string;
}

export function AllergyTestCard({
  lastTest,
  nextDue,
  hasAllergies = false,
  onBookTest,
  className = '',
  title = 'اختبار الحساسية',
  allergySubtitle = 'لديكِ حساسية مسجلة',
  patchTestSubtitle = 'اختبار رقعة قبل العلاجات الجديدة',
  lastTestLabel = 'آخر اختبار',
  nextDueLabel = 'الاختبار القادم',
  dueButtonText = ' موعد الاختبار',
  bookButtonText = 'احجزي اختبار حساسية',
  footerText = '🩺 سلامتكِ أولاً — اختبار الحساسية مجاني',
}: AllergyTestCardProps): JSX.Element {
  const isDue = nextDue ? new Date(nextDue) <= new Date() : false;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        isDue
          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30'
          : 'border-emerald-100 bg-white dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🩹
        </span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            {hasAllergies ? allergySubtitle : patchTestSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {lastTest && (
          <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-950">
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{lastTestLabel}</p>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{lastTest}</p>
          </div>
        )}
        {nextDue && (
          <div
            className={cn(
              'rounded-xl p-2.5 text-center',
              isDue ? 'bg-amber-100 dark:bg-amber-900' : 'bg-emerald-50 dark:bg-emerald-950',
            )}
          >
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">{nextDueLabel}</p>
            <p
              className={cn(
                'text-sm font-bold',
                isDue
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-emerald-800 dark:text-emerald-200',
              )}
            >
              {nextDue}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onBookTest}
        className={cn(
          'mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.98]',
          isDue
            ? 'bg-amber-600 text-white hover:bg-amber-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700',
        )}
      >
        {isDue ? dueButtonText : bookButtonText}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

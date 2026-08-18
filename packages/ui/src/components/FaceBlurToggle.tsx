'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Face Blur Toggle — auto-blur faces in public gallery using client-side AI.
 * From Phase W1: Safety & Privacy Architecture — Privacy-First Photo System.
 *
 * Usage:
 *   <FaceBlurToggle onToggle={(enabled) => console.log(enabled)} />
 */

interface FaceBlurToggleProps {
  onToggle?: (enabled: boolean) => void;
  /** Number of photos that would be affected */
  photosAffected?: number;
  title?: string;
  enabledStatusText?: string;
  disabledStatusText?: string;
  howItWorksLabel?: string;
  howItWorksDescription?: string;
  photosAffectedText?: string;
  enabledFooterText?: string;
  disabledFooterText?: string;
  footerNoteText?: string;
  className?: string;
}

export function FaceBlurToggle({
  onToggle,
  photosAffected,
  className = '',
  title = 'تعتيم الوجه',
  enabledStatusText = 'يتم تعتيم الوجوه تلقائياً — خصوصيتكِ أولاً',
  disabledStatusText = 'الوجوه ظاهرة — أنتِ تتحكمين',
  howItWorksLabel = ' كيف يعمل؟',
  howItWorksDescription = 'ذكاء اصطناعي على جهازكِ يتعرف على الوجوه ويعتمها تلقائياً. لا يتم رفع صوركِ إلى أي خادم — كل شيء على جهازكِ.',
  photosAffectedText = ' صورة متأثرة بهذا الإعداد',
  enabledFooterText = ' الوجوه معتمة تلقائياً في المعرض العام',
  disabledFooterText = ' الوجوه غير معتمة — ننصح بتفعيل التعتيم للخصوصية',
  footerNoteText = 'معالجة محلية بالكامل — خصوصيتكِ في جهازكِ فقط',
}: FaceBlurToggleProps): JSX.Element {
  const [enabled, setEnabled] = useState(true);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            ‍️
          </span>
          <div>
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
            <p className="text-[10px] text-blue-500 dark:text-blue-400">
              {enabled ? enabledStatusText : disabledStatusText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
            enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* How it works */}
      <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">{howItWorksLabel}</p>
        <p className="mt-0.5 text-[10px] text-blue-600 dark:text-blue-400">
          {howItWorksDescription}
        </p>
      </div>

      {/* Photos affected */}
      {photosAffected !== undefined && (
        <div className="mt-2 rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-950">
          <p className="text-[10px] text-blue-700 dark:text-blue-300">
            {photosAffected}
            {photosAffectedText}
          </p>
        </div>
      )}

      {/* Status */}
      <div className="mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <p className="text-center text-[10px] text-text-secondary dark:text-gray-300">
          {enabled ? enabledFooterText : disabledFooterText}
        </p>
      </div>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerNoteText}
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Incognito Mode Badge — private browsing without saving history.
 * From Phase W1: Safety & Privacy — Incognito Mode.
 *
 * Usage:
 *   <IncognitoModeBadge onToggle={(active) => console.log(active)} />
 */

interface IncognitoModeBadgeProps {
  onToggle?: (active: boolean) => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  activeTitle?: string;
  inactiveTitle?: string;
  activeSubtitle?: string;
  inactiveSubtitle?: string;
  expiryText?: string;
  privacyNote?: string;
  className?: string;
}

export function IncognitoModeBadge({
  onToggle,
  className = '',
  locale = 'ar',
  activeTitle = 'وضع التخفي نشط',
  inactiveTitle = 'وضع التخفي',
  activeSubtitle = 'لا يتم حفظ سجل التصفح — أنتِ مخفية تماماً',
  inactiveSubtitle = 'تصفحي بدون حفظ السجل أو الاقتراحات',
  expiryText = 'ينتهي وضع التخفي تلقائياً عند إغلاق التطبيق',
  privacyNote = 'وضع التخفي يمنع حفظ سجل التصفح والبحث على جهازكِ. مزود الخدمة لا يزال يرى النشاط للفوترة.',
}: IncognitoModeBadgeProps): JSX.Element {
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onToggle?.(next);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        active
          ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30'
          : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {active ? '️' : '️'}
          </span>
          <div>
            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {active ? activeTitle : inactiveTitle}
            </h4>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
              {active ? activeSubtitle : inactiveSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
            active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              active ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Active features */}
      {active && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { emoji: '', label: { ar: 'بدون سجل', en: 'No history' } },
              { emoji: '', label: { ar: 'بدون اقتراحات', en: 'No suggestions' } },
              { emoji: '', label: { ar: 'بدون كعكات', en: 'No cookies' } },
              { emoji: '️', label: { ar: 'حذف تلقائي', en: 'Auto-delete' } },
            ].map((f) => (
              <div
                key={f.label.ar}
                className="flex items-center gap-1.5 rounded-lg bg-white/60 px-2.5 py-1.5 dark:bg-gray-800/60"
              >
                <span className="text-xs" aria-hidden="true">
                  {f.emoji}
                </span>
                <span className="text-[10px] font-medium text-indigo-800 dark:text-indigo-200">
                  {f.label[locale]}
                </span>
              </div>
            ))}
          </div>

          {/* Expiry info */}
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-center text-[10px] text-indigo-600 dark:text-indigo-400">
              {expiryText}
            </p>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <span className="text-xs shrink-0" aria-hidden="true"></span>
        <p className="text-[9px] text-text-tertiary dark:text-gray-500">{privacyNote}</p>
      </div>
    </div>
  );
}

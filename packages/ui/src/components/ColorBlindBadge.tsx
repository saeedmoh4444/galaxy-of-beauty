'use client';

import { cn } from '@galaxy/shared';

/**
 * Color Blind Badge — color-blind friendly salon with high-contrast signage.
 * From Phase W8: Accessibility & Inclusivity.
 *
 * Usage:
 *   <ColorBlindBadge />
 */

interface ColorBlindBadgeProps {
  className?: string;
}

export function ColorBlindBadge({ className = '' }: ColorBlindBadgeProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">👁️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">صديق لعمى الألوان</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">إشارات عالية التباين — سهلة للجميع</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-[10px] text-purple-700 dark:text-purple-300">
        {[
          { emoji: '🎨', label: 'ألوان عالية التباين', desc: 'نستخدم تبايناً عالياً في اللوحات' },
          { emoji: '📝', label: 'رموز مع النصوص', desc: 'كل لون مصحوب برمز أو نص' },
          { emoji: '💡', label: 'إضاءة جيدة', desc: 'إضاءة كافية لتمييز التفاصيل' },
        ].map((f) => (
          <div key={f.label} className="flex items-start gap-2 rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
            <span className="text-sm shrink-0">{f.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">{f.label}</p>
              <p className="text-[9px] text-purple-600 dark:text-purple-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">👁️ الوضوح للجميع — ليس مجرد ألوان</p>
    </div>
  );
}

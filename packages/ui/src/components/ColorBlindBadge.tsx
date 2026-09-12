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
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  footerText?: string;
}

export function ColorBlindBadge({
  className = '',
  locale = 'ar',
  title = 'صديق لعمى الألوان',
  subtitle = 'إشارات عالية التباين — سهلة للجميع',
  footerText = 'الوضوح للجميع — ليس مجرد ألوان',
}: ColorBlindBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ️
        </span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-[10px] text-brand-700 dark:text-brand-300">
        {[
          {
            emoji: '🎨',
            label: { ar: 'ألوان عالية التباين', en: 'High-contrast colors' },
            desc: { ar: 'نستخدم تبايناً عالياً في اللوحات', en: 'We use high contrast in signage' },
          },
          {
            emoji: '🔡',
            label: { ar: 'رموز مع النصوص', en: 'Icons with text' },
            desc: {
              ar: 'كل لون مصحوب برمز أو نص',
              en: 'Every color is paired with an icon or text',
            },
          },
          {
            emoji: '💡',
            label: { ar: 'إضاءة جيدة', en: 'Good lighting' },
            desc: {
              ar: 'إضاءة كافية لتمييز التفاصيل',
              en: 'Adequate lighting to distinguish details',
            },
          },
        ].map((f) => (
          <div
            key={f.label.ar}
            className="flex items-start gap-2 rounded-lg bg-brand-50 px-2.5 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{f.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-brand-800 dark:text-brand-200">
                {f.label[locale]}
              </p>
              <p className="text-[9px] text-brand-600 dark:text-brand-400">{f.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-text-secondary">
        ️ {footerText}
      </p>
    </div>
  );
}

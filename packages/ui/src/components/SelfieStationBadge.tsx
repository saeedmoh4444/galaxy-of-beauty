'use client';

import { cn } from '@galaxy/shared';

/**
 * Selfie Station Badge — dedicated selfie spot with ring light at partner salons.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <SelfieStationBadge hasRingLight={true} hasPhoneStand={true} />
 */

interface SelfieStationBadgeProps {
  hasRingLight?: boolean;
  hasPhoneStand?: boolean;
  hasBackdrop?: boolean;
  hasProps?: boolean;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  shareLabel?: string;
  footerText?: string;
  className?: string;
}

export function SelfieStationBadge({
  hasRingLight = true,
  hasPhoneStand = true,
  hasBackdrop = true,
  hasProps = false,
  className = '',
  locale = 'ar',
  title = 'ركن التصوير',
  subtitle = 'التقطي صوراً رائعة لإطلالتكِ الجديدة',
  shareLabel = 'شاركي إطلالتكِ مع',
  footerText = 'لأن كل إطلالة جميلة تستحق صورة',
}: SelfieStationBadgeProps): JSX.Element {
  const features = [
    { emoji: '', label: { ar: 'إضاءة Ring Light', en: 'Ring light' }, available: hasRingLight },
    { emoji: '', label: { ar: 'حامل جوال', en: 'Phone stand' }, available: hasPhoneStand },
    { emoji: '', label: { ar: 'خلفية تصوير', en: 'Photo backdrop' }, available: hasBackdrop },
    { emoji: '🪞', label: { ar: 'إكسسوارات تصوير', en: 'Photo props' }, available: hasProps },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{title}</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {features.map((f) => (
          <div
            key={f.label.ar}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2.5 py-2',
              f.available
                ? 'bg-fuchsia-50 dark:bg-fuchsia-950'
                : 'bg-gray-50 opacity-40 dark:bg-gray-800',
            )}
          >
            <span className="text-sm" aria-hidden="true">
              {f.emoji}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium',
                f.available
                  ? 'text-fuchsia-800 dark:text-fuchsia-200'
                  : 'text-gray-400 dark:text-gray-600',
              )}
            >
              {f.label[locale]}
            </span>
            <span className="ml-auto text-[9px]">{f.available ? '' : '—'}</span>
          </div>
        ))}
      </div>

      {/* Hashtag */}
      <div className="mt-3 rounded-xl bg-fuchsia-50 p-3 text-center dark:bg-fuchsia-950">
        <p className="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-300">{shareLabel}</p>
        <p className="mt-0.5 text-xs font-bold text-fuchsia-800 dark:text-fuchsia-200" dir="ltr">
          #GalaxyOfBeauty
        </p>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

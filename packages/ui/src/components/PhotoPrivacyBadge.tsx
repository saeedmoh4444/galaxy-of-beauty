'use client';

import { cn } from '@galaxy/shared';

/**
 * Photo Privacy Badge — shows privacy level and auto-delete countdown for photos.
 * From Phase W1: Safety & Privacy Architecture.
 *
 * Usage:
 *   <PhotoPrivacyBadge level="TECHNICIAN_ONLY" expiresInDays={23} />
 */

type PrivacyLevel = 'PUBLIC' | 'TECHNICIAN_ONLY' | 'PRIVATE' | 'VIEW_ONCE';

interface PrivacyConfig {
  emoji: string;
  label: string;
  description: string;
  colorClass: string;
}

const PRIVACY: Record<PrivacyLevel, PrivacyConfig> = {
  PUBLIC: {
    emoji: '🌐',
    label: 'عام',
    description: 'ظاهرة في المعرض العام',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  TECHNICIAN_ONLY: {
    emoji: '👩‍🎨',
    label: 'للخبيرة فقط',
    description: 'لا تظهر إلا للخبيرة المعتمدة',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  PRIVATE: {
    emoji: '🔒',
    label: 'خاصة',
    description: 'لكِ فقط — غير مرئية لأحد',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
  VIEW_ONCE: {
    emoji: '👁️',
    label: 'مرة واحدة',
    description: 'تختفي بعد مشاهدتها',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
};

interface PhotoPrivacyBadgeProps {
  level: PrivacyLevel;
  /** Days until auto-delete (0 = no auto-delete) */
  expiresInDays?: number;
  /** Show the description tooltip */
  showDescription?: boolean;
  /** Visual size variant */
  size?: 'sm' | 'md';
  className?: string;
}

export function PhotoPrivacyBadge({
  level,
  expiresInDays = 0,
  showDescription = false,
  size = 'md',
  className = '',
}: PhotoPrivacyBadgeProps): JSX.Element {
  const config = PRIVACY[level];
  const isSm = size === 'sm';
  const isExpiringSoon = expiresInDays > 0 && expiresInDays <= 7;
  const hasExpiry = expiresInDays > 0;

  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border px-3 py-2',
        config.colorClass,
        isSm && 'px-2 py-1',
        className,
      )}
    >
      {/* Privacy level row */}
      <div className="flex items-center gap-1.5">
        <span className={cn('shrink-0', isSm ? 'text-xs' : 'text-sm')} aria-hidden="true">
          {config.emoji}
        </span>
        <span className={cn('font-bold', isSm ? 'text-[10px]' : 'text-xs')}>
          {config.label}
        </span>
        {level === 'VIEW_ONCE' && (
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
        )}
      </div>

      {/* Description */}
      {showDescription && (
        <p className={cn('text-[10px] opacity-70', isSm && 'text-[9px]')}>
          {config.description}
        </p>
      )}

      {/* Auto-delete countdown */}
      {hasExpiry && (
        <div
          className={cn(
            'flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 dark:bg-black/20',
            isExpiringSoon && 'bg-rose-100 dark:bg-rose-900/40',
          )}
        >
          <span className="text-[10px]" aria-hidden="true">
            {isExpiringSoon ? '⚠️' : '🗓️'}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium',
              isExpiringSoon ? 'text-rose-700 dark:text-rose-300' : 'opacity-70',
            )}
          >
            {expiresInDays === 1
              ? 'تحذف غداً'
              : `تحذف بعد ${expiresInDays} يوم`}
          </span>
        </div>
      )}

      {/* Indefinite badge */}
      {!hasExpiry && level !== 'VIEW_ONCE' && (
        <div className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 dark:bg-black/20">
          <span className="text-[10px]" aria-hidden="true">♾️</span>
          <span className="text-[10px] font-medium opacity-70">لا تنتهي</span>
        </div>
      )}
    </div>
  );
}

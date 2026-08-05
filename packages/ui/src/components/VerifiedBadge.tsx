'use client';

/**
 * Verified Badge — shows KYC verification status.
 * Used on technician profiles to build trust.
 */

interface VerifiedBadgeProps {
  status: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  className?: string;
}

const STATUS_CONFIG: Record<string, { emoji: string; labelAr: string; color: string }> = {
  VERIFIED: { emoji: '✅', labelAr: 'موثقة', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  SUBMITTED: { emoji: '⏳', labelAr: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  PENDING: { emoji: '📋', labelAr: 'بانتظار التوثيق', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  REJECTED: { emoji: '❌', labelAr: 'مرفوض', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

export function VerifiedBadge({ status, className = '' }: VerifiedBadgeProps): JSX.Element {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING!;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color} ${className}`}>
      {config.emoji} {config.labelAr}
    </span>
  );
}

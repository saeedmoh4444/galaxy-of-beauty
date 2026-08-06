'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Coupon Card — discount coupon display with copy functionality.
 * From Phase W5: Financial Empowerment.
 *
 * Usage:
 *   <BeautyCouponCard code="BEAUTY20" discount={20} expiresAt="2026-12-31" />
 */

interface BeautyCouponCardProps {
  code: string;
  discount: number;
  expiresAt?: string;
  description?: string;
  onCopy?: () => void;
  className?: string;
}

export function BeautyCouponCard({ code, discount, expiresAt, description, onCopy, className = '' }: BeautyCouponCardProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🎫</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">كوبون خصم</h4>
        <p className="mt-1 text-3xl font-extrabold text-amber-700 dark:text-amber-300">{discount}%</p>
        {description && <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">{description}</p>}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
        <code className="flex-1 text-center text-sm font-bold tracking-wider text-amber-800 dark:text-amber-200">{code}</code>
        <button type="button" onClick={handleCopy} className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700 transition-colors">
          {copied ? '✅' : 'نسخ'}
        </button>
      </div>

      {expiresAt && (
        <p className="mt-2 text-center text-[10px] text-amber-600 dark:text-amber-400">⏰ ينتهي {expiresAt}</p>
      )}
    </div>
  );
}

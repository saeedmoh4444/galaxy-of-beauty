'use client';

import { cn } from '@galaxy/shared';

/**
 * Subscription Gift Card — gift a beauty subscription to a friend.
 * From Phase W5: Financial Empowerment & W4: Sisterhood.
 *
 * Usage:
 *   <SubscriptionGiftCard friendName="نورة" onSend={() => {}} />
 */

interface SubscriptionGiftCardProps {
  friendName?: string;
  onSend?: () => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  sendToPrefix?: string;
  sendGiftSuffix?: string;
  sendGiftText?: string;
  currencySuffix?: string;
  sendButtonText?: string;
  footerText?: string;
  className?: string;
}

const GIFT_OPTIONS = [
  { emoji: '', months: 1, price: 99, label: { ar: 'شهر واحد', en: '1 month' } },
  {
    emoji: '',
    months: 3,
    price: 269,
    label: { ar: '3 أشهر', en: '3 months' },
    discount: { ar: 'وفر 10%', en: 'Save 10%' },
  },
  {
    emoji: '',
    months: 6,
    price: 499,
    label: { ar: '6 أشهر', en: '6 months' },
    discount: { ar: 'وفر 15%', en: 'Save 15%' },
  },
];

export function SubscriptionGiftCard({
  friendName,
  onSend,
  className = '',
  locale = 'ar',
  title = 'أهدي اشتراك',
  sendToPrefix = 'أرسلي لـ ',
  sendGiftSuffix = 'هدية الجمال',
  sendGiftText = 'أرسلي هدية الجمال لصديقة',
  currencySuffix = 'ر.س',
  sendButtonText = 'أرسلي الهدية',
  footerText = 'الجمال هدية لا تُنسى',
}: SubscriptionGiftCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {friendName ? `${sendToPrefix}${friendName} ${sendGiftSuffix}` : sendGiftText}
        </p>
      </div>

      <div className="mt-3 space-y-1.5">
        {GIFT_OPTIONS.map((opt) => (
          <div
            key={opt.months}
            className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{opt.emoji}</span>
              <div>
                <p className="text-xs font-bold text-text-primary dark:text-gray-100">
                  {opt.label[locale]}
                </p>
                {opt.discount && (
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400">
                    {opt.discount[locale]}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm font-bold text-pink-700 dark:text-pink-300">
              {opt.price} {currencySuffix}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSend}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm"
      >
        {sendButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{footerText}</p>
    </div>
  );
}

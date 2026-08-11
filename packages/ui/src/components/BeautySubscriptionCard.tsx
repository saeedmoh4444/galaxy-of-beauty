'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Subscription Card — monthly beauty box subscription.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautySubscriptionCard tier="premium" onSubscribe={() => {}} />
 */

type SubTier = 'basic' | 'premium' | 'vip';

interface TierDef {
  emoji: string;
  label: string;
  price: number;
  includes: string[];
  color: string;
}

const TIERS: Record<SubTier, TierDef> = {
  basic: {
    emoji: '🌸',
    label: 'أساسية',
    price: 99,
    includes: ['خدمة واحدة شهرياً', 'خصم 10% على الخدمات الإضافية', 'أولوية حجز 24 ساعة'],
    color: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
  },
  premium: {
    emoji: '🌺',
    label: 'مميزة',
    price: 199,
    includes: ['خدمتين شهرياً', 'خصم 20% على الخدمات الإضافية', 'أولوية حجز 48 ساعة', 'هدية شهرية'],
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  },
  vip: {
    emoji: '👑',
    label: 'VIP',
    price: 399,
    includes: [
      '4 خدمات شهرياً',
      'خصم 30% على جميع الخدمات',
      'أولوية حجز دائمة',
      'مرشدة جمال خاصة',
      'هدية شهرية فاخرة',
    ],
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
  },
};

interface BeautySubscriptionCardProps {
  tier?: SubTier;
  onSubscribe?: () => void;
  className?: string;
}

export function BeautySubscriptionCard({
  tier = 'premium',
  onSubscribe,
  className = '',
}: BeautySubscriptionCardProps): JSX.Element {
  const t = TIERS[tier];

  return (
    <div className={cn('rounded-2xl border bg-white p-5 dark:bg-gray-900', t.color, className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {t.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-text-primary dark:text-gray-100">
          اشتراك الجمال الشهري
        </h4>
        <p className="text-[10px] text-text-tertiary dark:text-gray-400">الباقة {t.label}</p>
      </div>

      {/* Price */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-3xl font-bold text-text-primary dark:text-gray-100">{t.price} ر.س</p>
        <p className="text-[10px] text-text-tertiary dark:text-gray-500">/ شهرياً</p>
      </div>

      {/* Includes */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">🎁 يشمل</p>
        <div className="mt-1 space-y-0.5">
          {t.includes.map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-500">✅</span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier selector */}
      <div className="mt-3 flex gap-1">
        {(Object.keys(TIERS) as SubTier[]).map((key) => (
          <button
            key={key}
            type="button"
            className={cn(
              'flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-colors',
              key === tier
                ? 'bg-white text-text-primary shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-text-tertiary hover:bg-white/50 dark:hover:bg-gray-700/50',
            )}
          >
            {TIERS[key].emoji} {TIERS[key].label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubscribe}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-purple-600 active:scale-[0.98] transition-all shadow-sm"
      >
        اشتركي الآن 💫
      </button>
    </div>
  );
}

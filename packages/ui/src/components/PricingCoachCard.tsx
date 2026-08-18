'use client';

import { cn } from '@galaxy/shared';

/**
 * Pricing Coach Card — AI suggests optimal pricing for technician services.
 * From Phase W5: Financial Empowerment — Technician Entrepreneurship.
 *
 * Usage:
 *   <PricingCoachCard
 *     service={{ name: 'مانيكير سبا', currentPrice: 120, suggestedPrice: 150 }}
 *   />
 */

interface ServicePricing {
  name: string;
  currentPrice: number;
  suggestedPrice: number;
  demand?: 'high' | 'medium' | 'low';
  competitorAvg?: number;
}

interface PricingCoachCardProps {
  service: ServicePricing;
  onApplySuggestion?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Label for the current price stat */
  currentPriceLabel?: string;
  /** Label for the suggested price stat */
  suggestedPriceLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Label for the increase stat */
  increaseLabel?: string;
  /** Label for the competitor average stat */
  competitorAvgLabel?: string;
  /** Apply suggestion button label */
  applyButtonText?: string;
  /** Footer analysis note */
  footerText?: string;
  /** Display locale for demand labels */
  locale?: 'ar' | 'en';
}

const DEMAND_LABELS: Record<
  string,
  { emoji: string; label: { ar: string; en: string }; color: string }
> = {
  high: {
    emoji: '',
    label: { ar: 'طلب عالي', en: 'High demand' },
    color: 'text-rose-600 dark:text-rose-400',
  },
  medium: {
    emoji: '',
    label: { ar: 'طلب متوسط', en: 'Medium demand' },
    color: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    emoji: '',
    label: { ar: 'طلب منخفض', en: 'Low demand' },
    color: 'text-gray-500 dark:text-gray-400',
  },
};

export function PricingCoachCard({
  service,
  onApplySuggestion,
  className = '',
  title = 'مدرب التسعير',
  subtitle = 'ذكاء اصطناعي يساعدكِ في تسعير خدماتكِ',
  currentPriceLabel = 'سعركِ الحالي',
  suggestedPriceLabel = 'السعر المقترح',
  currencySuffix = 'ر.س',
  increaseLabel = 'الزيادة',
  competitorAvgLabel = 'متوسط المنافسين',
  applyButtonText = 'تطبيق السعر المقترح',
  footerText = 'بناءً على تحليل الطلب والمنافسة ومهاراتكِ',
  locale = 'ar',
}: PricingCoachCardProps): JSX.Element {
  const diff = service.suggestedPrice - service.currentPrice;
  const pctIncrease = Math.round((diff / service.currentPrice) * 100);
  const demand = service.demand ? DEMAND_LABELS[service.demand] : null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">{subtitle}</p>
        </div>
      </div>

      {/* Service */}
      <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <p className="text-xs font-bold text-text-primary dark:text-gray-100">{service.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">{currentPriceLabel}</p>
            <p className="text-lg font-bold text-text-primary dark:text-gray-100">
              {service.currentPrice} {currencySuffix}
            </p>
          </div>
          <span className="text-blue-400" aria-hidden="true">
            →
          </span>
          <div className="text-center">
            <p className="text-[9px] text-blue-600 dark:text-blue-400">{suggestedPriceLabel}</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {service.suggestedPrice} {currencySuffix}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{increaseLabel}</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            +{diff} {currencySuffix} (+{pctIncrease}%)
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{competitorAvgLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {service.competitorAvg ? `${service.competitorAvg} ${currencySuffix}` : '—'}
          </p>
        </div>
      </div>

      {/* Demand indicator */}
      {demand && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <span>{demand.emoji}</span>
          <span className={cn('text-[10px] font-medium', demand.color)}>
            {demand.label[locale]}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onApplySuggestion}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {applyButtonText}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}

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
}

const DEMAND_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  high: { emoji: '', label: 'طلب عالي', color: 'text-rose-600 dark:text-rose-400' },
  medium: { emoji: '', label: 'طلب متوسط', color: 'text-amber-600 dark:text-amber-400' },
  low: { emoji: '', label: 'طلب منخفض', color: 'text-gray-500 dark:text-gray-400' },
};

export function PricingCoachCard({
  service,
  onApplySuggestion,
  className = '',
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
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">مدرب التسعير</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">
            ذكاء اصطناعي يساعدكِ في تسعير خدماتكِ
          </p>
        </div>
      </div>

      {/* Service */}
      <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <p className="text-xs font-bold text-text-primary dark:text-gray-100">{service.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[9px] text-text-tertiary dark:text-gray-500">سعركِ الحالي</p>
            <p className="text-lg font-bold text-text-primary dark:text-gray-100">
              {service.currentPrice} ر.س
            </p>
          </div>
          <span className="text-blue-400" aria-hidden="true">
            →
          </span>
          <div className="text-center">
            <p className="text-[9px] text-blue-600 dark:text-blue-400">السعر المقترح</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {service.suggestedPrice} ر.س
            </p>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الزيادة</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            +{diff} ر.س (+{pctIncrease}%)
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">متوسط المنافسين</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {service.competitorAvg ? `${service.competitorAvg} ر.س` : '—'}
          </p>
        </div>
      </div>

      {/* Demand indicator */}
      {demand && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <span>{demand.emoji}</span>
          <span className={cn('text-[10px] font-medium', demand.color)}>{demand.label}</span>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onApplySuggestion}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        تطبيق السعر المقترح
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        بناءً على تحليل الطلب والمنافسة ومهاراتكِ
      </p>
    </div>
  );
}

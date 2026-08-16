'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency } from '@galaxy/ui';

export default function SmartPricingPage(): JSX.Element {
  const { data, isLoading } = api.smartPricing.current.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const items = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">الأسعار الذكية</h1>
        <p className="mt-2 text-text-secondary">
          أسعار متغيرة حسب الطلب — احجزي في الوقت المناسب ووفري!
        </p>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : (
        <div className="space-y-3">
          {items.map((s: Record<string, unknown>) => (
            <Card key={s.service as string} padding="lg" className="flex items-center gap-4">
              <span className="text-4xl">{s.emoji as string}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{s.service as string}</h3>
                <p className="text-xs text-text-secondary">{s.reason as string}</p>
              </div>
              <div className="text-right">
                {s.currentPrice !== s.basePrice && (
                  <span className="text-sm text-text-tertiary line-through">
                    {formatCurrency(s.basePrice as number)}
                  </span>
                )}
                <p
                  className={`text-2xl font-extrabold ${(s.currentPrice as number) < (s.basePrice as number) ? 'text-green-600' : 'text-brand-600'}`}
                >
                  {formatCurrency(s.currentPrice as number)} ر.س
                </p>
                {(s.discount as number) > 0 && (
                  <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-bold text-green-700">
                    -{s.discount as number}%
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, formatCurrency, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function SalonFinderPage(): JSX.Element {
  const { t } = useLocale();
  const { data: cities } = api.salonMap.cities.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [city, setCity] = useState('');
  const {
    data: results,
    isLoading,
    isError,
    refetch,
  } = api.salonMap.explore.useQuery({ city: city || undefined }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  if (isError)
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert message={t('marketing.salon-finder.load-error')} onRetry={() => refetch()} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('marketing.salon-finder.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.salon-finder.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setCity('')}
          className={`rounded-full px-4 py-2 text-sm ${!city ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
        >
          {t('marketing.salon-finder.all')}
        </button>
        {(cities ?? []).map((c: Record<string, unknown>) => (
          <button
            key={c.key as string}
            onClick={() => setCity(c.key as string)}
            className={`rounded-full px-4 py-2 text-sm ${city === c.key ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
          >
            {c.nameAr as string}
          </button>
        ))}
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : !(results ?? []).length ? (
        <Card padding="lg" className="text-center py-8">
          <p className="text-4xl mb-2"></p>
          <p className="text-text-secondary">{t('marketing.salon-finder.no-salons')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(results ?? []).map((item: Record<string, unknown>) => {
            const user = item.user as Record<string, unknown> | undefined;
            const services = (item.services as Array<Record<string, unknown>>) ?? [];
            return (
              <Card key={item.id as number} padding="lg" className="text-center">
                <span className="text-5xl">‍️</span>
                <h3 className="font-bold mt-3">
                  {(user?.name as string) ??
                    t('marketing.salon-finder.tech-fallback', { id: item.id as number })}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {item.city as string} · {(item.ratingAvg as number) ?? '—'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1 justify-center">
                  {services.slice(0, 3).map((s: Record<string, unknown>) => {
                    const svc = s.service as Record<string, unknown> | undefined;
                    return (
                      <span
                        key={svc?.id as number}
                        className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
                      >
                        {(svc?.titleJson as Record<string, string>)?.ar}
                      </span>
                    );
                  })}
                </div>
                {services.length > 0 && (
                  <p className="text-xs text-text-tertiary mt-2">
                    {t('marketing.salon-finder.from-label')}{' '}
                    {formatCurrency(
                      Number((services[0]?.service as Record<string, unknown>)?.basePrice ?? 0),
                    )}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

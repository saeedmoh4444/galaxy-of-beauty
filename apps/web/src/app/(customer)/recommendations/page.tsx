'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const POPULAR_SERVICES: { id: number; name: TranslationKey; emoji: string }[] = [
  { id: 1, name: 'recommendations.manicure', emoji: '' },
  { id: 2, name: 'recommendations.pedicure', emoji: '' },
  { id: 3, name: 'recommendations.facialCleaning', emoji: '' },
  { id: 4, name: 'recommendations.massage', emoji: '‍️' },
  { id: 5, name: 'recommendations.hairDye', emoji: '' },
  { id: 6, name: 'recommendations.makeup', emoji: '' },
];

export default function RecommendationsPage(): JSX.Element {
  const { t } = useLocale();
  const [serviceId, setServiceId] = useState(1);
  const { data: together, isLoading: tLoading } =
    api.recommendations.frequentlyBookedTogether.useQuery({ serviceId, limit: 4 }) as {
      data: Array<Record<string, unknown>> | undefined;
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    };
  const { data: complete, isLoading: cLoading } = api.recommendations.completeTheLook.useQuery({
    serviceId,
    limit: 4,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('recommendations.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('recommendations.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('recommendations.chooseService')}</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId === s.id ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
              >
                {s.emoji} {t(s.name)}
              </button>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-4">{t('recommendations.bookedTogether')}</h3>
          {tLoading ? (
            <GridSkeleton count={4} />
          ) : !(together ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('recommendations.noRecommendations')}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(together ?? []).map((s: Record<string, unknown>) => (
                <div
                  key={s.id as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-bold text-sm">{s.title as string}</p>
                    <p className="text-xs text-text-secondary">
                      {formatCurrency(s.basePrice as number)}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                    {s.bookedTogether as number}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-4">{t('recommendations.completeLook')}</h3>
          {cLoading ? (
            <GridSkeleton count={4} />
          ) : !(complete ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('recommendations.noRecommendations')}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(complete ?? []).map((s: Record<string, unknown>) => (
                <div key={s.id as number} className="rounded-lg border p-3">
                  <p className="font-bold text-sm">{s.title as string}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatCurrency(s.basePrice as number)} ·{' '}
                    {t('recommendations.minutes', { count: s.durationMin as number })}
                  </p>
                  {s.reason === 'popular' && (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {t('recommendations.mostRequested')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

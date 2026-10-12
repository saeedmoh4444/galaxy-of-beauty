'use client';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

/* ================================================================
 * E5 — At-home salon dashboard (assigned home requests)
 * ================================================================ */
export function AthomeDashboard({
  store,
  shellRole,
}: {
  store: Record<string, unknown>;
  shellRole?: string;
}): JSX.Element {
  const { t } = useLocale();
  const requestsQ = api.vendorPortal['homeRequests.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const completeMut = api.vendorPortal['homeRequests.complete'].useMutation({
    onSuccess: () => requestsQ.refetch(),
  });

  const requests = requestsQ.data ?? [];

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('vendorPortal.athome.coverage')}: {store.homeCity as string} ·{' '}
            {store.homeAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.athome.requests-title')}</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.athome.requests-empty')}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r: Record<string, unknown>) => (
                <div key={r.id as number} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {(r.customer as Record<string, unknown> | null)?.name as string}
                    </p>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {r.status as string}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {r.address as string} · {r.preferredDate as string} ·{' '}
                    {r.preferredTime as string}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {(r.service as Record<string, unknown> | null)
                      ? String(
                          (
                            (r.service as Record<string, unknown>).titleJson as Record<
                              string,
                              string
                            >
                          )?.ar ?? '',
                        )
                      : ''}
                  </p>
                  {r.status === 'PENDING' && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => completeMut.mutate({ requestId: r.id as number })}
                      loading={completeMut.isPending}
                    >
                      {t('vendorPortal.athome.complete')}
                    </Button>
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

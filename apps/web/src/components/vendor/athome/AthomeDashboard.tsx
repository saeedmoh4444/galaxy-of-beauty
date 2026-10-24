'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore } from '@galaxy/api';

/* ================================================================
 * E5 — At-home salon dashboard (assigned home requests)
 * E3 — accept/decline city queue + completion confirmation
 * ================================================================ */
export function AthomeDashboard({
  store,
  shellRole,
}: {
  store: NonNullable<MyStore>;
  shellRole?: string;
}): JSX.Element {
  const { t } = useLocale();
  const [declineReason, setDeclineReason] = useState('');
  const requestsQ = api.vendorPortal['homeRequests.list'].useQuery(undefined);
  const queueQ = api.vendorPortal['homeRequests.queue'].useQuery(undefined);
  const completeMut = api.vendorPortal['homeRequests.complete'].useMutation({
    onSuccess: () => requestsQ.refetch(),
  });
  const acceptMut = api.vendorPortal['homeRequests.accept'].useMutation({
    onSuccess: () => {
      void queueQ.refetch();
      void requestsQ.refetch();
    },
  });
  const declineMut = api.vendorPortal['homeRequests.decline'].useMutation({
    onSuccess: () => {
      setDeclineReason('');
      void queueQ.refetch();
    },
  });

  const requests = requestsQ.data ?? [];
  const queue = queueQ.data ?? [];

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

        {/* E3 — accept/decline queue: unassigned requests in the salon city. */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.athome.queue-title')}</h3>
          {queue.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.athome.queue-empty')}</p>
          ) : (
            <div className="space-y-3">
              {queue.map((r) => (
                <div key={r.id as number} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{r.customer?.name}</p>
                    <span className="text-xs text-text-secondary">{r.city as string}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {r.address as string} · {r.preferredDate as string} ·{' '}
                    {r.preferredTime as string}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {r.service
                      ? String((r.service.titleJson as Record<string, string>)?.ar ?? '')
                      : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptMut.mutate({ requestId: r.id as number })}
                      loading={acceptMut.isPending}
                    >
                      {t('vendorPortal.athome.accept')}
                    </Button>
                    <input
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder={t('vendorPortal.athome.decline-reason')}
                      className="w-40 rounded-lg border px-2 py-1 text-xs border-edge bg-surface-elevated"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        declineMut.mutate({
                          requestId: r.id as number,
                          ...(declineReason.trim() ? { reason: declineReason.trim() } : {}),
                        })
                      }
                      loading={declineMut.isPending}
                    >
                      {t('vendorPortal.athome.decline')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.athome.requests-title')}</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.athome.requests-empty')}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id as number} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{r.customer?.name}</p>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {r.status as string}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {r.address as string} · {r.preferredDate as string} ·{' '}
                    {r.preferredTime as string}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {r.service
                      ? String((r.service.titleJson as Record<string, string>)?.ar ?? '')
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

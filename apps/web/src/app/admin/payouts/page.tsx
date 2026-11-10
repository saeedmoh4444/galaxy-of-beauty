'use client';
import type { JSX } from 'react';

import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  TableSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  formatCurrency,
  useAuth,
} from '@galaxy/ui';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

type PayoutItem = NonNullable<RouterOutput['payouts']['listForAdmin']>['payouts'][number];

export default function PayoutsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.payouts.listForAdmin.useQuery(
    {},
    { enabled: isAuthenticated },
  );
  const items: PayoutItem[] = data?.payouts ?? [];
  const processMut = api.payouts.process.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('admin.payouts.processed-toast'));
    },
    onError: () => addToast('error', t('admin.payouts.process-failed-toast')),
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
      FAILED: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    };
    const labelKeys: Record<string, TranslationKey> = {
      PENDING: 'admin.payouts.status-pending',
      PROCESSING: 'admin.payouts.status-processing',
      COMPLETED: 'admin.payouts.status-completed',
      FAILED: 'admin.payouts.status-failed',
    };
    return (
      <span className={`rounded px-2 py-0.5 text-xs ${map[s] || ''}`}>
        {t(labelKeys[s] ?? (s as unknown as TranslationKey))}
      </span>
    );
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('admin.payouts.title')}</h1>
        {/* D2 — seller payout-request queue (approve → manual transfer
            recorded; reject with a note). */}
        <RequestsQueue />
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorAlert message={t('admin.payouts.load-error')} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('admin.payouts.empty')} />
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-text-secondary dark:text-text-tertiary">
                <tr>
                  <th className="p-3 text-end">{t('admin.payouts.technician-header')}</th>
                  <th className="p-3 text-end">{t('admin.payouts.amount-header')}</th>
                  <th className="p-3 text-end">{t('admin.payouts.status-header')}</th>
                  <th className="p-3 text-end">{t('admin.payouts.date-header')}</th>
                  <th className="p-3 text-end">{t('admin.payouts.action-header')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-muted">
                {items.map((p: PayoutItem) => (
                  <tr key={p.id}>
                    <td className="p-3 font-medium">
                      {/* Store plan Phase 3 — store payouts carry a vendor. */}
                      {p.vendor?.storeName ?? p.technician?.name ?? '-'}
                    </td>
                    <td className="p-3 font-bold">{formatCurrency(Number(p.amount ?? 0))}</td>
                    <td className="p-3">{statusBadge(p.status)}</td>
                    <td className="p-3 text-text-tertiary">
                      {new Date(p.createdAt).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </td>
                    <td className="p-3">
                      {p.status === 'PENDING' ? (
                        <Button size="sm" onClick={() => processMut.mutate({ payoutId: p.id })}>
                          {t('admin.payouts.process')}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}

/**
 * D2 (SELLER_FIRST_CLASS_ROLE_PLAN) — the approval queue for seller-initiated
 * payout requests. Approve records a MANUAL transfer reference on the covered
 * payout rows; reject stores an admin note.
 */
function RequestsQueue(): JSX.Element | null {
  const { t } = useLocale();
  const { addToast } = useToast();
  const utils = api.useUtils();
  const { data } = api.payouts.listRequestsForAdmin.useQuery({ status: 'PENDING' });
  const approveMut = api.payouts.approveRequest.useMutation({
    onSuccess: () => {
      void utils.payouts.listRequestsForAdmin.invalidate();
      addToast('success', t('admin.payouts.requests-approved'));
    },
    onError: (err) => addToast('error', err.message),
  });
  const rejectMut = api.payouts.rejectRequest.useMutation({
    onSuccess: () => {
      void utils.payouts.listRequestsForAdmin.invalidate();
      addToast('success', t('admin.payouts.requests-rejected'));
    },
    onError: (err) => addToast('error', err.message),
  });

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div data-testid="payout-requests-queue">
      <Card padding="none">
        <div className="border-b border-edge-muted p-4">
          <h2 className="text-lg font-bold">{t('admin.payouts.requests-title')}</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-secondary dark:text-text-tertiary">
            <tr>
              <th className="p-3 text-end">{t('admin.payouts.requests-store')}</th>
              <th className="p-3 text-end">{t('admin.payouts.amount-header')}</th>
              <th className="p-3 text-end">{t('admin.payouts.date-header')}</th>
              <th className="p-3 text-end">{t('admin.payouts.action-header')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge-muted">
            {items.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-medium">{r.storeName}</td>
                <td className="p-3 font-bold">{formatCurrency(r.amount)}</td>
                <td className="p-3 text-text-tertiary">
                  {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMut.mutate({ requestId: r.id })}
                      loading={approveMut.isPending}
                    >
                      {t('admin.payouts.requests-approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMut.mutate({ requestId: r.id, adminNote: 'Rejected' })}
                      loading={rejectMut.isPending}
                    >
                      {t('admin.payouts.requests-reject')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

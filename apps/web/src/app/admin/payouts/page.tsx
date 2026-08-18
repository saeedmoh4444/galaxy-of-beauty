'use client';

import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, TableSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

type PayoutItem = NonNullable<RouterOutput['payouts']['listForAdmin']>['payouts'][number];

export default function PayoutsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.payouts.listForAdmin.useQuery({});
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
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
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
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('admin.payouts.title')}
        </h1>
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorAlert message={t('admin.payouts.load-error')} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('admin.payouts.empty')} />
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-3 text-right">{t('admin.payouts.technician-header')}</th>
                  <th className="p-3 text-right">{t('admin.payouts.amount-header')}</th>
                  <th className="p-3 text-right">{t('admin.payouts.status-header')}</th>
                  <th className="p-3 text-right">{t('admin.payouts.date-header')}</th>
                  <th className="p-3 text-right">{t('admin.payouts.action-header')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((p: PayoutItem) => (
                  <tr key={p.id}>
                    <td className="p-3 font-medium">{p.technician?.name ?? '-'}</td>
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
    </DashboardLayout>
  );
}

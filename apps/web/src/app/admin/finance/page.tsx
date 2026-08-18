'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  KPIRowSkeleton,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type FinancialData = RouterOutput['admin']['getFinancials'];
type PayoutItem = NonNullable<RouterOutput['payouts']['listForAdmin']>['payouts'][number];

export default function AdminFinancePage(): JSX.Element {
  const { t } = useLocale();
  const financials = api.admin.getFinancials.useQuery();
  const payouts = api.payouts.listForAdmin.useQuery({ page: 1, limit: 20 });
  const calculateMut = api.payouts.calculate.useMutation();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const fin = financials.data as FinancialData | undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.finance.title')}</h1>

      {financials.isLoading ? (
        <KPIRowSkeleton count={4} />
      ) : financials.isError ? (
        <ErrorAlert message={t('admin.finance.load-error')} onRetry={() => financials.refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="text-center">
            <p className="text-sm text-text-secondary">{t('admin.finance.revenue')}</p>
            <p className="text-2xl font-bold text-brand-600">
              {formatCurrency(Number(fin?.totalRevenue ?? 0))}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-secondary">{t('admin.finance.platform-fees')}</p>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(Number(fin?.platformFees ?? 0))}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-secondary">{t('admin.finance.technician-earnings')}</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(Number(fin?.technicianEarnings ?? 0))}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-secondary">{t('admin.finance.pending-payouts')}</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(Number(fin?.pendingPayouts ?? 0))}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.finance.calculate-payouts')}</h2>
        <div className="flex gap-4">
          <Input
            label={t('admin.finance.from-date')}
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
          <Input
            label={t('admin.finance.to-date')}
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
          <Button
            onClick={() =>
              calculateMut.mutate({
                periodStart: new Date(periodStart).toISOString(),
                periodEnd: new Date(periodEnd).toISOString(),
              })
            }
            loading={calculateMut.isPending}
            className="self-end"
          >
            {t('admin.finance.calculate')}
          </Button>
        </div>
        {calculateMut.data && (
          <p className="mt-2 text-sm text-green-600">{t('admin.finance.calculated-success')}</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.finance.payout-history')}</h2>
        {payouts.isLoading ? (
          <CardListSkeleton count={4} />
        ) : payouts.isError ? (
          <ErrorAlert message={t('admin.finance.load-error')} onRetry={() => payouts.refetch()} />
        ) : !payouts.data || payouts.data.payouts.length === 0 ? (
          <EmptyState title={t('admin.finance.no-payouts')} />
        ) : (
          <div className="space-y-2">
            {payouts.data.payouts.map((p: PayoutItem) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800"
              >
                <span>{formatCurrency(Number(p.amount))}</span>
                <span className="text-sm text-text-secondary">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

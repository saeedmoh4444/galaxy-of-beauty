'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

export default function TechEarningsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const balanceQ = api.wallet.getBalance.useQuery();
  const payoutsQ = api.payouts.listMyPayouts.useQuery({ page: 1, limit: 20 });
  const earningsQ = api.analytics.technicianEarnings.useQuery({ days: 30 });

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const withdrawMut = api.wallet.withdraw.useMutation({
    onSuccess: () => {
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawMsg('');
      balanceQ.refetch();
      payoutsQ.refetch();
    },
    onError: (e) => setWithdrawMsg(e.message),
  });

  const bal = balanceQ.data as unknown as Record<string, unknown> | undefined;
  const earnings = earningsQ.data as unknown as Record<string, unknown> | undefined;
  const dailyEarnings = (earnings?.dailyEarnings as unknown as Record<string, unknown>[]) ?? [];
  const payoutsData = payoutsQ.data as unknown as Record<string, unknown> | undefined;
  const payoutItems = (payoutsData?.payouts as unknown as Record<string, unknown>[]) ?? [];

  const statusColours: Record<string, string> = {
    PENDING: 'bg-surface-muted text-text-secondary',
    PROCESSING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  const statusLabelKeys: Record<string, TranslationKey> = {
    PENDING: 'tech.earnings.status-pending',
    PROCESSING: 'tech.earnings.status-processing',
    COMPLETED: 'tech.earnings.status-completed',
    FAILED: 'tech.earnings.status-failed',
  };

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{t('tech.earnings.title')}</h1>

        {/* ── Balance Cards ── */}
        {balanceQ.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : balanceQ.isError ? (
          <ErrorAlert
            message={t('tech.earnings.balance-load-error')}
            onRetry={() => balanceQ.refetch()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <p className="text-sm text-text-secondary">{t('tech.earnings.total-balance')}</p>
              <p className="text-2xl font-bold text-brand-600">
                {formatCurrency(Number(bal?.totalBalance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">
                {t('tech.earnings.withdrawable-balance')}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(bal?.balance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-text-secondary">{t('tech.earnings.pending-balance')}</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(Number(bal?.bonusBalance ?? 0))}
              </p>
            </Card>
          </div>
        )}

        {/* Withdraw button */}
        {!balanceQ.isLoading && !balanceQ.isError && (
          <div className="flex justify-end">
            <Button onClick={() => setShowWithdraw(true)}>
              {t('tech.earnings.request-withdraw')}
            </Button>
          </div>
        )}

        {/* ── Earnings Chart (daily) ── */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t('tech.earnings.daily-earnings-title')}</h2>
          {earningsQ.isLoading ? (
            <CardSkeleton />
          ) : earningsQ.isError ? (
            <ErrorAlert
              message={t('tech.earnings.earnings-load-error')}
              onRetry={() => earningsQ.refetch()}
            />
          ) : dailyEarnings.length === 0 ? (
            <EmptyState title={t('tech.earnings.earnings-empty')} />
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm font-medium text-text-secondary dark:border-gray-700">
                <span>{t('tech.earnings.date')}</span>
                <span>{t('tech.earnings.earnings-header')}</span>
                <span>{t('tech.earnings.booking-count')}</span>
              </div>
              {dailyEarnings.slice(0, 30).map((day: Record<string, unknown>) => (
                <div
                  key={day.date as string}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <span className="text-text-primary dark:text-gray-300">{day.date as string}</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number(day.earnings ?? 0))}
                  </span>
                  <span className="text-text-secondary">{String(day.count ?? 0)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-edge pt-3 font-semibold dark:border-gray-700">
                <span>{t('tech.earnings.total')}</span>
                <span className="text-green-600">
                  {formatCurrency(Number(earnings?.totalEarnings ?? 0))}
                </span>
                <span>{String(earnings?.totalBookings ?? 0)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* ── Payout History ── */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t('tech.earnings.payout-history')}</h2>
          {payoutsQ.isLoading ? (
            <CardSkeleton />
          ) : payoutsQ.isError ? (
            <ErrorAlert
              message={t('tech.earnings.payouts-load-error')}
              onRetry={() => payoutsQ.refetch()}
            />
          ) : payoutItems.length === 0 ? (
            <EmptyState title={t('tech.earnings.payouts-empty')} />
          ) : (
            <div className="space-y-2">
              {payoutItems.map((p: Record<string, unknown>) => {
                const st = (p.status as string) ?? 'PENDING';
                return (
                  <Card key={p.id as number} padding="sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{formatCurrency(Number(p.amount ?? 0))}</p>
                        <p className="text-xs text-text-secondary">
                          {p.createdAt
                            ? new Date(p.createdAt as string).toLocaleDateString(
                                locale === 'en' ? 'en-GB' : 'ar-SA',
                              )
                            : '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.reference ? (
                          <span className="text-xs text-text-tertiary">
                            {t('tech.earnings.reference', { ref: p.reference as string })}
                          </span>
                        ) : null}
                        {p.periodStart ? (
                          <span className="text-xs text-text-tertiary">
                            {new Date(p.periodStart as string).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                            )}
                            {' - '}
                            {new Date(p.periodEnd as string).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                            )}
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColours[st]}`}
                        >
                          {t(statusLabelKeys[st] ?? (st as unknown as TranslationKey))}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Withdraw Modal ── */}
        <Modal
          open={showWithdraw}
          onClose={() => setShowWithdraw(false)}
          title={t('tech.earnings.request-withdraw')}
          size="sm"
        >
          <div className="space-y-4">
            {withdrawMsg && (
              <p className={`text-sm ${withdrawMut.isError ? 'text-red-600' : 'text-green-600'}`}>
                {withdrawMsg}
              </p>
            )}
            <Input
              label={t('tech.earnings.amount-label')}
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              hint={t('tech.earnings.min-hint')}
            />
            <Button
              className="w-full"
              onClick={() => {
                const a = Number(withdrawAmount);
                if (a < 100) {
                  setWithdrawMsg(t('tech.earnings.min-hint'));
                  return;
                }
                setWithdrawMsg('');
                withdrawMut.mutate({ amount: a, idempotencyKey: crypto.randomUUID() });
              }}
              loading={withdrawMut.isPending}
            >
              {t('tech.earnings.confirm-withdraw')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

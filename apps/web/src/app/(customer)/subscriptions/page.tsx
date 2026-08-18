'use client';

import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function SubscriptionsPage(): JSX.Element {
  const { t } = useLocale();
  const plansQ = api.subscriptions.getPlans.useQuery();
  const mySubQ = api.subscriptions.getMySubscription.useQuery();
  const purchaseMut = api.subscriptions.purchase.useMutation({ onSuccess: () => mySubQ.refetch() });
  const cancelMut = api.subscriptions.cancelAutoRenew.useMutation({
    onSuccess: () => mySubQ.refetch(),
  });

  const plans = (plansQ.data as unknown as Record<string, unknown>[]) ?? [];
  const mySub = mySubQ.data as unknown as Record<string, unknown> | null;
  const isLoading = plansQ.isLoading || mySubQ.isLoading;
  const isError = plansQ.isError || mySubQ.isError;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{t('subscriptions.title')}</h1>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : isError ? (
          <ErrorAlert
            message={t('subscriptions.err.load')}
            onRetry={() => {
              plansQ.refetch();
              mySubQ.refetch();
            }}
          />
        ) : plans.length === 0 ? (
          <div>
            <EmptyState
              title={t('subscriptions.empty.title')}
              description={t('subscriptions.empty.desc')}
            />
          </div>
        ) : (
          <>
            {mySub && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-brand-600 dark:text-brand-400">
                      {t('subscriptions.currentPlan')}
                    </p>
                    <p className="text-lg font-bold">{mySub.planName as string}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">{t('subscriptions.usageLabel')}</p>
                    <p className="font-semibold">
                      {(mySub.requestsUsed as number) ?? 0} / {(mySub.monthlyLimit as number) ?? 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">
                      {mySub.autoRenew ? t('subscriptions.autoRenew') : t('subscriptions.noRenew')}
                    </span>
                    {Boolean(mySub.autoRenew) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelMut.mutate()}
                        loading={cancelMut.isPending}
                      >
                        {t('subscriptions.cancelRenew')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all"
                    style={{
                      width: `${Math.min(100, (((mySub.requestsUsed as number) ?? 0) / ((mySub.monthlyLimit as number) ?? 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!mySub && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('subscriptions.noActive')}
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan: Record<string, unknown>) => {
                const planId = plan.id as number;
                const isCurrentPlan = mySub && (mySub.planId as number) === planId;
                return (
                  <Card
                    key={planId}
                    padding="lg"
                    className={`relative flex flex-col border-2 ${isCurrentPlan ? 'border-brand-500' : 'border-transparent'}`}
                  >
                    {isCurrentPlan && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-0.5 text-xs font-medium text-white">
                        {t('subscriptions.currentBadge')}
                      </span>
                    )}
                    <div className="mb-4 text-center">
                      <p className="text-lg font-bold">{plan.name as string}</p>
                      <p className="mt-1 text-3xl font-bold text-brand-600">
                        {formatCurrency(Number(plan.price ?? 0))}
                      </p>
                      <p className="text-xs text-text-secondary">{t('subscriptions.perMonth')}</p>
                    </div>
                    <ul className="mb-6 flex-1 space-y-2 text-sm">
                      {(plan.features as string[])?.map((f: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-text-secondary dark:text-gray-400"
                        >
                          <span className="text-green-500">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4 text-center">
                      <p className="text-sm text-text-secondary">
                        {t('subscriptions.usageLimit')}{' '}
                        <strong>
                          {(plan.monthlyLimit as number) ?? t('subscriptions.unlimited')}
                        </strong>{' '}
                        {t('subscriptions.requestsUnit')}
                      </p>
                    </div>
                    {!isCurrentPlan && (
                      <Button
                        className="w-full"
                        variant={plan.price === 0 ? 'outline' : 'primary'}
                        loading={purchaseMut.isPending}
                        onClick={() => purchaseMut.mutate({ planId })}
                      >
                        {plan.price === 0 ? t('subscriptions.free') : t('subscriptions.subscribe')}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  FormSkeleton,
  Button,
  Input,
  formatCurrency,
  PageContainer,
  PageTitle,
  BeautySavingsGoal,
  BeautyBudgetPlanner,
  LoyaltyDividendBadge,
  PriceAlertBadge,
  StudentDiscountBadge,
  LayawayBadge,
  BeautyBudgetCard,
  BeautySavingsMilestoneCard,
  TaxHelperCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function BeautyBudgetPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.beautyBudget.get.useQuery();
  const setBudgetMut = api.beautyBudget.set.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('beautyBudget.toastUpdated'));
    },
  });
  const [newBudget, setNewBudget] = useState('');
  // New financial components
  const savingsGoals = api.savingsGoals.list.useQuery();
  const budgetServices = api.services.list.useQuery({
    limit: 5,
    maxPrice: 100,
  });

  const budget = Number(data?.budget || 0);
  const spent = Number(data?.spent || 0);
  const remaining = Number(data?.remaining || 0);
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyBudget.title')} subtitle={t('beautyBudget.subtitle')} />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {isLoading ? (
              <FormSkeleton fields={4} />
            ) : isError ? (
              <ErrorAlert message={t('beautyBudget.loadError')} onRetry={() => refetch()} />
            ) : (
              <>
                <Card padding="lg" className="text-center">
                  <p className="text-sm text-text-secondary">{t('beautyBudget.monthlyBudget')}</p>
                  <p className="mt-1 text-4xl font-extrabold text-brand-600">
                    {formatCurrency(budget)}
                  </p>
                  <div className="mt-4 flex justify-around text-sm">
                    <div>
                      <p className="text-text-secondary">{t('beautyBudget.spent')}</p>
                      <p className="font-bold text-red-500">{formatCurrency(spent)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">{t('beautyBudget.remaining')}</p>
                      <p
                        className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {t('beautyBudget.percentOfBudget', { pct: pct.toFixed(0) })}
                  </p>
                </Card>
                <Card padding="md">
                  <h3 className="mb-3 font-semibold">{t('beautyBudget.updateBudget')}</h3>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder={t('beautyBudget.monthlyPlaceholder')}
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        const n = Number(newBudget);
                        if (n > 0) setBudgetMut.mutate({ budget: n });
                      }}
                      loading={setBudgetMut.isPending}
                    >
                      {t('beautyBudget.save')}
                    </Button>
                  </div>
                </Card>
              </>
            )}
            <BeautyBudgetPlanner monthlyIncome={budget > 0 ? budget * 10 : 5000} />
            <BeautyBudgetCard
              services={
                budgetServices?.data?.items?.slice(0, 4)?.map((s) => ({
                  name: localize(s.titleJson, locale) ?? '',
                  price: Number(s.basePrice),
                  category: 'facial' as const,
                  duration: t('beautyBudget.minutes', { min: s.durationMin }),
                })) ?? []
              }
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {savingsGoals?.data?.length ? (
              <BeautySavingsGoal
                goals={(savingsGoals.data as Array<Record<string, unknown>>)
                  .slice(0, 3)
                  .map((g) => ({
                    label: (g.name as string) ?? t('beautyBudget.goalFallback'),
                    target: (g.amount as number) ?? 0,
                    saved: (g.saved as number) ?? 0,
                    monthly: (g.monthly as number) ?? 0,
                  }))}
              />
            ) : null}
            <LoyaltyDividendBadge yearlySpend={spent * 12} />
            <div className="grid gap-4 sm:grid-cols-2">
              <StudentDiscountBadge discount={15} />
              <LayawayBadge totalPrice={600} installments={3} installmentAmount={200} />
            </div>
            <PriceAlertBadge
              serviceName={t('beautyBudget.spaManicure')}
              currentPrice={120}
              targetPrice={80}
            />
            <BeautySavingsMilestoneCard saved={spent} milestones={[500, 1000, 2000, 5000, 10000]} />
            <TaxHelperCard revenue={{ monthly: spent, vat: Math.round(spent * 0.15) }} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}

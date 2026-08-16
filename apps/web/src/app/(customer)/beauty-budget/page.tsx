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

export default function BeautyBudgetPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.beautyBudget.get.useQuery() as any;
  const setBudgetMut = api.beautyBudget.set.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تم تحديث الميزانية');
    },
  });
  const [newBudget, setNewBudget] = useState('');
  // New financial components
  const savingsGoals = (api as any).savingsGoals?.list?.useQuery?.() as any;
  const budgetServices = (api as any).services?.list?.useQuery?.({
    limit: 5,
    maxPrice: 100,
  }) as any;

  const budget = Number(data?.budget || 0);
  const spent = Number(data?.spent || 0);
  const remaining = Number(data?.remaining || 0);
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" ميزانية الجمال" subtitle="خططي لإنفاقكِ الجمالي بذكاء" />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {isLoading ? (
              <FormSkeleton fields={4} />
            ) : isError ? (
              <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
            ) : (
              <>
                <Card padding="lg" className="text-center">
                  <p className="text-sm text-text-secondary">الميزانية الشهرية</p>
                  <p className="mt-1 text-4xl font-extrabold text-brand-600">
                    {formatCurrency(budget)}
                  </p>
                  <div className="mt-4 flex justify-around text-sm">
                    <div>
                      <p className="text-text-secondary">تم الإنفاق</p>
                      <p className="font-bold text-red-500">{formatCurrency(spent)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">متبقي</p>
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
                  <p className="mt-1 text-xs text-text-tertiary">{pct.toFixed(0)}% من الميزانية</p>
                </Card>
                <Card padding="md">
                  <h3 className="mb-3 font-semibold">تحديث الميزانية</h3>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="الميزانية الشهرية (ر.س)"
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
                      حفظ
                    </Button>
                  </div>
                </Card>
              </>
            )}
            <BeautyBudgetPlanner monthlyIncome={budget > 0 ? budget * 10 : 5000} />
            <BeautyBudgetCard
              services={
                (budgetServices?.data?.items as any[])?.slice(0, 4)?.map((s: any) => ({
                  name: (s.titleJson as any)?.ar ?? '',
                  price: Number(s.basePrice),
                  category: 'facial' as const,
                  duration: `${s.durationMin} دقيقة`,
                })) ?? []
              }
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {savingsGoals?.data?.length > 0 && (
              <BeautySavingsGoal
                goals={(savingsGoals.data as any[]).slice(0, 3).map((g: any) => ({
                  label: g.name ?? 'هدف',
                  target: g.amount ?? 0,
                  saved: g.saved ?? 0,
                  monthly: g.monthly ?? 0,
                }))}
              />
            )}
            <LoyaltyDividendBadge yearlySpend={spent * 12} />
            <div className="grid gap-4 sm:grid-cols-2">
              <StudentDiscountBadge discount={15} />
              <LayawayBadge totalPrice={600} installments={3} installmentAmount={200} />
            </div>
            <PriceAlertBadge serviceName="مانيكير سبا" currentPrice={120} targetPrice={80} />
            <BeautySavingsMilestoneCard saved={spent} milestones={[500, 1000, 2000, 5000, 10000]} />
            <TaxHelperCard revenue={{ monthly: spent, vat: Math.round(spent * 0.15) }} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}

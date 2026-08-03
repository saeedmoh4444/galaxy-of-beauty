'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function BeautyBudgetPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.beautyBudget.get.useQuery() as any;
  const setBudgetMut = api.beautyBudget.set.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم تحديث الميزانية'); } });
  const [newBudget, setNewBudget] = useState('');

  const budget = Number(data?.budget || 0);
  const spent = Number(data?.spent || 0);
  const remaining = Number(data?.remaining || 0);
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">💰 ميزانية الجمال</h1>
        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
          <>
            <Card padding="lg" className="text-center">
              <p className="text-sm text-text-secondary">الميزانية الشهرية</p>
              <p className="mt-1 text-4xl font-extrabold text-brand-600">{formatCurrency(budget)}</p>
              <div className="mt-4 flex justify-around text-sm">
                <div><p className="text-text-secondary">تم الإنفاق</p><p className="font-bold text-red-500">{formatCurrency(spent)}</p></div>
                <div><p className="text-text-secondary">متبقي</p><p className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(remaining)}</p></div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">{pct.toFixed(0)}% من الميزانية</p>
            </Card>
            <Card padding="md">
              <h3 className="mb-3 font-semibold">تحديث الميزانية</h3>
              <div className="flex gap-3">
                <Input type="number" placeholder="الميزانية الشهرية (ر.س)" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
                <Button onClick={() => { const n = Number(newBudget); if (n > 0) setBudgetMut.mutate({ budget: n }); }} loading={setBudgetMut.isPending}>حفظ</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

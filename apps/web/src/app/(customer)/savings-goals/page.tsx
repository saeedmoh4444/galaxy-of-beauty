/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

export default function SavingsGoalsPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api as any).savingsGoals.list.useQuery() as any;
  const createMut = (api as any).savingsGoals.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAdd(false);
      addToast('success', 'تم إنشاء الهدف');
    },
  });
  const addFundsMut = (api as any).savingsGoals.addFunds.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تمت الإضافة');
    },
  });
  const deleteMut = (api as any).savingsGoals.delete.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', 'تم الحذف');
    },
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', targetAmount: '', serviceId: '' });
  const [addAmount, setAddAmount] = useState<Record<number, string>>({});

  const goals = (data ?? []) as Array<Record<string, any>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold"> أهداف الادخار</h1>
            <p className="text-sm text-text-secondary mt-1">ادخري لخدمات أحلامكِ وحققي أهدافكِ</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>هدف جديد</Button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        ) : goals.length === 0 ? (
          <EmptyState title="لا توجد أهداف" description="أنشئي هدف ادخار لخدمة تحلمين فيها" />
        ) : (
          <div className="space-y-4">
            {goals.map((g: Record<string, any>) => {
              const pct =
                g.targetAmount > 0
                  ? Math.min(100, (Number(g.savedAmount) / Number(g.targetAmount)) * 100)
                  : 0;
              return (
                <Card
                  key={g.id}
                  padding="lg"
                  className={g.status === 'COMPLETED' ? 'border-green-500' : ''}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
                        {g.title} {g.status === 'COMPLETED' && ''}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {formatCurrency(Number(g.savedAmount))} /{' '}
                        {formatCurrency(Number(g.targetAmount))}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${g.status === 'COMPLETED' ? 'text-green-600' : 'text-brand-600'}`}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-3 rounded-full transition-all ${g.status === 'COMPLETED' ? 'bg-green-500' : 'bg-brand-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {g.status === 'ACTIVE' && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="number"
                        placeholder="أضف مبلغ"
                        value={addAmount[g.id] || ''}
                        onChange={(e) => setAddAmount({ ...addAmount, [g.id]: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const a = Number(addAmount[g.id] || 0);
                          if (a > 0) {
                            addFundsMut.mutate({ goalId: g.id, amount: a });
                            setAddAmount({ ...addAmount, [g.id]: '' });
                          }
                        }}
                      >
                         أضف
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteMut.mutate({ id: g.id })}
                      >حذف</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {showAdd && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAdd(false);
            }}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowAdd(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-bold"> هدف ادخار جديد</h3>
              <div className="space-y-3">
                <Input
                  placeholder="اسم الهدف (مثال: باقة العناية)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="المبلغ المستهدف (ر.س)"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="معرف الخدمة (اختياري)"
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                />
                <Button
                  onClick={() =>
                    createMut.mutate({
                      title: form.title,
                      targetAmount: Number(form.targetAmount),
                      serviceId: form.serviceId ? Number(form.serviceId) : undefined,
                    })
                  }
                  loading={createMut.isPending}
                  className="w-full"
                >
                  إنشاء
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

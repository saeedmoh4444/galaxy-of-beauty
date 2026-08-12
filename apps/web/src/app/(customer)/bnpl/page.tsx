'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BNPLPage(): JSX.Element {
  const { data: providers } = api.bnpl.providers.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const { data: eligibility } = api.bnpl.eligibility.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const createMut = api.bnpl.createPlan.useMutation();
  const [amount, setAmount] = useState(500);
  const [provider, setProvider] = useState<'tabby' | 'tamara'>('tabby');
  const [inst, setInst] = useState(4);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const list = (providers ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> تقسيط المدفوعات</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ادفعيServices على أقساط مريحة بدون فوائد
          </p>
        </div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold">تمت الموافقة!</h2>
            <p className="text-2xl font-extrabold mt-2">
              {formatCurrency(result.totalAmount as number)} ر.س
            </p>
            <p className="text-sm text-text-secondary">
              {result.installments as number} دفعات شهرية بـ{' '}
              {formatCurrency(result.monthlyPayment as number)} ر.س
            </p>
            <div className="mt-3 space-y-1">
              {(result.schedule as Array<Record<string, unknown>>).map(
                (m: Record<string, unknown>, i: number) => (
                  <p key={i} className="text-xs text-text-secondary">
                    الدفعة {i + 1}: {formatCurrency(m.amount as number)} — {m.dueDate as string}
                  </p>
                ),
              )}
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setResult(null)}>
               إعادة
            </Button>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="flex gap-2 mb-4">
              {list.map((p: Record<string, unknown>) => (
                <button
                  key={p.key as string}
                  onClick={() => setProvider(p.key as 'tabby' | 'tamara')}
                  className={`flex-1 rounded-xl p-3 text-center ${provider === p.key ? 'bg-brand-100 dark:bg-brand-950 ring-2 ring-brand-300' : 'bg-surface-muted dark:bg-gray-800'}`}
                >
                  <span className="text-2xl">{p.emoji as string}</span>
                  <p className="font-bold text-sm mt-1">{p.nameAr as string}</p>
                  <p className="text-[10px] text-text-secondary">{p.description as string}</p>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm">المبلغ: {formatCurrency(amount)}</label>
                <input
                  type="range"
                  min={100}
                  max={(eligibility?.maxAmount as number) ?? 5000}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
              <div>
                <label className="text-sm">عدد الدفعات: {inst}</label>
                <input
                  type="range"
                  min={3}
                  max={4}
                  value={inst}
                  onChange={(e) => setInst(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
            <p className="text-sm text-center mt-3 font-bold">
              {formatCurrency(Math.round((amount / inst) * 100) / 100)} ر.س / شهرياً
            </p>
            <Button
              onClick={() =>
                createMut.mutate(
                  { amount, provider, installments: inst },
                  { onSuccess: (d) => setResult(d as Record<string, unknown>) },
                )
              }
              loading={createMut.isPending}
              className="w-full mt-3"
            >
              تقديم الطلب
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

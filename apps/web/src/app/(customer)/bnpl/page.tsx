'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BNPLPage(): JSX.Element {
  const { t } = useLocale();
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

  // E4b — persisted plans: list own plans and advance installments.
  const plansQ = api.bnpl.myPlans.useQuery();
  const markPaidMut = api.bnpl.markPaid.useMutation({ onSuccess: () => plansQ.refetch() });
  const plans = (plansQ.data ?? []) as Array<Record<string, any>>;

  const list = (providers ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('bnpl.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('bnpl.subtitle')}</p>
        </div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl">✅</span>
            <h2 className="mt-4 text-xl font-bold">{t('bnpl.approved')}</h2>
            <p className="text-2xl font-extrabold mt-2">
              {formatCurrency(result.totalAmount as number)} {t('beautyParty.currency')}
            </p>
            <p className="text-sm text-text-secondary">
              {t('bnpl.monthlyInstallments', { count: result.installments as number })}{' '}
              {formatCurrency(result.monthlyPayment as number)} {t('beautyParty.currency')}
            </p>
            <div className="mt-3 space-y-1">
              {(result.schedule as Array<Record<string, unknown>>).map(
                (m: Record<string, unknown>, i: number) => (
                  <p key={i} className="text-xs text-text-secondary">
                    {t('bnpl.installment', { n: i + 1 })}: {formatCurrency(m.amount as number)} —{' '}
                    {m.dueDate as string}
                  </p>
                ),
              )}
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setResult(null)}>
              {t('bnpl.restart')}
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
                <label className="text-sm">
                  {t('bnpl.amount', { amount: formatCurrency(amount) })}
                </label>
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
                <label className="text-sm">{t('bnpl.installmentsCount', { count: inst })}</label>
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
              {t('bnpl.monthlyRate', {
                amount: formatCurrency(Math.round((amount / inst) * 100) / 100),
              })}
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
              {t('bnpl.submit')}
            </Button>
          </Card>
        )}

        {/* E4b — persisted installment plans */}
        {plans.length > 0 && (
          <Card padding="lg">
            <h2 className="font-bold mb-3">{t('bnpl.myPlans')}</h2>
            <div className="space-y-4">
              {plans.map((p) => (
                <div key={p.id} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">
                      {p.provider === 'tabby' ? 'Tabby' : 'Tamara'} ·{' '}
                      {t(('bnpl.status.' + p.status) as any)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {t('bnpl.paidOf', { paid: p.paidCount, total: p.installments })}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatCurrency(Number(p.totalAmount))} {t('beautyParty.currency')} ·{' '}
                    {formatCurrency(Number(p.monthlyPayment))} × {p.installments}
                  </p>
                  {p.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      loading={markPaidMut.isPending}
                      onClick={() => markPaidMut.mutate({ planId: p.id })}
                    >
                      {t('bnpl.markPaid')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

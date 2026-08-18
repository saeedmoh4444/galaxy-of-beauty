'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import {
  Card,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@galaxy/ui';
import type { TranslationKey } from '@galaxy/shared';

const OCCASIONS: Record<string, { label: TranslationKey; emoji: string }> = {
  wedding: { label: 'giftRegistry.occasion.wedding', emoji: '' },
  birthday: { label: 'giftRegistry.occasion.birthday', emoji: '' },
  baby_shower: { label: 'giftRegistry.occasion.babyShower', emoji: '' },
  other: { label: 'giftRegistry.occasion.other', emoji: '' },
};

type RegistryItem = RouterOutputs['giftRegistry']['myRegistries'][number] & {
  targetAmount: number;
  raisedAmount: number;
};

export default function GiftRegistryPage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.giftRegistry.myRegistries.useQuery();
  const createMut = api.giftRegistry.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAdd(false);
      addToast('success', t('giftRegistry.toast.created'));
    },
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    occasion: 'wedding',
    targetAmount: '',
    serviceIds: '',
    message: '',
  });

  const registries = (data ?? []) as RegistryItem[];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('giftRegistry.title')}</h1>
          <Button onClick={() => setShowAdd(true)}>{t('giftRegistry.createRegistry')}</Button>
        </div>
        <p className="text-sm text-text-secondary">{t('giftRegistry.subtitle')}</p>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('giftRegistry.err.load')} onRetry={() => refetch()} />
        ) : registries.length === 0 ? (
          <EmptyState
            title={t('giftRegistry.empty.title')}
            description={t('giftRegistry.empty.desc')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {registries.map((r) => {
              const pct =
                r.targetAmount > 0
                  ? Math.min(100, (Number(r.raisedAmount) / Number(r.targetAmount)) * 100)
                  : 0;
              const occasion = OCCASIONS[r.occasion];
              return (
                <Card key={r.id} padding="lg">
                  <div className="text-center">
                    <p className="text-3xl">{occasion?.emoji || ''}</p>
                    <h3 className="mt-2 text-lg font-bold">{r.title}</h3>
                    <p className="text-xs text-text-secondary">
                      {occasion ? t(occasion.label) : r.occasion}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span>{t('giftRegistry.raised')}</span>
                      <span className="font-bold text-brand-600">
                        {formatCurrency(Number(r.raisedAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>{t('giftRegistry.target')}</span>
                      <span>{formatCurrency(Number(r.targetAmount))}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-brand-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-center text-xs text-text-tertiary">{pct.toFixed(0)}%</p>
                  </div>
                  {r.message && (
                    <p className="mt-3 text-center text-sm italic text-text-secondary">
                      &ldquo;{r.message}&rdquo;
                    </p>
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
              <h3 className="mb-4 text-lg font-bold">{t('giftRegistry.modal.title')}</h3>
              <div className="space-y-3">
                <Input
                  placeholder={t('giftRegistry.placeholder.title')}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <select
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="wedding">{t('giftRegistry.occasion.wedding')}</option>
                  <option value="birthday">{t('giftRegistry.occasion.birthday')}</option>
                  <option value="baby_shower">{t('giftRegistry.occasion.babyShower')}</option>
                  <option value="other">{t('giftRegistry.occasion.other')}</option>
                </select>
                <Input
                  type="number"
                  placeholder={t('giftRegistry.placeholder.target')}
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                />
                <Input
                  placeholder={t('giftRegistry.placeholder.serviceIds')}
                  value={form.serviceIds}
                  onChange={(e) => setForm({ ...form, serviceIds: e.target.value })}
                />
                <Input
                  placeholder={t('giftRegistry.placeholder.message')}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <Button
                  onClick={() =>
                    createMut.mutate({
                      title: form.title,
                      occasion: form.occasion as 'wedding' | 'birthday' | 'baby_shower' | 'other',
                      targetAmount: Number(form.targetAmount),
                      serviceIds: form.serviceIds
                        .split(',')
                        .map(Number)
                        .filter((n) => n > 0),
                      message: form.message || undefined,
                    })
                  }
                  loading={createMut.isPending}
                  className="w-full"
                >
                  {t('giftRegistry.create')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

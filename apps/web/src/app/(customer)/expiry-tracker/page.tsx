'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function ExpiryTrackerPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: cats } = api.expiryTracker.categories.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const {
    data: items,
    isLoading,
    isError,
    refetch,
  } = api.expiryTracker.myItems.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const addMut = api.expiryTracker.add.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      refetch();
    },
  });
  const deleteMut = api.expiryTracker.delete.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('mascara');
  const categories = (cats ?? []) as Array<Record<string, unknown>>;
  const myItems = (items ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('expiryTracker.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('expiryTracker.subtitle')}</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>{t('expiryTracker.addProduct')}</Button>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('expiryTracker.err.load')} onRetry={() => refetch()} />
        ) : myItems.length === 0 ? (
          <EmptyState
            title={t('expiryTracker.empty.title')}
            description={t('expiryTracker.empty.desc')}
            action={{ label: t('expiryTracker.empty.action'), onPress: () => setShowAdd(true) }}
          />
        ) : (
          <div className="space-y-3">
            {myItems.map((i: Record<string, unknown>) => (
              <Card
                key={i.id as number}
                padding="md"
                className={
                  (i.expired as boolean)
                    ? 'border-2 border-red-300 dark:border-red-700 opacity-70'
                    : (i.isClose as boolean)
                      ? 'border-2 border-amber-300 dark:border-amber-700'
                      : ''
                }
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{i.emoji as string}</span>
                  <div className="flex-1">
                    <h3 className="font-bold">{i.productName as string}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('expiryTracker.openInfo', {
                        date: new Date(i.openDate as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                        ),
                        months: i.expiryMonths as number,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {(i.expired as boolean) ? (
                      <span className="rounded-full bg-red-100 dark:bg-red-900 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        {t('expiryTracker.expired')}
                      </span>
                    ) : (i.isClose as boolean) ? (
                      <span className="rounded-full bg-amber-100 dark:bg-amber-900 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        {t('expiryTracker.daysLeft', { days: i.daysLeft as number })}
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 font-bold">
                        {t('expiryTracker.daysLeft', { days: i.daysLeft as number })}
                      </span>
                    )}
                    <button
                      onClick={() => deleteMut.mutate({ id: i.id as number })}
                      className="block mt-1 text-xs text-red-400"
                    >
                      ️
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          title={t('expiryTracker.modal.title')}
        >
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('expiryTracker.namePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {categories.map((c: Record<string, unknown>) => (
                <option key={c.key as string} value={c.key as string}>
                  {c.emoji as string} {c.nameAr as string} ({c.months as number}{' '}
                  {t('expiryTracker.monthUnit')})
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                if (name.trim()) addMut.mutate({ productName: name.trim(), category: cat });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              {t('expiryTracker.add')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

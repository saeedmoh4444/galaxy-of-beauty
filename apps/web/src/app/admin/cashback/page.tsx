'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminCashbackPage(): JSX.Element {
  const { t } = useLocale();
  const [rate, setRate] = useState(5);
  const setRateMut = api.cashback.setRate.useMutation();

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.cashback.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.cashback.subtitle')}</p>
        </div>

        <Card padding="lg" className="text-center">
          <p className="text-6xl mb-4"></p>
          <p className="text-sm text-text-secondary">{t('admin.cashback.current-rate')}</p>
          <p className="text-4xl font-extrabold text-brand-600 mt-2">{rate}%</p>
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.cashback.edit-rate')}</h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min={1}
              max={20}
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button onClick={() => setRateMut.mutate({ rate })} loading={setRateMut.isPending}>
              {t('button.save')}
            </Button>
          </div>
          <p className="text-xs text-text-tertiary mt-2">{t('admin.cashback.range-hint')}</p>
        </Card>
      </div>
    </>
  );
}

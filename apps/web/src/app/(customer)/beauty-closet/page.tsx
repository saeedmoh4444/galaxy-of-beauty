'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

const CATS = ['skincare', 'makeup', 'hair', 'nails', 'natural'];

export default function BeautyClosetPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.beautyCloset.myProducts.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const addMut = api.beautyCloset.addProduct.useMutation();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('skincare');
  const products = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('beautyCloset.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('beautyCloset.subtitle')}</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>{t('beautyCloset.addProduct')}</Button>
        </div>
        {isLoading ? (
          <GridSkeleton count={8} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {products.map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="md" className="text-center">
                <span className="text-4xl">{p.emoji as string}</span>
                <h3 className="font-bold mt-2">{p.name as string}</h3>
                <div className="mt-2 h-2 bg-surface-muted rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${(p.usagePct as number) ?? 100}%` }}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  {t('beautyCloset.usageLeft', { pct: (p.usagePct as number) ?? 100 })}
                </p>
              </Card>
            ))}
          </div>
        )}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('beautyCloset.addTitle')}>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('beautyCloset.productNamePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                if (name.trim())
                  addMut.mutate(
                    { name: name.trim(), category: cat },
                    {
                      onSuccess: () => {
                        setShowAdd(false);
                        setName('');
                      },
                    },
                  );
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              {t('beautyCloset.add')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

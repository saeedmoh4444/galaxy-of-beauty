'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function VendorPortalPage(): JSX.Element {
  const { t } = useLocale();
  const { data: dash } = api.vendorPortal.dashboard.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const { data: products, refetch } = api.vendorPortal.myProducts.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addMut = api.vendorPortal.addProduct.useMutation({
    onSuccess: () => {
      setShow(false);
      refetch();
    },
  });
  const deleteMut = api.vendorPortal.deleteProduct.useMutation({ onSuccess: () => refetch() });

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  const prods = products ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorPortal.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.subtitle')}</p>
          </div>
          <Button onClick={() => setShow(true)}>+ {t('vendorPortal.newProduct')}</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{(dash?.totalProducts as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.products')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{(dash?.totalSales as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.sold')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{formatCurrency((dash?.revenue as number) ?? 0)}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.revenue')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{(dash?.rating as number) ?? 4.8}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.rating')}</p>
          </Card>
        </div>

        <div className="space-y-3">
          {prods.map((p: Record<string, unknown>) => (
            <Card key={p.id as number} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji as string}</span>
                <div>
                  <p className="font-bold">{p.nameAr as string}</p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.stock')}: {p.stock as number} · {t('vendorPortal.sales')}:{' '}
                    {p.sales as number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-600">
                  {formatCurrency(p.price as number)} {t('beautyParty.currency')}
                </span>
                <button
                  onClick={() => deleteMut.mutate({ id: p.id as number })}
                  className="text-red-400"
                >
                  ️
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Modal open={show} onClose={() => setShow(false)} title={t('vendorPortal.addProductTitle')}>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('vendorPortal.productNamePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.pricePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.stockPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (name.trim() && price > 0) addMut.mutate({ nameAr: name.trim(), price, stock });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              {t('vendorPortal.add')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

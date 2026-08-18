'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function LastMilePage(): JSX.Element {
  const { t } = useLocale();
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = api.lastMileDelivery.products.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const orderMut = api.lastMileDelivery.order.useMutation();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <CardListSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <ErrorAlert message={t('lastMile.loadError')} onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const prods = (products ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('lastMile.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('lastMile.subtitle')}</p>
        </div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold">{t('lastMile.orderPlaced')}</h2>
            <p className="font-bold mt-1">{result.product as string}</p>
            <p className="text-sm text-text-secondary">
              {result.estimatedDelivery as string} · {formatCurrency(result.total as number)}{' '}
              {t('beautyParty.currency')}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {prods.map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="md" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji as string}</span>
                  <div>
                    <p className="font-bold">{p.nameAr as string}</p>
                    <p className="text-xs text-text-secondary">️ {p.deliveryTime as string}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-600">
                    {formatCurrency(p.price as number)} {t('beautyParty.currency')}
                  </p>
                  <Button
                    size="sm"
                    onClick={() =>
                      orderMut.mutate(
                        { productId: p.id as number, address: 'الرياض', paymentMethod: 'wallet' },
                        { onSuccess: (d) => setResult(d as Record<string, unknown>) },
                      )
                    }
                  >
                    {t('lastMile.order')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

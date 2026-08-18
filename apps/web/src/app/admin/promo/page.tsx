'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminPromoPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.promo.list.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.promo.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.promo.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : !(data ?? []).length ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2">️</p>
            <p className="text-text-secondary">{t('admin.promo.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold font-mono">{p.code as string}</p>
                    <p className="text-xs text-text-secondary">{(p.description as string) ?? ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {p.discountType === 'percent'
                        ? `${p.discountValue as number}%`
                        : formatCurrency(p.discountValue as number)}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-surface-muted'}`}
                    >
                      {p.isActive ? t('status.active') : t('admin.promo.expired')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

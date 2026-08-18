'use client';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminSubscriptionsPage(): JSX.Element {
  const { t } = useLocale();
  const { data: plans, isLoading } = api.subscriptions.getPlans.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.subscriptions.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.subscriptions.subtitle')}</p>
        </div>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : !(plans ?? []).length ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('admin.subscriptions.empty')}</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {(plans ?? []).map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="lg" className="text-center">
                <span className="text-4xl"></span>
                <h3 className="font-bold mt-3">{(p.nameJson as Record<string, string>)?.ar}</h3>
                <p className="text-xs text-text-secondary mt-1">{p.feature as string}</p>
                <p className="text-2xl font-extrabold mt-3">
                  {formatCurrency(Number(p.priceMonthly ?? 0))}
                  <span className="text-sm font-normal text-text-secondary">
                    {t('admin.subscriptions.per-month')}
                  </span>
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {t('admin.subscriptions.monthly-limit', { count: p.monthlyLimit as number })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

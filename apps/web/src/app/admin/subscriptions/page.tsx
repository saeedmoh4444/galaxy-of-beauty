'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminSubscriptionsPage(): JSX.Element {
  const { data: plans, isLoading } = api.subscriptions.getPlans.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> خطط الاشتراكات</h1>
          <p className="mt-1 text-sm text-text-secondary">إدارة خطط وباقات الاشتراك</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !(plans ?? []).length ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">لا توجد خطط اشتراك</p>
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
                  <span className="text-sm font-normal text-text-secondary">/شهرياً</span>
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {p.monthlyLimit as number} طلب شهرياً
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

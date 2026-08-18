'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminGroupBookingsPage(): JSX.Element {
  const { t } = useLocale();
  const { data: groupData, isLoading } = api.groupBookings.listAll.useQuery({
    page: 1,
    limit: 20,
  }) as { data: Record<string, unknown> | undefined; isLoading: boolean };
  const groups = (groupData?.items as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.group-bookings.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.group-bookings.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : groups.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('admin.group-bookings.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {groups.map((g: Record<string, unknown>) => (
              <Card key={g.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{g.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {(g.theme as string) ?? ''} ·{' '}
                      {t('admin.group-bookings.members', {
                        count:
                          (g.memberCount as number) ??
                          (g._count as Record<string, number>)?.members ??
                          0,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">
                      {formatCurrency(Number(g.totalAmount ?? 0))}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${g.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {g.status as string}
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

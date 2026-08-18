'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function InvoicesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: bookingsData, isLoading } = api.bookings.list.useQuery({ page: 1, limit: 50 }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const bookings = (bookingsData?.bookings as Array<Record<string, unknown>>) ?? [];
  const completed = bookings.filter((b: Record<string, unknown>) => b.status === 'COMPLETED');
  const totalSpent = completed.reduce(
    (s: number, b: Record<string, unknown>) => s + (Number(b.totalAmount) || 0),
    0,
  );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('invoices.subtitle')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card padding="lg" className="text-center">
            <p className="text-2xl font-extrabold">{completed.length}</p>
            <p className="text-xs text-text-secondary">{t('invoices.paidCount')}</p>
          </Card>
          <Card padding="lg" className="text-center">
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-text-secondary">{t('invoices.totalSpent')}</p>
          </Card>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : completed.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('invoices.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {completed.map((b: Record<string, unknown>) => {
              const service = b.service as Record<string, unknown> | undefined;
              const slot = (b.slot as Record<string, unknown>) ?? (b as Record<string, unknown>);
              return (
                <Card key={b.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">
                        {localize(service?.titleJson, locale) ||
                          t('invoices.bookingFallback', { id: String(b.id) })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date((slot?.startAt ?? b.createdAt) as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                          { day: 'numeric', month: 'long', year: 'numeric' },
                        )}{' '}
                        · {b.bookingCode as string}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(Number(b.totalAmount) || 0)}
                      </p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        {t('invoices.paidBadge')}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

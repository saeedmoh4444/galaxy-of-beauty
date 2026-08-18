'use client';

import { api } from '@/lib/trpc';
import Link from 'next/link';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function ServiceHistoryPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({ limit: 50 });
  const bookings = data?.bookings ?? [];

  // Group by service for reorder suggestions
  const serviceCounts: Record<
    number,
    { count: number; lastDate: Date; title: string; price: number }
  > = {};
  bookings
    .filter((b) => b.status === 'COMPLETED')
    .forEach((b) => {
      const sid = b.serviceId;
      if (!serviceCounts[sid]) {
        serviceCounts[sid] = {
          count: 0,
          lastDate: b.createdAt,
          title:
            localize(b.service?.titleJson, locale) ||
            t('serviceHistory.serviceFallback', { id: sid }),
          price: Number(b.totalAmount),
        };
      }
      serviceCounts[sid]!.count++;
      if (b.createdAt > serviceCounts[sid]!.lastDate) serviceCounts[sid]!.lastDate = b.createdAt;
    });

  const favorites = Object.entries(serviceCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const recentBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('serviceHistory.title')}
        </h1>

        {/* Favorite Services — Reorder */}
        {favorites.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t('serviceHistory.favoritesTitle')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map(([sid, info]) => (
                <Card key={sid} padding="md" hover>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{info.title}</p>
                      <p className="text-xs text-text-secondary">
                        {t('serviceHistory.favoriteInfo', {
                          count: info.count,
                          date: new Date(info.lastDate).toLocaleDateString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                          ),
                        })}
                      </p>
                    </div>
                    <Link href={`/bookings/create?serviceId=${sid}`}>
                      <Button size="sm">{t('serviceHistory.rebook')}</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t('serviceHistory.recentTitle')}</h2>
          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : isError ? (
            <ErrorAlert message={t('serviceHistory.err.load')} onRetry={() => refetch()} />
          ) : recentBookings.length === 0 ? (
            <EmptyState title={t('serviceHistory.empty')} />
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 15).map((b, i) => (
                <Card key={b.id || i} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${b.status === 'COMPLETED' ? 'bg-green-500' : b.status === 'CANCELLED' ? 'bg-red-500' : 'bg-brand-500'}`}
                      />
                      <div>
                        <p className="font-semibold text-sm">{b.bookingCode || `#${b.id}`}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(b.createdAt).toLocaleDateString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-600">
                        {formatCurrency(Number(b.totalAmount || 0))}
                      </span>
                      {b.status === 'COMPLETED' && (
                        <Link href={`/bookings/create?serviceId=${b.serviceId}`}>
                          <Button size="sm" variant="outline">
                            {t('serviceHistory.bookingAgain')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { bookingStatusLabelKey } from '@/lib/bookingStatus';

export default function VideoPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: bookingsData, isLoading } = api.bookings.list.useQuery({ page: 1, limit: 20 }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const bookings = (bookingsData?.bookings as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('video.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('video.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : bookings.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('video.noBookings')}</p>
            <Link href="/bookings/create">
              <Button className="mt-4">{t('video.bookNow')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Record<string, unknown>) => (
              <Card key={b.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl"></span>
                    <div>
                      <p className="font-bold">
                        {t('video.bookingLabel')} #{b.id as number}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(b.createdAt as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                        )}{' '}
                        · {t(bookingStatusLabelKey(b.status as string))}
                      </p>
                    </div>
                  </div>
                  <Link href={`/video/${b.id}`}>
                    <Button size="sm">{t('video.enter')}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

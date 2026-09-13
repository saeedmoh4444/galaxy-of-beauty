'use client';

import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function LoyaltyPunchCardPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = api.loyaltyPunchCard.myCard.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const stamps = (data?.stamps as number) ?? 0;
  const total = (data?.total as number) ?? 10;
  const free = data?.earnedFree as boolean;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('loyaltyPunchCard.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('loyaltyPunchCard.subtitle')}</p>
        </div>

        {isLoading ? (
          <GridSkeleton count={10} />
        ) : isError ? (
          <ErrorAlert message={t('loyaltyPunchCard.loadError')} onRetry={() => refetch()} />
        ) : (
          <Card padding="lg" className="text-center">
            <span className="text-6xl">{free ? '' : ''}</span>
            <h2 className="mt-4 text-xl font-bold">
              {free
                ? t('loyaltyPunchCard.freeSession')
                : ((data?.message as string) ??
                  t('loyaltyPunchCard.remaining', { count: total - stamps }))}
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all ${i < stamps ? 'bg-brand-100 dark:bg-brand-900 ring-2 ring-brand-500 scale-110 shadow-lg' : 'bg-surface-muted dark:bg-gray-800 opacity-50'}`}
                >
                  {i < stamps ? '' : '○'}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/bookings/create">
                <Button size="lg">
                  {free ? t('loyaltyPunchCard.bookFree') : t('loyaltyPunchCard.bookNow')}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

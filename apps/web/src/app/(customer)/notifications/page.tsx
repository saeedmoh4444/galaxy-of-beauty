'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

const TYPE_ICONS: Record<string, string> = {
  BOOKING: '',
  PAYMENT: '',
  REWARD: '',
  PROMO: '',
  SYSTEM: '',
};

export default function NotificationsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = api.notifications.list.useQuery({
    page,
    limit: 20,
  });
  const markReadMut = api.notifications.markRead.useMutation({ onSuccess: () => refetch() });
  const markAllReadMut = api.notifications.markAllRead.useMutation({ onSuccess: () => refetch() });

  const items = (data?.items as unknown as Record<string, unknown>[]) ?? [];
  const totalPages = (data?.totalPages as number) ?? 1;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('profile.notifications-title')}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMut.mutate({})}
            loading={markAllReadMut.isPending}
          >
            {t('profile.mark-all-read')}
          </Button>
        </div>

        {isLoading ? (
          <CardListSkeleton count={5} />
        ) : isError ? (
          <ErrorAlert message={t('profile.notifications-error')} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <div>
            <EmptyState
              title={t('profile.no-notifications')}
              description={t('profile.no-notifications-desc')}
            />
            <div className="text-center">
              <Link href="/services">
                <Button>{t('booking.browse-services')}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((n: Record<string, unknown>) => {
                const titleJson = n.titleJson as Record<string, string>;
                const bodyJson = n.bodyJson as Record<string, string>;
                const isRead = n.isRead as boolean;
                return (
                  <Card
                    key={n.id as number}
                    padding="md"
                    hover
                    className={
                      isRead
                        ? ''
                        : 'border-r-4 border-r-brand-500 bg-brand-50/30 dark:bg-brand-950/20'
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-xl">{TYPE_ICONS[n.type as string] ?? ''}</span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${isRead ? 'text-text-secondary dark:text-gray-400' : 'font-semibold text-text-primary dark:text-gray-100'}`}
                        >
                          {localize(titleJson, locale)}
                        </p>
                        <p
                          className={`mt-0.5 text-xs ${isRead ? 'text-text-tertiary' : 'text-text-secondary'}`}
                        >
                          {localize(bodyJson, locale)}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {new Date(n.createdAt as string).toLocaleDateString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
                      </div>
                      {!isRead && (
                        <button
                          onClick={() => markReadMut.mutate({ id: n.id as number })}
                          className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300"
                        >
                          {t('profile.mark-read')}
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t('booking.previous')}
                </Button>
                <span className="text-sm text-text-secondary">
                  {t('profile.page-of', { page, totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('button.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

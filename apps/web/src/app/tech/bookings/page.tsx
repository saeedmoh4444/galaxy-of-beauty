'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const STATUS_TABS = [
  'ALL',
  'REQUESTED',
  'ACCEPTED',
  'PAID',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

const statusLabelKey = (s: string): TranslationKey =>
  s === 'ALL' ? 'booking.all' : (`booking.status.${s}` as TranslationKey);

export default function TechBookingsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({
    status,
    page: 1,
    limit: 20,
  });
  const transition = api.bookings.transition.useMutation({ onSuccess: () => refetch() });

  const bookings = (data?.bookings as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{t('tech.bookings.title')}</h1>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s === 'ALL' ? undefined : s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${(s === 'ALL' && !status) || s === status ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}
            >
              {t(statusLabelKey(s))}
            </button>
          ))}
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message={t('tech.bookings.load-error')} onRetry={() => refetch()} />
        ) : bookings.length === 0 ? (
          <EmptyState title={t('tech.bookings.empty')} />
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Record<string, unknown>) => (
              <Card key={b.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.bookingCode as string}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(b.startAt as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}
                  >
                    {t(statusLabelKey(b.status as string))}
                  </span>
                  <div className="flex gap-1">
                    {b.status === 'REQUESTED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            transition.mutate({ id: b.id as number, action: 'accept' })
                          }
                        >
                          {t('tech.bookings.accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            transition.mutate({ id: b.id as number, action: 'reject' })
                          }
                        >
                          {t('tech.bookings.reject')}
                        </Button>
                      </>
                    )}
                    {b.status === 'ACCEPTED' && (
                      <Button
                        size="sm"
                        onClick={() => transition.mutate({ id: b.id as number, action: 'start' })}
                      >
                        {t('tech.bookings.start')}
                      </Button>
                    )}
                    {b.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          transition.mutate({ id: b.id as number, action: 'complete' })
                        }
                      >
                        {t('tech.bookings.complete')}
                      </Button>
                    )}
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

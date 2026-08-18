'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function TechCalendarPage(): JSX.Element {
  const { t } = useLocale();
  const status = api.calendar.status.useQuery();
  const connectMut = api.calendar.connect.useMutation({ onSuccess: () => status.refetch() });
  const disconnectMut = api.calendar.disconnect.useMutation({ onSuccess: () => status.refetch() });
  const syncMut = api.calendar.sync.useMutation({ onSuccess: () => status.refetch() });

  const st = status.data as unknown as Record<string, unknown> | undefined;

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t('tech.calendar.title')}</h1>

        {status.isLoading ? (
          <CardSkeleton />
        ) : status.isError ? (
          <ErrorAlert message={t('tech.calendar.load-error')} onRetry={() => status.refetch()} />
        ) : st?.connected ? (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl dark:bg-green-900"></div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    {t('tech.calendar.connected')}
                  </p>
                  <p className="text-sm text-text-secondary">{st.email as string}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                {t('tech.calendar.connected-desc')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => syncMut.mutate()}
                  loading={syncMut.isPending}
                >
                  {t('tech.calendar.sync-now')}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => disconnectMut.mutate()}
                  loading={disconnectMut.isPending}
                >
                  {t('tech.calendar.disconnect')}
                </Button>
              </div>
              {syncMut.isSuccess && (
                <p className="text-sm text-green-600">{syncMut.data?.message as string}</p>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-3xl dark:bg-gray-800"></div>
              <h2 className="text-lg font-semibold">{t('tech.calendar.connect-title')}</h2>
              <p className="text-sm text-text-secondary">{t('tech.calendar.connect-desc')}</p>
              <Button
                onClick={() => connectMut.mutate({ authCode: 'stub-auth-code' })}
                loading={connectMut.isPending}
              >
                {t('tech.calendar.connect-button')}
              </Button>
              {connectMut.isSuccess && (
                <p className="text-sm text-green-600">{connectMut.data?.message as string}</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

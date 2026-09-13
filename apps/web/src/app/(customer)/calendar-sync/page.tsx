'use client';
import { useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function CalendarSyncPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { data: status, refetch } = api.calendarSync.status.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Record<string, unknown> | undefined;
    refetch: () => void;
  };
  const { data: upcoming, refetch: refetchUpcoming } = api.calendarSync.upcoming.useQuery(
    undefined,
    { enabled: isAuthenticated },
  ) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const connectMut = api.calendarSync.connect.useMutation({ onSuccess: () => refetch() });
  const disconnectMut = api.calendarSync.disconnect.useMutation({ onSuccess: () => refetch() });
  // E9 — real OAuth flow + cycle-event sync.
  const authUrlQ = api.calendarSync.authUrl.useQuery(
    {},
    { enabled: isAuthenticated, refetchOnWindowFocus: false },
  );
  const syncMut = api.calendarSync.syncCycleEvents.useMutation();
  // Booking auto-sync (E9 follow-up) — backfill push + per-run count.
  const bookingsSyncMut = api.calendarSync.syncBookings.useMutation({
    onSuccess: () => refetchUpcoming(),
  });

  // E9 — handle the OAuth redirect (code query param → connect).
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      connectMut.mutate(
        { authCode: code },
        {
          onSuccess: () => {
            window.history.replaceState({}, '', '/calendar-sync');
            refetch();
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connected = status?.connected as boolean;
  const events = upcoming ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('calendarSync.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('calendarSync.subtitle')}</p>
        </div>
        <Card padding="lg" className="text-center">
          <span className="text-6xl">{connected ? '📅' : '🔗'}</span>
          <h2 className="mt-4 text-xl font-bold">
            {connected ? t('calendarSync.connected') : t('calendarSync.notConnected')}
          </h2>
          {connected && (
            <p className="text-sm text-text-secondary mt-1">
              {t('calendarSync.lastSynced')}{' '}
              {status?.lastSynced
                ? new Date(status.lastSynced as string).toLocaleTimeString(
                    locale === 'en' ? 'en-GB' : 'ar-SA',
                  )
                : '—'}
            </p>
          )}
          <div className="mt-4">
            {connected ? (
              <div className="flex flex-col items-center gap-2">
                <Button onClick={() => syncMut.mutate()} loading={syncMut.isPending}>
                  🩸 {t('calendarSync.syncPeriods')}
                </Button>
                {syncMut.data && (
                  <p className="text-xs text-text-secondary">
                    {t('calendarSync.synced', { n: syncMut.data.synced as number })}
                  </p>
                )}
                <Button
                  onClick={() => disconnectMut.mutate()}
                  loading={disconnectMut.isPending}
                  variant="ghost"
                >
                  {t('calendarSync.disconnect')}
                </Button>
              </div>
            ) : (
              <Button
                onClick={async () => {
                  const url = await authUrlQ.refetch();
                  const target = url.data as string | null;
                  if (target) {
                    window.location.href = target;
                  } else {
                    connectMut.mutate({ authCode: 'missing-config' });
                  }
                }}
                loading={connectMut.isPending}
              >
                {t('calendarSync.connect')}
              </Button>
            )}
            {!status?.configured && (
              <p className="mt-2 text-xs text-amber-600">{t('calendarSync.notConfigured')}</p>
            )}
          </div>
        </Card>
        {events.length > 0 && (
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t('calendarSync.upcoming')}</h3>
              {connected && (
                <div className="flex items-center gap-2">
                  {bookingsSyncMut.data && (
                    <p className="text-xs text-text-secondary">
                      {t('calendarSync.syncedBookings', {
                        n: bookingsSyncMut.data.synced as number,
                      })}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bookingsSyncMut.mutate()}
                    loading={bookingsSyncMut.isPending}
                  >
                    📅 {t('calendarSync.syncBookings')}
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {events.map((e: Record<string, unknown>) => (
                <div
                  key={e.id as number}
                  className="flex items-center gap-3 rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                >
                  <span className="text-2xl">{e.emoji as string}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{e.title as string}</p>
                    <p className="text-xs text-text-secondary"> {e.technician as string}</p>
                  </div>
                  {e.synced ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                      ✓ {t('calendarSync.onCalendar')}
                    </span>
                  ) : null}
                  <span className="text-xs text-text-tertiary">
                    {new Date(e.date as string).toLocaleDateString(
                      locale === 'en' ? 'en-GB' : 'ar-SA',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

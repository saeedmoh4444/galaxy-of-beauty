'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function TechWaitlistPage(): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: popular,
    isLoading,
    isError,
    refetch,
  } = api.techWaitlist.popular.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: myList } = api.techWaitlist.myWaitlists.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const joinMut = api.techWaitlist.join.useMutation({ onSuccess: () => refetch() });
  const leaveMut = api.techWaitlist.leave.useMutation({ onSuccess: () => refetch() });

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <CardListSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <ErrorAlert message={t('techWaitlist.loadError')} onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const techs = (popular ?? []) as Array<Record<string, unknown>>;
  const my = (myList ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('techWaitlist.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('techWaitlist.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-4">{t('techWaitlist.popularTitle')}</h3>
          <div className="space-y-3">
            {techs.map((tx: Record<string, unknown>) => (
              <div
                key={tx.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted dark:bg-gray-800 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tx.emoji as string}</span>
                  <div>
                    <p className="font-bold">{tx.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {tx.waitlistCount as number} {t('techWaitlist.waitingLabel')} ·{' '}
                      {tx.avgWait as string}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    joinMut.mutate({
                      technicianId: tx.id as number,
                      technicianName: tx.name as string,
                    })
                  }
                >
                  {t('techWaitlist.join')}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <h3 className="font-bold">{t('techWaitlist.myLists')}</h3>
        {my.length === 0 ? (
          <EmptyState
            title={t('techWaitlist.emptyTitle')}
            description={t('techWaitlist.emptyDescription')}
          />
        ) : (
          <div className="space-y-2">
            {my.map((w: Record<string, unknown>) => (
              <Card key={w.id as number} padding="md" className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{w.technicianName as string}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(w.createdAt as string).toLocaleDateString(
                      locale === 'en' ? 'en-GB' : 'ar-SA',
                    )}{' '}
                    ·{' '}
                    {(w.status as string) === 'WAITING'
                      ? t('techWaitlist.waitingLabel')
                      : (w.status as string)}
                  </p>
                </div>
                <button
                  onClick={() => leaveMut.mutate({ id: w.id as number })}
                  className="text-red-400 text-sm"
                >
                  {t('techWaitlist.leave')}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

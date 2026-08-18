'use client';

import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { useState } from 'react';

export default function VideoSessionPage(): JSX.Element {
  const { t } = useLocale();
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const bid = Number(bookingId);
  const [joining, setJoining] = useState(false);

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = api.video.getByBooking.useQuery({ bookingId: bid }, { enabled: !isNaN(bid) });

  const startMut = api.video.startSession.useMutation({
    onSuccess: () => refetch(),
  });

  const endMut = api.video.endSession.useMutation({
    onSuccess: () => refetch(),
  });

  const handleStart = async () => {
    setJoining(true);
    try {
      const result = await startMut.mutateAsync({ bookingId: bid });
      const roomId = (result as Record<string, unknown>).roomId as string;
      router.push(`/video/${bookingId}/room?room=${roomId}`);
    } catch {
      setJoining(false);
    }
  };

  const sess = session as Record<string, unknown> | null;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('videoSession.title')}
        </h1>

        {isLoading ? (
          <KPIRowSkeleton count={1} />
        ) : isError ? (
          <ErrorAlert message={t('videoSession.loadError')} onRetry={() => refetch()} />
        ) : !sess ? (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('videoSession.consultationTitle')}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('videoSession.consultationDesc')}
            </p>
            <div className="mt-6">
              <Button onClick={handleStart} loading={joining}>
                {t('videoSession.start')}
              </Button>
            </div>
          </Card>
        ) : sess.status === 'WAITING' ? (
          <Card
            padding="md"
            className="text-center border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950"
          >
            <div className="mb-4 text-5xl"></div>
            <h3 className="font-semibold text-brand-700">{t('videoSession.waitingOther')}</h3>
            <p className="mt-2 text-sm text-brand-500">{t('videoSession.notificationSent')}</p>
            <div className="mt-4">
              <Button onClick={() => router.push(`/video/${bookingId}/room?room=${sess.roomId}`)}>
                {t('videoSession.joinRoom')}
              </Button>
            </div>
          </Card>
        ) : sess.status === 'IN_PROGRESS' ? (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl"></div>
            <h3 className="font-semibold text-green-700">{t('videoSession.sessionActive')}</h3>
            <div className="mt-4 flex gap-3 justify-center">
              <Button onClick={() => router.push(`/video/${bookingId}/room?room=${sess.roomId}`)}>
                {t('videoSession.backToRoom')}
              </Button>
              <Button
                variant="outline"
                onClick={() => endMut.mutate({ roomId: sess.roomId as string })}
              >
                {t('videoSession.end')}
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl"></div>
            <h3 className="font-semibold text-gray-500">{t('videoSession.sessionEnded')}</h3>
            {sess.durationSec ? (
              <p className="mt-2 text-sm text-gray-400">
                {t('videoSession.duration')}{' '}
                {t('serviceCompare.minutes', {
                  count: Math.round((sess.durationSec as number) / 60),
                })}
              </p>
            ) : null}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

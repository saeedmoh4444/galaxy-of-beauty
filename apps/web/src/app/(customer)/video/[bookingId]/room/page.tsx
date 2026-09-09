'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function VideoRoomPage(): JSX.Element {
  const { t } = useLocale();
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room') || 'unknown';

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('videoRoom.title')}</h1>

        <Card padding="lg" className="text-center">
          <div className="mb-6 text-6xl"></div>
          <p className="text-sm text-text-secondary mb-2">
            {t('videoRoom.roomNumber')}{' '}
            <code className="rounded bg-surface-muted px-2 py-1 text-xs dark:bg-gray-800">
              {roomId}
            </code>
          </p>
          <p className="text-sm text-text-secondary mb-2">
            {t('videoRoom.booking')} <span className="font-mono">{bookingId}</span>
          </p>
          <div className="mt-6 rounded-xl border-2 border-dashed border-edge p-12">
            <p className="text-sm text-text-tertiary">{t('videoRoom.integrationNote')}</p>
            <p className="mt-2 text-xs text-text-tertiary">{t('videoRoom.providerNote')}</p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={() => window.history.back()}>{t('videoRoom.back')}</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(roomId)}>
              {t('videoRoom.copyRoomNumber')}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

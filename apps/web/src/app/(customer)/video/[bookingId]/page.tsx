'use client';

import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, ErrorAlert, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState } from 'react';

export default function VideoSessionPage(): JSX.Element {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const bid = Number(bookingId);
  const [joining, setJoining] = useState(false);

  const { data: session, isLoading, isError, refetch } = api.video.getByBooking.useQuery(
    { bookingId: bid },
    { enabled: !isNaN(bid) },
  );

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
      router.push(`/customer/video/${bookingId}/room?room=${roomId}`);
    } catch {
      setJoining(false);
    }
  };

  const sess = session as Record<string, unknown> | null;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          استشارة فيديو
        </h1>

        {isLoading ? (
          <Card padding="md"><p className="text-sm text-gray-500">جاري التحميل...</p></Card>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل الجلسة" onRetry={() => refetch()} />
        ) : !sess ? (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl">📹</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              استشارة عبر الفيديو
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              تواصلي مع الفنانه مباشرة عبر مكالمة فيديو آمنة. يمكنك مناقشة احتياجاتك قبل الحجز.
            </p>
            <div className="mt-6">
              <Button onClick={handleStart} loading={joining}>
                بدء الاستشارة
              </Button>
            </div>
          </Card>
        ) : sess.status === 'WAITING' ? (
          <Card padding="md" className="text-center border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
            <div className="mb-4 text-5xl">⏳</div>
            <h3 className="font-semibold text-brand-700">في انتظار الطرف الآخر...</h3>
            <p className="mt-2 text-sm text-brand-500">تم إرسال إشعار. سيتم الاتصال عند الانضمام.</p>
            <div className="mt-4">
              <Button onClick={() => router.push(`/customer/video/${bookingId}/room?room=${sess.roomId}`)}>
                الانضمام للغرفة
              </Button>
            </div>
          </Card>
        ) : sess.status === 'IN_PROGRESS' ? (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl">🟢</div>
            <h3 className="font-semibold text-green-700">الجلسة نشطة</h3>
            <div className="mt-4 flex gap-3 justify-center">
              <Button onClick={() => router.push(`/customer/video/${bookingId}/room?room=${sess.roomId}`)}>
                العودة للغرفة
              </Button>
              <Button variant="outline" onClick={() => endMut.mutate({ roomId: sess.roomId as string })}>
                إنهاء
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="md" className="text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h3 className="font-semibold text-gray-500">انتهت الجلسة</h3>
            {sess.durationSec ? (
              <p className="mt-2 text-sm text-gray-400">
                المدة: {Math.round((sess.durationSec as number) / 60)} دقيقة
              </p>
            ) : null}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

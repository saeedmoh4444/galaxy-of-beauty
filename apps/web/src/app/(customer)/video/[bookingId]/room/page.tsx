'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Card, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function VideoRoomPage(): JSX.Element {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room') || 'unknown';

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          غرفة الفيديو
        </h1>

        <Card padding="lg" className="text-center">
          <div className="mb-6 text-6xl">📹</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            رقم الغرفة: <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">{roomId}</code>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            الحجز: <span className="font-mono">{bookingId}</span>
          </p>
          <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              واجهة الفيديو — يتم التكامل مع Daily.co أو Whereby
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              عند ربط مزود فيديو، ستظهر هنا واجهة المكالمة المباشرة
            </p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={() => window.history.back()}>العودة</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(roomId)}>
              نسخ رقم الغرفة
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

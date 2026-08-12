'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert } from '@galaxy/ui';

const COLORS = [
  'bg-green-100 dark:bg-green-900/40',
  'bg-green-200 dark:bg-green-800/40',
  'bg-yellow-100 dark:bg-yellow-900/40',
  'bg-yellow-200 dark:bg-yellow-800/40',
  'bg-orange-200 dark:bg-orange-800/40',
  'bg-orange-300 dark:bg-orange-700/40',
  'bg-red-200 dark:bg-red-900/40',
  'bg-red-300 dark:bg-red-800/40',
  'bg-red-400 dark:bg-red-700/60',
  'bg-red-500 dark:bg-red-600/80',
];

export default function BookingHeatmapPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.bookingHeatmap.data.useQuery({}) as {
    data: { days: string[]; hours: number[]; heatmap: number[][] } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">📊</span>
        <h1 className="mt-4 text-3xl font-bold">خريطة الحجوزات</h1>
        <p className="mt-2 text-text-secondary">أوقات الذروة والمواعيد المتاحة</p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : data ? (
        <Card padding="lg">
          <div className="overflow-x-auto">
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `50px repeat(${data.hours.length}, 1fr)` }}
            >
              <div className="text-xs font-medium text-text-tertiary p-1"></div>
              {data.hours.map((h) => (
                <div key={h} className="text-xs font-medium text-text-tertiary p-1 text-center">
                  {h}:00
                </div>
              ))}
              {data.heatmap.map((row, di) => (
                <div key={di} className="contents">
                  <div className="text-xs font-bold text-text-secondary p-1 flex items-center">
                    {data.days[di]}
                  </div>
                  {row.map((val, hi) => (
                    <div
                      key={hi}
                      className={`h-8 rounded ${COLORS[Math.min(9, val)] ?? COLORS[0]}`}
                      title={`${val} حجوزات`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-tertiary">
            <span>🟢 هادئ</span>
            <div className="w-4 h-3 rounded bg-green-200" />
            <div className="w-4 h-3 rounded bg-yellow-200" />
            <div className="w-4 h-3 rounded bg-orange-300" />
            <div className="w-4 h-3 rounded bg-red-400" />
            <span>🔴 مزدحم</span>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

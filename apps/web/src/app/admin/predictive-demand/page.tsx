'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';

export default function PredictiveDemandPage(): JSX.Element {
  const { data, isLoading } = api.predictiveDemand.forecast.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const f = data ?? {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 توقعات الطلب</h1>
      </div>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <h3 className="font-bold mb-3">📅 الأسبوع القادم</h3>
              <p className="text-2xl font-extrabold">
                {(f.nextWeek as Record<string, unknown>)?.predictedBookings as number} حجز
              </p>
              <p className="text-sm text-text-secondary">
                🔝 الذروة: {(f.nextWeek as Record<string, unknown>)?.peakDay as string}{' '}
                {(f.nextWeek as Record<string, unknown>)?.peakTime as string}
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                {(f.nextWeek as Record<string, unknown>)?.recommendations
                  ? ((f.nextWeek as Record<string, unknown>)?.recommendations as string[])?.join(
                      ' · ',
                    )
                  : ''}
              </p>
            </Card>
            <Card padding="lg">
              <h3 className="font-bold mb-3">📈 الشهر القادم</h3>
              <p className="text-2xl font-extrabold">
                {(f.nextMonth as Record<string, unknown>)?.predictedBookings as number} حجز
              </p>
              <p className="text-sm text-text-secondary">
                ثقة {(f.nextMonth as Record<string, unknown>)?.confidence as number}% · نمو +
                {(f.nextMonth as Record<string, unknown>)?.growth as number}%
              </p>
            </Card>
          </div>
          <Card padding="lg">
            <h3 className="font-bold mb-3">💄 حسب الخدمة</h3>
            <div className="space-y-2">
              {(f.byService as Array<Record<string, unknown>>)?.map(
                (s: Record<string, unknown>, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                  >
                    <span className="font-bold">{s.name as string}</span>
                    <span>الطلب: {s.currentDemand as number}%</span>
                    <span
                      className={
                        s.trend === 'up'
                          ? 'text-green-600'
                          : s.trend === 'down'
                            ? 'text-red-600'
                            : 'text-text-secondary'
                      }
                    >
                      {s.prediction as string}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

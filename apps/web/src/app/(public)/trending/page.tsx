'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency, ErrorAlert } from '@galaxy/ui';

export default function TrendingPage(): JSX.Element {
  const {
    data: trending,
    isLoading: trLoading,
    isError: trError,
    refetch: trRefetch,
  } = api.social.trending.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: spotlight, isLoading: spLoading } = api.social.spotlight.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  if (trError)
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert message="فشل تحميل المحتوى" onRetry={() => trRefetch()} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🔥 الأكثر رواجاً</h1>
        <p className="mt-2 text-text-secondary">أكثر الخدمات طلباً والفنيات تميزاً</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <h3 className="font-bold mb-3 text-lg">🔥 الخدمات الأكثر طلباً</h3>
          {trLoading ? (
            <CardSkeleton />
          ) : !(trending ?? []).length ? (
            <p className="text-sm text-text-tertiary">لا توجد بيانات</p>
          ) : (
            <div className="space-y-2">
              {(trending ?? []).slice(0, 10).map((s: Record<string, unknown>) => (
                <div
                  key={s.serviceId as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-bold text-sm">
                      {(s.titleJson as Record<string, string>)?.ar ?? `خدمة #${s.serviceId}`}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatCurrency(Number(s.basePrice ?? 0))}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    {s.bookingCount as number} حجز
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3 text-lg">⭐ فنيات مميزات</h3>
          {spLoading ? (
            <CardSkeleton />
          ) : !(spotlight ?? []).length ? (
            <p className="text-sm text-text-tertiary">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {(spotlight ?? []).map((t: Record<string, unknown>) => (
                <div key={t.id as number} className="flex items-center gap-4 rounded-lg border p-3">
                  <span className="text-4xl">👩‍🎨</span>
                  <div>
                    <p className="font-bold">{t.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {t.city as string} · ⭐{t.ratingAvg as number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

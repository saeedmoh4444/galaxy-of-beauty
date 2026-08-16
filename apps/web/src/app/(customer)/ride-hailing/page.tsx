'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function RideHailingPage(): JSX.Element {
  const {
    data: providers,
    isLoading,
    isError,
    refetch,
  } = api.rideHailing.providers.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const bookMut = api.rideHailing.book.useMutation();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <CardListSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const list = (providers ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> توصيل للموعد</h1>
          <p className="mt-1 text-sm text-text-secondary">احجزي توصيل لمشواركِ لصالون التجميل</p>
        </div>
        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold">تم الحجز!</h2>
            <p className="font-bold mt-1">
              {result.driverName as string} · {result.carModel as string}
            </p>
            <p className="text-sm text-text-secondary">
              {result.plateNumber as string} · {result.estimatedArrival as string}
            </p>
          </Card>
        ) : (
          <Card padding="lg">
            <h3 className="font-bold mb-4">اختر مزود التوصيل</h3>
            <div className="space-y-3">
              {list.map((p: Record<string, unknown>) => (
                <div
                  key={p.key as string}
                  className="flex items-center justify-between rounded-xl bg-surface-muted dark:bg-gray-800 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{p.emoji as string}</span>
                    <div>
                      <p className="font-bold">{p.nameAr as string}</p>
                      <p className="text-xs text-text-secondary">
                        ️ {p.estimatedTime as string} · {formatCurrency(p.estimatedPrice as number)}{' '}
                        ر.س
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      bookMut.mutate(
                        {
                          bookingId: 1,
                          provider: p.key as 'uber' | 'careem',
                          pickupAddress: 'موقعي الحالي',
                        },
                        { onSuccess: (d) => setResult(d as Record<string, unknown>) },
                      )
                    }
                  >
                    احجز
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

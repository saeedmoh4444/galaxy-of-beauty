'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechCalendarPage(): JSX.Element {
  const status = api.calendar.status.useQuery({} as never);
  const connectMut = api.calendar.connect.useMutation({ onSuccess: () => status.refetch() });
  const disconnectMut = api.calendar.disconnect.useMutation({ onSuccess: () => status.refetch() });
  const syncMut = api.calendar.sync.useMutation({ onSuccess: () => status.refetch() });

  const st = status.data as unknown as Record<string, unknown> | undefined;

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">تقويم قوقل</h1>

        {status.isLoading ? (
          <CardSkeleton />
        ) : status.isError ? (
          <ErrorAlert message="فشل تحميل حالة التقويم" onRetry={() => status.refetch()} />
        ) : st?.connected ? (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl dark:bg-green-900">
                  📅
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">متصل</p>
                  <p className="text-sm text-gray-500">{st.email as string}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تقويم قوقل متصل. يمكنك مزامنة مواعيدك لنقل الحجوزات إلى تقويمك.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => syncMut.mutate({} as never)}
                  loading={syncMut.isPending}
                >
                  مزامنة الآن
                </Button>
                <Button
                  variant="danger"
                  onClick={() => disconnectMut.mutate({} as never)}
                  loading={disconnectMut.isPending}
                >
                  قطع الاتصال
                </Button>
              </div>
              {syncMut.isSuccess && (
                <p className="text-sm text-green-600">{syncMut.data?.message as string}</p>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
                📅
              </div>
              <h2 className="text-lg font-semibold">ربط تقويم قوقل</h2>
              <p className="text-sm text-gray-500">
                اربط تقويم قوقل الخاص بك لعرض مواعيد الحجوزات تلقائياً ومزامنتها مع تقويمك الشخصي.
              </p>
              <Button
                onClick={() => connectMut.mutate({ authCode: 'stub-auth-code' } as never)}
                loading={connectMut.isPending}
              >
                ربط تقويم قوقل
              </Button>
              {connectMut.isSuccess && (
                <p className="text-sm text-green-600">{connectMut.data?.message as string}</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

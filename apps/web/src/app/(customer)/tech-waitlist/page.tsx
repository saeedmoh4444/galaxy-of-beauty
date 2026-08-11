'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechWaitlistPage(): JSX.Element {
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
      <DashboardLayout role="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const techs = (popular ?? []) as Array<Record<string, unknown>>;
  const my = (myList ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">📋 قائمة الانتظار</h1>
          <p className="mt-1 text-sm text-text-secondary">انضمي لقائمة انتظار الفنيات المشغولات</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-4">🔥 الفنيات الأكثر طلباً</h3>
          <div className="space-y-3">
            {techs.map((t: Record<string, unknown>) => (
              <div
                key={t.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted dark:bg-gray-800 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.emoji as string}</span>
                  <div>
                    <p className="font-bold">{t.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {t.waitlistCount as number} في الانتظار · {t.avgWait as string}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    joinMut.mutate({
                      technicianId: t.id as number,
                      technicianName: t.name as string,
                    })
                  }
                >
                  انضمي
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <h3 className="font-bold">📋 قوائم انتظاري</h3>
        {my.length === 0 ? (
          <EmptyState title="لا توجد قوائم انتظار" description="انضمي لقائمة انتظار فنية مشغولة" />
        ) : (
          <div className="space-y-2">
            {my.map((w: Record<string, unknown>) => (
              <Card key={w.id as number} padding="md" className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{w.technicianName as string}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(w.createdAt as string).toLocaleDateString('ar-SA')} ·{' '}
                    {(w.status as string) === 'WAITING' ? '⏳ في الانتظار' : (w.status as string)}
                  </p>
                </div>
                <button
                  onClick={() => leaveMut.mutate({ id: w.id as number })}
                  className="text-red-400 text-sm"
                >
                  خروج
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

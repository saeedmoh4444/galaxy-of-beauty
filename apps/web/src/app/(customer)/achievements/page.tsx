'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency, ErrorAlert } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AchievementsPage(): JSX.Element {
  const { data, isLoading, isError, refetch } =
    api.customerAchievements.myAchievements.useQuery() as {
      data: Record<string, unknown> | undefined;
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    };
  if (isError)
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="mx-auto max-w-4xl space-y-6">
          <ErrorAlert message="فشل تحميل الإنجازات" onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );
  const achievements = (data?.achievements as Array<Record<string, unknown>>) ?? [];
  const stats = data?.stats as Record<string, unknown> | undefined;
  const earnedCount = (data?.earnedCount as number) ?? 0;
  const totalCount = (data?.totalCount as number) ?? 0;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> الإنجازات</h1>
          <p className="mt-1 text-sm text-text-secondary">ميداليات وجوائز رحلتكِ الجمالية</p>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <>
            <Card padding="lg" className="text-center">
              <p className="text-sm text-text-secondary">تقدمكِ</p>
              <div className="h-4 bg-surface-muted rounded-full mt-2">
                <div
                  className="h-4 bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.round((earnedCount / totalCount) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {earnedCount}/{totalCount} إنجاز
              </p>
            </Card>

            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="md" className="text-center">
                <p className="text-xl font-extrabold">{(stats?.totalBookings as number) ?? 0}</p>
                <p className="text-xs text-text-secondary">حجوزات</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-xl font-extrabold text-green-600">
                  {formatCurrency((stats?.totalSpent as number) ?? 0)}
                </p>
                <p className="text-xs text-text-secondary">إنفاق</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-xl font-extrabold text-amber-600">
                  {(stats?.streakDays as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">أيام متتالية</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-xl font-extrabold text-purple-600">
                  {(stats?.uniqueServices as number) ?? 0}
                </p>
                <p className="text-xs text-text-secondary">خدمات مختلفة</p>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a: Record<string, unknown>) => (
                <Card
                  key={a.key as string}
                  padding="md"
                  className={`text-center transition-all ${a.earned ? 'border-2 border-amber-300 bg-amber-50' : 'opacity-40'}`}
                >
                  <span className="text-4xl block">{a.earned ? (a.emoji as string) : ''}</span>
                  <h3 className="font-bold mt-2">{a.nameAr as string}</h3>
                  <p className="text-xs text-text-secondary mt-1">{a.desc as string}</p>
                  {a.earned ? (
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                       تم
                    </span>
                  ) : (
                    <span className="mt-2 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-tertiary">
                      
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

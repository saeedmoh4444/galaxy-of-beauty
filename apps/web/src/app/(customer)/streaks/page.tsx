'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StreaksPage(): JSX.Element {
  const streakQ = api.streaks.get.useQuery({} as never);
  const achievementsQ = api.streaks.getAchievements.useQuery({} as never);

  const streakData = streakQ.data as unknown as Record<string, unknown> | undefined;
  const achievementsData = achievementsQ.data as unknown as Record<string, unknown> | undefined;

  const isLoading = streakQ.isLoading || achievementsQ.isLoading;
  const isError = streakQ.isError || achievementsQ.isError;

  const allAchievements = (achievementsData?.all as unknown as Record<string, unknown>[]) ?? [];
  const earned = (achievementsData?.earned as unknown as Record<string, unknown>[]) ?? [];
  const earnedKeys = new Set(earned.map((a) => a.key as string));

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">الاستمرارية</h1>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل بيانات الاستمرارية" onRetry={() => { streakQ.refetch(); achievementsQ.refetch(); }} />
        ) : (
          <>
            {/* Current Streak */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card padding="lg" className="flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🔥</span>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">الاستمرارية الحالية</p>
                <p className="mt-1 text-4xl font-bold text-brand-600">{streakData?.currentStreak as number ?? 0}</p>
                <p className="text-xs text-gray-400">أسابيع متتالية</p>
              </Card>
              <Card padding="lg" className="flex flex-col items-center justify-center text-center">
                <span className="text-5xl">🏆</span>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">أطول استمرارية</p>
                <p className="mt-1 text-4xl font-bold text-amber-600">{streakData?.longestStreak as number ?? 0}</p>
                <p className="text-xs text-gray-400">أسابيع</p>
              </Card>
              <Card padding="lg" className="flex flex-col items-center justify-center text-center">
                <span className="text-5xl">📅</span>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">آخر حجز</p>
                <p className="mt-1 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {streakData?.lastBookingDate
                    ? new Date(streakData.lastBookingDate as string).toLocaleDateString('ar-SA', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })
                    : 'لا يوجد'}
                </p>
              </Card>
            </div>

            {/* Achievements */}
            <h2 className="text-lg font-semibold">الإنجازات</h2>
            {allAchievements.length === 0 ? (
              <div>
                <EmptyState title="لا توجد إنجازات" description="ليس لديك أي إنجازات حتى الآن" />
                <div className="text-center">
                  <Button onClick={() => streakQ.refetch()}>تحديث</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allAchievements.map((ach: Record<string, unknown>) => {
                  const nameJson = ach.nameJson as Record<string, string>;
                  const descriptionJson = ach.descriptionJson as Record<string, string>;
                  const isEarned = earnedKeys.has(ach.key as string);

                  return (
                    <Card
                      key={ach.id as number}
                      padding="md"
                      className={isEarned ? 'border-green-300 dark:border-green-700' : 'opacity-70'}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">
                          {ach.iconUrl ? (
                            <img src={ach.iconUrl as string} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : isEarned ? (
                            '🏅'
                          ) : (
                            '🔒'
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{nameJson?.ar ?? nameJson?.en ?? ''}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{descriptionJson?.ar ?? descriptionJson?.en ?? ''}</p>
                          <div className="mt-2 flex items-center gap-2">
                            {isEarned ? (
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                                تم الإنجاز ✓
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800">
                                لم يتم بعد
                              </span>
                            )}
                            {Number(ach.rewardAmount) > 0 && (
                              <span className="text-xs font-semibold text-amber-600">
                                +{formatCurrency(Number(ach.rewardAmount))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

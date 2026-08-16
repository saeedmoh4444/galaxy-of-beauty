/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, Button, ErrorAlert } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function WellnessHubPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.wellnessHub.dashboard.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-5xl space-y-6">
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-5xl space-y-6">
          <ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );
  const d = data;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> مركز العافية</h1>
          <p className="mt-1 text-sm text-text-secondary">
            نظرة شاملة على صحتكِ وجمالكِ في مكان واحد
          </p>
        </div>

        {/* Cycle Card */}
        {(d?.cycle as Record<string, unknown>) && (
          <Card padding="lg" className="text-center border-2">
            <span className="text-4xl">{(d!.cycle as any).phase?.emoji}</span>
            <h3 className="font-bold text-lg mt-2">{(d!.cycle as any).phase?.name}</h3>
            <p className="text-sm text-text-secondary">
              اليوم {(d!.cycle as any).currentDay} من {(d!.cycle as any).cycleLength}
            </p>
            <p className="text-xs text-brand-600 mt-1">
              ️ الدورة القادمة بعد {(d!.cycle as any).daysUntilNext} يوم
            </p>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-extrabold">
              {d?.todayMood ? (d.todayMood as any).mood + '/5' : '—'}
            </p>
            <p className="text-xs text-text-secondary">مزاج اليوم</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-extrabold text-blue-600">
              {d?.todayMood ? (d.todayMood as any).energy + '/10' : '—'}
            </p>
            <p className="text-xs text-text-secondary">الطاقة</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-extrabold text-purple-600">
              {d?.todayMood ? (d.todayMood as any).sleepHours + 'h' : '—'}
            </p>
            <p className="text-xs text-text-secondary">النوم</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-extrabold text-cyan-600">
              {d?.todayMood ? (d.todayMood as any).waterGlasses + '' : '—'}
            </p>
            <p className="text-xs text-text-secondary">الماء</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skin Analysis */}
          <Card padding="lg">
            <h3 className="font-bold mb-3"> تحليل البشرة</h3>
            {d?.skin ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-text-secondary">نوع البشرة:</span>{' '}
                  <span className="font-bold">{(d.skin as any).skinType}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {(((d.skin as any).concerns as string[]) || []).map((c: string) => (
                    <span
                      key={c}
                      className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-text-tertiary">لم تحللي بشرتكِ بعد</p>
                <Link href="/skin-analysis">
                  <Button size="sm" className="mt-2">
                    حللي بشرتكِ
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Weekly Summary */}
          <Card padding="lg">
            <h3 className="font-bold mb-3"> ملخص الأسبوع</h3>
            {d?.weekly && (d.weekly as any).checkinCount > 0 ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary mb-1">متوسط المزاج</p>
                  <div className="h-2 bg-surface-muted rounded-full">
                    <div
                      className="h-2 bg-amber-500 rounded-full"
                      style={{ width: `${((d.weekly as any).avgMood / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">متوسط الطاقة</p>
                  <div className="h-2 bg-surface-muted rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${((d.weekly as any).avgEnergy / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">
                  {(d.weekly as any).checkinCount} تقييم هذا الأسبوع
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-tertiary">سجلي تقييمكِ اليومي</p>
            )}
          </Card>
        </div>

        {/* Journal */}
        <Card padding="lg">
          <h3 className="font-bold mb-3"> آخر اليوميات ({(d?.journalCount as number) ?? 0})</h3>
          {(d?.recentJournals as Array<Record<string, unknown>>)?.length ? (
            (d?.recentJournals as Array<Record<string, unknown>>).map(
              (j: Record<string, unknown>) => (
                <div key={j.id as number} className="border-b py-2 last:border-0">
                  <p className="text-sm">{j.content as string}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(j.date as string).toLocaleDateString('ar-SA')} · مزاج:{' '}
                    {(j.mood as number) ?? '—'}/5
                  </p>
                </div>
              ),
            )
          ) : (
            <p className="text-sm text-text-tertiary">لا توجد يوميات</p>
          )}
          <Link href="/beauty-journal">
            <Button size="sm" variant="outline" className="w-full mt-3">
              كل اليوميات
            </Button>
          </Link>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/self-care">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">تقييم اليوم</p>
            </Card>
          </Link>
          <Link href="/cycle-tracker">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">الدورة</p>
            </Card>
          </Link>
          <Link href="/skin-analysis">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">تحليل البشرة</p>
            </Card>
          </Link>
          <Link href="/wellness-tracker">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">العافية</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

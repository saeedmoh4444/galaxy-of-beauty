/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const MILESTONES: Record<number, { emoji: string; reward: string }> = {
  5: { emoji: '🌟', reward: 'خصم ١٠٪ على الحجز التالي' },
  10: { emoji: '💎', reward: 'جلسة عناية مجانية' },
  20: { emoji: '👑', reward: 'باقة تجميل متكاملة' },
  30: { emoji: '🏆', reward: 'عضوية ذهبية لمدة شهر' },
  50: { emoji: '✨', reward: 'يوم تجميل كامل مجاناً' },
};

export default function StreakCalendarPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: streakData, isLoading, isError, refetch } = (api as any).streaks?.get?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookings } = api.bookings.list.useQuery({ limit: 100 }) as any;

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const nextMilestone = Object.keys(MILESTONES).map(Number).find(n => n > currentStreak && n <= currentStreak + 5);
  const milestone = nextMilestone ? MILESTONES[nextMilestone] : null;

  // Build calendar: last 12 weeks
  const weeks: { label: string; booked: boolean; isCurrent: boolean }[] = [];
  const completedBookings = (bookings?.bookings ?? []).filter((b: any) => b.status === 'COMPLETED');
  const bookingDates = new Set(completedBookings.map((b: any) => new Date(b.createdAt).toISOString().slice(0, 10)));

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const hasBooking = Array.from({ length: 7 }, (_, j) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + j);
      return bookingDates.has(day.toISOString().slice(0, 10));
    }).some(Boolean);
    weeks.push({ label: weekStart.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }), booked: hasBooking, isCurrent: i === 0 });
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">🔥 تقويم الاستمرارية</h1>

        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
          <>
            {/* Current Streak */}
            <Card padding="lg" className="text-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <p className="text-6xl">🔥</p>
              <p className="mt-2 text-sm text-text-secondary">الاستمرارية الحالية</p>
              <p className="text-4xl font-extrabold text-orange-600 mt-1">{currentStreak} أسبوع</p>
              <p className="text-xs text-text-tertiary mt-1">أطول استمرارية: {longestStreak} أسبوع</p>
              {milestone && (
                <div className="mt-4 rounded-lg bg-white/80 p-3 dark:bg-gray-800/80">
                  <p className="text-sm">🎯 الهدف القادم: {nextMilestone} أسابيع</p>
                  <p className="text-xs text-brand-600 mt-1">{milestone.emoji} {milestone.reward}</p>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${(currentStreak / nextMilestone!) * 100}%` }} /></div>
                </div>
              )}
            </Card>

            {/* Weekly Calendar */}
            <Card padding="lg">
              <h3 className="mb-4 font-semibold">آخر ١٢ أسبوع</h3>
              <div className="grid grid-cols-4 gap-2">
                {weeks.map((w, i) => (
                  <div key={i} className={`rounded-lg p-3 text-center text-xs transition-all ${w.booked ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-surface-muted dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} ${w.isCurrent ? 'ring-2 ring-brand-500' : ''}`}>
                    <div className="text-lg">{w.booked ? '✅' : '—'}</div>
                    <div className="mt-1 text-text-secondary">{w.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> تم الحجز</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300" /> لم يتم</span>
              </div>
            </Card>

            {/* Milestones */}
            <Card padding="lg">
              <h3 className="mb-4 font-semibold">🏆 المكافآت القادمة</h3>
              <div className="space-y-2">
                {Object.entries(MILESTONES).map(([weeks, m]) => (
                  <div key={weeks} className={`flex items-center justify-between rounded-lg p-3 ${Number(weeks) <= currentStreak ? 'bg-green-50 dark:bg-green-900/20' : Number(weeks) === nextMilestone ? 'bg-brand-50 dark:bg-brand-950' : 'bg-surface-muted dark:bg-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.emoji}</span>
                      <div><p className="text-sm font-semibold">{weeks} أسابيع</p><p className="text-xs text-text-secondary">{m.reward}</p></div>
                    </div>
                    {Number(weeks) <= currentStreak ? <span className="text-green-600 text-xs font-bold">✓ تم</span> : <span className="text-text-tertiary text-xs">{Number(weeks) - currentStreak} أسبوع متبقي</span>}
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center">
              <Link href="/bookings/create"><Button>احجزي الآن وحافظي على استمراريتكِ 🔥</Button></Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

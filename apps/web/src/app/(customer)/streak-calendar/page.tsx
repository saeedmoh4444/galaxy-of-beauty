'use client';

import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';
import Link from 'next/link';

const MILESTONES: Record<number, { emoji: string; reward: TranslationKey }> = {
  5: { emoji: '', reward: 'streakCalendar.reward.m5' },
  10: { emoji: '', reward: 'streakCalendar.reward.m10' },
  20: { emoji: '', reward: 'streakCalendar.reward.m20' },
  30: { emoji: '', reward: 'streakCalendar.reward.m30' },
  50: { emoji: '', reward: 'streakCalendar.reward.m50' },
};

export default function StreakCalendarPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: streakData, isLoading, isError, refetch } = api.streaks.get.useQuery();
  const { data: bookings } = api.bookings.list.useQuery({ limit: 100 });

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const nextMilestone = Object.keys(MILESTONES)
    .map(Number)
    .find((n) => n > currentStreak && n <= currentStreak + 5);
  const milestone = nextMilestone ? MILESTONES[nextMilestone] : null;

  // Build calendar: last 12 weeks
  const weeks: { label: string; booked: boolean; isCurrent: boolean }[] = [];
  const completedBookings = (bookings?.bookings ?? []).filter((b) => b.status === 'COMPLETED');
  const bookingDates = new Set(
    completedBookings.map((b) => new Date(b.createdAt).toISOString().slice(0, 10)),
  );

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
    weeks.push({
      label: weekStart.toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
        month: 'short',
        day: 'numeric',
      }),
      booked: hasBooking,
      isCurrent: i === 0,
    });
  }

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('streakCalendar.title')}
        </h1>

        {isLoading ? (
          <KPIRowSkeleton count={1} />
        ) : isError ? (
          <ErrorAlert message={t('streakCalendar.err.load')} onRetry={() => refetch()} />
        ) : (
          <>
            {/* Current Streak */}
            <Card
              padding="lg"
              className="text-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
            >
              <p className="text-6xl"></p>
              <p className="mt-2 text-sm text-text-secondary">
                {t('streakCalendar.currentStreak')}
              </p>
              <p className="text-4xl font-extrabold text-orange-600 mt-1">
                {t('streakCalendar.weeks', { count: currentStreak })}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {t('streakCalendar.longestStreak', { count: longestStreak })}
              </p>
              {milestone && (
                <div className="mt-4 rounded-lg bg-white/80 p-3 dark:bg-gray-800/80">
                  <p className="text-sm">
                    {t('streakCalendar.nextMilestone', { count: nextMilestone as number })}
                  </p>
                  <p className="text-xs text-brand-600 mt-1">
                    {milestone.emoji} {t(milestone.reward)}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${(currentStreak / nextMilestone!) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Weekly Calendar */}
            <Card padding="lg">
              <h3 className="mb-4 font-semibold">{t('streakCalendar.last12Weeks')}</h3>
              <div className="grid grid-cols-4 gap-2">
                {weeks.map((w, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-center text-xs transition-all ${w.booked ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-surface-muted dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} ${w.isCurrent ? 'ring-2 ring-brand-500' : ''}`}
                  >
                    <div className="text-lg">{w.booked ? '' : '—'}</div>
                    <div className="mt-1 text-text-secondary">{w.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />{' '}
                  {t('streakCalendar.legendBooked')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />{' '}
                  {t('streakCalendar.legendNotBooked')}
                </span>
              </div>
            </Card>

            {/* Milestones */}
            <Card padding="lg">
              <h3 className="mb-4 font-semibold">{t('streakCalendar.rewardsTitle')}</h3>
              <div className="space-y-2">
                {Object.entries(MILESTONES).map(([weeks, m]) => (
                  <div
                    key={weeks}
                    className={`flex items-center justify-between rounded-lg p-3 ${Number(weeks) <= currentStreak ? 'bg-green-50 dark:bg-green-900/20' : Number(weeks) === nextMilestone ? 'bg-brand-50 dark:bg-brand-950' : 'bg-surface-muted dark:bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold">
                          {t('streakCalendar.milestoneWeeks', { count: weeks })}
                        </p>
                        <p className="text-xs text-text-secondary">{t(m.reward)}</p>
                      </div>
                    </div>
                    {Number(weeks) <= currentStreak ? (
                      <span className="text-green-600 text-xs font-bold">
                        {t('streakCalendar.done')}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-xs">
                        {t('streakCalendar.weeksLeft', { count: Number(weeks) - currentStreak })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center">
              <Link href="/bookings/create">
                <Button>{t('streakCalendar.cta')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

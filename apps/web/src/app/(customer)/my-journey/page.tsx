'use client';

import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';
import Link from 'next/link';

export default function MyJourneyPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: bookings, isLoading: bLoading } = api.bookings.list.useQuery({ limit: 100 });
  const { data: streak } = api.streaks.get.useQuery();

  const allBookings = bookings?.bookings ?? [];
  const completed = allBookings.filter((b) => b.status === 'COMPLETED');
  const firstBooking = allBookings[allBookings.length - 1];
  const totalSpent = completed.reduce((sum: number, b) => sum + Number(b.totalAmount || 0), 0);
  const uniqueServices = new Set(completed.map((b) => b.serviceId)).size;
  const uniqueTechnicians = new Set(
    completed.filter((b) => b.technicianId).map((b) => b.technicianId),
  ).size;

  // Milestones
  const milestones = [
    {
      label: 'myJourney.milestone.first',
      achieved: allBookings.length > 0,
      emoji: '',
      date: firstBooking?.createdAt,
    },
    {
      label: 'myJourney.milestone.five',
      achieved: completed.length >= 5,
      emoji: '',
      date: completed.length >= 5 ? completed[4]?.createdAt : null,
    },
    {
      label: 'myJourney.milestone.ten',
      achieved: completed.length >= 10,
      emoji: '',
      date: completed.length >= 10 ? completed[9]?.createdAt : null,
    },
    { label: 'myJourney.milestone.savings', achieved: totalSpent >= 1000, emoji: '' },
    { label: 'myJourney.milestone.techs', achieved: uniqueTechnicians >= 3, emoji: '‍' },
    { label: 'myJourney.milestone.services', achieved: uniqueServices >= 5, emoji: '' },
  ];

  if (bLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <DashboardSkeleton />
      </DashboardLayout>
    );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('myJourney.title')}
        </h1>
        <p className="text-sm text-text-secondary">{t('myJourney.subtitle')}</p>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="text-center" padding="lg">
            <span className="text-3xl"></span>
            <p className="text-3xl font-extrabold text-brand-600 mt-2">{allBookings.length}</p>
            <p className="text-sm text-text-secondary">{t('myJourney.totalBookings')}</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl"></span>
            <p className="text-3xl font-extrabold text-pink-600 mt-2">{completed.length}</p>
            <p className="text-sm text-text-secondary">{t('myJourney.completedBookings')}</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl"></span>
            <p className="text-3xl font-extrabold text-purple-600 mt-2">{uniqueServices}</p>
            <p className="text-sm text-text-secondary">{t('myJourney.uniqueServices')}</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl">‍</span>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{uniqueTechnicians}</p>
            <p className="text-sm text-text-secondary">{t('myJourney.uniqueTechs')}</p>
          </Card>
        </div>

        {/* Spending & Streak */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card padding="md" className="text-center">
            <p className="text-sm text-text-secondary">{t('myJourney.totalSpent')}</p>
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-text-secondary">{t('myJourney.bestStreak')}</p>
            <p className="text-2xl font-extrabold text-orange-600">
              {t('myJourney.weeks', { count: streak?.longestStreak || 0 })}
            </p>
          </Card>
        </div>

        {/* Milestones */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">{t('myJourney.milestonesTitle')}</h3>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg p-3 ${m.achieved ? 'bg-green-50 dark:bg-green-900/20' : 'bg-surface-muted dark:bg-gray-800/50 opacity-50'}`}
              >
                <span className="text-2xl">{m.achieved ? m.emoji : ''}</span>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${m.achieved ? 'text-text-primary dark:text-gray-100' : 'text-text-tertiary'}`}
                  >
                    {t(m.label as TranslationKey)}
                  </p>
                  {m.date && (
                    <p className="text-xs text-text-tertiary">
                      {new Date(m.date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')}
                    </p>
                  )}
                </div>
                {m.achieved && <span className="text-green-600 text-sm"></span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Link href="/bookings/create">
            <Button>{t('myJourney.continue')}</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

export default function MyJourneyPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookings, isLoading: bLoading } = api.bookings.list.useQuery({ limit: 100 }) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insights } = api.analytics.customerInsights.useQuery() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loyalty } = (api as any).loyalty?.myAccount?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: streak } = (api as any).streaks?.get?.useQuery?.() as any;

  const allBookings = (bookings?.bookings ?? []) as Array<Record<string, any>>;
  const completed = allBookings.filter((b: any) => b.status === 'COMPLETED');
  const firstBooking = allBookings[allBookings.length - 1];
  const totalSpent = completed.reduce((sum: number, b: any) => sum + Number(b.totalAmount || 0), 0);
  const uniqueServices = new Set(completed.map((b: any) => b.serviceId)).size;
  const uniqueTechnicians = new Set(completed.filter((b: any) => b.technicianId).map((b: any) => b.technicianId)).size;

  // Milestones
  const milestones = [
    { label: 'أول حجز', achieved: allBookings.length > 0, emoji: '🎉', date: firstBooking?.createdAt },
    { label: '٥ حجوزات', achieved: completed.length >= 5, emoji: '⭐', date: completed.length >= 5 ? completed[4]?.createdAt : null },
    { label: '١٠ حجوزات', achieved: completed.length >= 10, emoji: '💎', date: completed.length >= 10 ? completed[9]?.createdAt : null },
    { label: 'توفير ١٠٠٠ ر.س', achieved: totalSpent >= 1000, emoji: '💰' },
    { label: '٣ فنيات مختلفات', achieved: uniqueTechnicians >= 3, emoji: '👩‍🎨' },
    { label: '٥ خدمات مختلفة', achieved: uniqueServices >= 5, emoji: '✨' },
  ];

  if (bLoading) return <DashboardLayout role="CUSTOMER"><CardSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🗺️ رحلتي</h1>
        <p className="text-sm text-gray-500">قصة جمالكِ معنا — من أول حجز إلى اليوم</p>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="text-center" padding="lg">
            <span className="text-3xl">📅</span>
            <p className="text-3xl font-extrabold text-brand-600 mt-2">{allBookings.length}</p>
            <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl">💖</span>
            <p className="text-3xl font-extrabold text-pink-600 mt-2">{completed.length}</p>
            <p className="text-sm text-gray-500">حجوزات مكتملة</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl">💄</span>
            <p className="text-3xl font-extrabold text-purple-600 mt-2">{uniqueServices}</p>
            <p className="text-sm text-gray-500">خدمات مختلفة</p>
          </Card>
          <Card className="text-center" padding="lg">
            <span className="text-3xl">👩‍🎨</span>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{uniqueTechnicians}</p>
            <p className="text-sm text-gray-500">فنيات مختلفات</p>
          </Card>
        </div>

        {/* Spending & Streak */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalSpent)}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">أفضل استمرارية</p>
            <p className="text-2xl font-extrabold text-orange-600">🔥 {streak?.longestStreak || 0} أسابيع</p>
          </Card>
        </div>

        {/* Milestones */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">🏆 الإنجازات</h3>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg p-3 ${m.achieved ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'}`}>
                <span className="text-2xl">{m.achieved ? m.emoji : '🔒'}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${m.achieved ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{m.label}</p>
                  {m.date && <p className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString('ar-SA')}</p>}
                </div>
                {m.achieved && <span className="text-green-600 text-sm">✓</span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Link href="/bookings/create"><Button>استمري في رحلتكِ ✨</Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

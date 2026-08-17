'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

export default function MySubscriptionPage(): JSX.Element {
  const { addToast } = useToast();
  const { data: sub, isLoading, isError, refetch } = api.subscriptions.getMySubscription.useQuery();
  const [paused, setPaused] = useState(false);

  const handlePause = () => {
    setPaused(true);
    addToast('success', paused ? 'تم استئناف الاشتراك' : 'تم إيقاف الاشتراك مؤقتاً');
    if (paused) setPaused(false);
  };

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <DetailSkeleton />
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      </DashboardLayout>
    );
  if (!sub)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-lg space-y-6">
          <h1 className="text-2xl font-bold"> اشتراكي</h1>
          <EmptyState
            title="لا يوجد اشتراك نشط"
            description="اشتركي في باقة شهرية واحصلي على خدمات بتخفيض"
          />
          <div className="text-center">
            <Link href="/subscription-boxes">
              <Button>تصفحي الباقات</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );

  const plan = (sub.plan || {}) as typeof sub.plan & {
    servicesPerMonth?: number;
    price?: number;
    discountPercent?: number;
  };
  const planName = (plan.nameJson as Record<string, string>)?.ar || 'الباقة';
  const subExtras = sub as { currentPeriodEnd?: string | Date; bookingsThisMonth?: number };
  const nextDate = subExtras.currentPeriodEnd
    ? new Date(subExtras.currentPeriodEnd).toLocaleDateString('ar-SA')
    : '—';
  const bookingsThisMonth = subExtras.bookingsThisMonth || 0;
  const servicesPerMonth = plan.servicesPerMonth || 1;
  const remaining = Math.max(0, servicesPerMonth - bookingsThisMonth);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100"> اشتراكي</h1>

        {/* Status Card */}
        <Card
          padding="lg"
          className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950"
        >
          <div className="text-center">
            <span className="text-5xl"></span>
            <h2 className="mt-3 text-xl font-bold text-text-primary dark:text-gray-100">
              {planName}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {servicesPerMonth} {servicesPerMonth === 1 ? 'حجز' : 'حجوزات'} شهرياً
            </p>
            <p className="mt-1 text-lg font-bold text-brand-600">
              {formatCurrency(Number(plan.price || 0))} / شهرياً
            </p>
            <div className="mt-3 flex justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-brand-600">{bookingsThisMonth}</p>
                <p className="text-text-secondary">تم الحجز</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-purple-600">{remaining}</p>
                <p className="text-text-secondary">متبقي</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-600">-{plan.discountPercent || 0}%</p>
                <p className="text-text-secondary">توفير</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4"> تفاصيل الاشتراك</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">الحالة</span>
              <span
                className={`font-bold ${sub.status === 'ACTIVE' ? 'text-green-600' : (sub.status as string) === 'PAUSED' ? 'text-amber-600' : 'text-red-600'}`}
              >
                {sub.status === 'ACTIVE'
                  ? ' نشط'
                  : (sub.status as string) === 'PAUSED'
                    ? ' متوقف'
                    : ' ملغي'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">تاريخ التجديد</span>
              <span className="font-semibold">{nextDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">الخصم</span>
              <span className="text-green-600 font-bold">-{plan.discountPercent || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">الحجوزات المتبقية</span>
              <span className="font-bold text-purple-600">
                {remaining} من {servicesPerMonth}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/bookings/create" className="flex-1">
            <Button className="w-full">احجزي الآن</Button>
          </Link>
          {sub.status === 'ACTIVE' && (
            <Button variant="outline" onClick={handlePause}>
              إيقاف مؤقت
            </Button>
          )}
        </div>
        <div className="text-center">
          <Link href="/subscription-boxes" className="text-sm text-brand-600 hover:underline">
            تغيير الباقة
          </Link>
          <span className="mx-2 text-gray-300">|</span>
          <Link href="/wallet" className="text-sm text-brand-600 hover:underline">
            المحفظة
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

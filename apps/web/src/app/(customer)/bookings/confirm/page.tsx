'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AddToCalendar } from '@/components/AddToCalendar';

export default function BookingConfirmPage(): JSX.Element {
  const params = useSearchParams();
  const code = params.get('code') || '———';
  const date = params.get('date') || new Date().toISOString();
  const endDate = new Date(new Date(date).getTime() + 3600000).toISOString();

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-6xl dark:bg-green-900">✨</div>
        <h1 className="text-3xl font-extrabold text-text-primary dark:text-gray-100">تم الحجز بنجاح!</h1>
        <p className="text-text-secondary">تم إنشاء حجزكِ بنجاح. سيتم تأكيد الموعد من قبل الفنية قريباً.</p>

        <Card padding="lg" className="text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">رمز الحجز</span><span className="font-mono font-bold text-brand-600">{code}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">التاريخ</span><span>{new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">الوقت</span><span>{new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <AddToCalendar title={`حجز جالكسي بيوتي - ${code}`} startAt={date} endAt={endDate} />
          </div>
        </Card>

        <div className="space-y-2">
          <Link href="/bookings"><Button variant="outline" className="w-full">عرض حجوزاتي</Button></Link>
          <Link href="/services"><Button className="w-full">احجزي خدمة أخرى</Button></Link>
          <Link href="/dashboard"><span className="block text-sm text-brand-600 hover:underline mt-2">العودة للوحة التحكم</span></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

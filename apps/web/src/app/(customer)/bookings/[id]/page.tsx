'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'قيد الطلب',
  ACCEPTED: 'مقبول',
  PAYMENT_AUTHORIZED: 'تم الدفع',
  CONFIRMED_OFFLINE: 'مؤكد',
  PAID: 'مدفوع',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم تحضر',
};

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
};

export default function BookingDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = api.bookings.getById.useQuery(
    { id: bookingId },
    { enabled: !isNaN(bookingId) },
  ) as any;
  const booking = query.data;

  if (query.isLoading)
    return (
      <DashboardLayout role="CUSTOMER">
        <CardSkeleton />
      </DashboardLayout>
    );
  if (query.isError || !booking)
    return (
      <DashboardLayout role="CUSTOMER">
        <ErrorAlert message="فشل تحميل الحجز" onRetry={() => query.refetch()} />
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تفاصيل الحجز</h1>
          <Link href="/bookings">
            <Button variant="outline">العودة للحجوزات</Button>
          </Link>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">رمز الحجز</span>
              <span className="font-mono font-bold text-brand-600">
                {booking.bookingCode ?? `GOB-${String(booking.id).padStart(6, '0')}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">الحالة</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}`}
              >
                {STATUS_LABELS[booking.status] || booking.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">الخدمة</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span className="font-semibold">
                {((booking.service as any)?.titleJson as Record<string, string>)?.ar || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">المبلغ</span>
              <span className="font-bold text-brand-600">
                {formatCurrency(Number(booking.totalAmount || 0))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">التاريخ</span>
              <span className="text-sm">
                {new Date(booking.startAt).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">الوقت</span>
              <span className="text-sm">
                {new Date(booking.startAt).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {booking.notes && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">ملاحظات</span>
                <span className="text-sm text-gray-700">{booking.notes}</span>
              </div>
            )}
          </div>
        </Card>

        {booking.status === 'REQUESTED' && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => {}} className="flex-1">
              إلغاء الحجز
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

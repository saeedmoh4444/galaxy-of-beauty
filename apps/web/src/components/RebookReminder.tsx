/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, Button, ar } from '@galaxy/ui';

export function RebookReminder(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = api.bookings.list.useQuery({ limit: 50 }) as any;
  const bookings = (data?.bookings ?? []) as Array<Record<string, any>>;
  const completed = bookings.filter((b: any) => b.status === 'COMPLETED');

  if (completed.length === 0) return <></>;

  const lastBooking = completed.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (!lastBooking) return <></>;

  const daysSince = Math.floor((Date.now() - new Date(lastBooking.createdAt).getTime()) / 86400000);
  if (daysSince < 14) return <></>; // Don't show if booked within 2 weeks

  const weeksSince = Math.floor(daysSince / 7);
  const serviceName = ar((lastBooking.service as any)?.titleJson) || 'خدمة';
  const serviceId = lastBooking.serviceId;

  return (
    <Card padding="md" className="bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-200 dark:from-brand-950 dark:to-accent-950 dark:border-brand-800">
      <div className="flex items-center gap-4">
        <span className="text-3xl">⏰</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">مرّ {weeksSince} {weeksSince === 1 ? 'أسبوع' : 'أسابيع'} على آخر {serviceName}</p>
          <p className="text-xs text-gray-500 mt-0.5">مستعدة لتجديد إطلالتكِ؟</p>
        </div>
        <Link href={`/bookings/create?serviceId=${serviceId}`}><Button size="sm">أعيدي الحجز</Button></Link>
      </div>
    </Card>
  );
}

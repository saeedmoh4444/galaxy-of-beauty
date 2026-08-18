'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AddToCalendar } from '@/components/AddToCalendar';
import { useLocale } from '@/components/LocaleProvider';

export default function BookingConfirmPage(): JSX.Element {
  const { t, locale } = useLocale();
  const params = useSearchParams();
  const code = params.get('code') || '———';
  const date = params.get('date') || new Date().toISOString();
  const endDate = new Date(new Date(date).getTime() + 3600000).toISOString();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-6xl dark:bg-green-900"></div>
        <h1 className="text-3xl font-extrabold text-text-primary dark:text-gray-100">
          {t('booking.success-title')}
        </h1>
        <p className="text-text-secondary">{t('booking.success-message')}</p>

        <Card padding="lg" className="text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('booking.code')}</span>
              <span className="font-mono font-bold text-brand-600">{code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('booking.date')}</span>
              <span>
                {new Date(date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('booking.time')}</span>
              <span>
                {new Date(date).toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <AddToCalendar
              title={t('booking.calendar-title', { code })}
              startAt={date}
              endAt={endDate}
            />
          </div>
        </Card>

        <div className="space-y-2">
          <Link href="/bookings">
            <Button variant="outline" className="w-full">
              {t('booking.view-my-bookings')}
            </Button>
          </Link>
          <Link href="/services">
            <Button className="w-full">{t('booking.book-another-service')}</Button>
          </Link>
          <Link href="/dashboard">
            <span className="block text-sm text-brand-600 hover:underline mt-2">
              {t('booking.back-to-dashboard')}
            </span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

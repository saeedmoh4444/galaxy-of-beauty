'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { localize } from '@galaxy/shared/i18n';
import { useLocale } from '@/components/LocaleProvider';

export function RebookReminder(): JSX.Element {
  const { data } = api.bookings.list.useQuery({ limit: 50 });
  const { locale, t } = useLocale();
  const bookings = data?.bookings ?? [];
  const completed = bookings.filter((b) => b.status === 'COMPLETED');

  if (completed.length === 0) return <></>;

  const lastBooking = completed.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  if (!lastBooking) return <></>;

  const daysSince = Math.floor((Date.now() - new Date(lastBooking.createdAt).getTime()) / 86400000);
  if (daysSince < 14) return <></>; // Don't show if booked within 2 weeks

  const weeksSince = Math.floor(daysSince / 7);
  const serviceName =
    localize(lastBooking.service?.titleJson, locale) || t('rebook.service-fallback');
  const serviceId = lastBooking.serviceId;

  return (
    <Card
      padding="md"
      className="bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-200 dark:from-brand-950 dark:to-accent-950 dark:border-brand-800"
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl"></span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {t(weeksSince === 1 ? 'rebook.since-one' : 'rebook.since-many', {
              weeks: weeksSince,
              service: serviceName,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{t('rebook.ready')}</p>
        </div>
        <Link href={`/bookings/create?serviceId=${serviceId}`}>
          <Button size="sm">{t('rebook.button')}</Button>
        </Link>
      </div>
    </Card>
  );
}

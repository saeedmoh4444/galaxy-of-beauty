'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  GridSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  formatCurrency,
} from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import Link from 'next/link';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

export default function EventTicketsPage(): JSX.Element {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = api.eventTickets.available.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const reserveMut = api.eventTickets.reserve.useMutation();
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState('');
  const [reserved, setReserved] = useState<Record<string, unknown> | null>(null);

  const handleReserve = () => {
    if (!name.trim() || !selectedEvent) return;
    reserveMut.mutate(
      { eventId: selectedEvent.id as number, attendeeName: name },
      {
        onSuccess: (data) => {
          setReserved(data);
          setSelectedEvent(null);
          setName('');
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">{t('marketing.event-tickets.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.event-tickets.subtitle')}</p>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : isError ? (
        <ErrorAlert message={t('marketing.event-tickets.load-error')} onRetry={() => refetch()} />
      ) : !events || events.length === 0 ? (
        <EmptyState
          title={t('marketing.event-tickets.no-events')}
          description={t('marketing.event-tickets.no-events-desc')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e: Record<string, unknown>) => (
            <Card
              key={e.id as number}
              padding="lg"
              className="text-center hover:shadow-xl transition-all"
            >
              <span className="text-5xl">
                {['workshop', 'masterclass', 'launch', 'seasonal'].includes(e.eventType as string)
                  ? { workshop: '️', masterclass: '‍', launch: '', seasonal: '' }[
                      e.eventType as string
                    ]
                  : ''}
              </span>
              <h3 className="mt-3 text-lg font-bold">
                {localize(e.nameJson as Record<string, string>, locale)}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {new Date(e.startsAt as string).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-GB',
                  {
                    month: 'long',
                    day: 'numeric',
                  },
                )}
              </p>
              <p className="text-2xl font-extrabold text-brand-600 mt-3">
                {Number(e.price) > 0
                  ? t('marketing.event-tickets.price-sar', {
                      price: formatCurrency(Number(e.price)),
                    })
                  : t('marketing.event-tickets.free')}
              </p>
              <div className="mt-4">
                {reserved && (reserved.eventId as number) === (e.id as number) ? (
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                    {t('marketing.event-tickets.booked')}
                  </span>
                ) : user ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(e);
                      setName(user.name ?? '');
                    }}
                  >
                    {t('marketing.event-tickets.book-seat')}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button size="sm" variant="ghost">
                      {t('marketing.event-tickets.login')}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={t('marketing.event-tickets.modal-title')}
      >
        <div className="space-y-4">
          <p className="font-bold">
            {localize(selectedEvent?.nameJson as Record<string, string>, locale)}
          </p>
          <div>
            <label htmlFor="et-attendee-name" className="block text-sm font-semibold mb-1">
              {t('marketing.event-tickets.attendee-name')}
            </label>
            <input
              id="et-attendee-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
              {t('marketing.event-tickets.cancel')}
            </Button>
            <Button onClick={handleReserve} loading={reserveMut.isPending}>
              {t('marketing.event-tickets.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

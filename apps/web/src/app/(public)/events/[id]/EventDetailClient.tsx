'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { Card, Button, ErrorAlert, formatCurrency } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface EventDetail {
  id: number;
  nameJson: Record<string, string>;
  descriptionJson: Record<string, string> | null;
  eventType: string;
  location: string | null;
  price: string | number | null;
  maxAttendees: number | null;
  startsAt: string;
  endsAt: string;
  imageUrl: string | null;
  tier: string;
  goodieBag: boolean;
}

export function EventDetailClient({ event }: { event: EventDetail }): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const [attendeeName, setAttendeeName] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const reserveMut = api.eventTickets.reserve.useMutation({
    onSuccess: (d) => setResult(d as Record<string, unknown>),
  });

  const name = localize(event.nameJson, locale) ?? '';
  const description = event.descriptionJson ? (localize(event.descriptionJson, locale) ?? '') : '';
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);
  const date = startsAt.toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = `${startsAt.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  })} — ${endsAt.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/events" className="text-sm font-medium text-brand-600">
        ← {t('marketing.events.back')}
      </Link>

      <Card padding="lg" className="mt-4">
        <h1 className="text-3xl font-bold">{name}</h1>
        {description && <p className="mt-3 text-text-secondary">{description}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {event.location && (
            <span className="rounded-full bg-surface-muted px-3 py-1">📍 {event.location}</span>
          )}
          {event.tier === 'VIP' && event.goodieBag && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1 font-bold text-amber-700 dark:text-amber-300">
              {t('marketing.events.vipBadge')}
            </span>
          )}
        </div>
        <div className="mt-4 border-t border-edge-muted pt-4">
          <p className="text-sm text-text-secondary">🗓 {date}</p>
          <p className="text-sm text-text-secondary">🕐 {time}</p>
          <p className="mt-2 text-xl font-extrabold text-brand-600">
            {event.price
              ? `${formatCurrency(Number(event.price))} ر.س`
              : t('marketing.events.free')}
          </p>
        </div>
      </Card>

      <Card padding="lg" className="mt-6">
        <h2 className="text-lg font-bold">{t('marketing.events.reserve-title')}</h2>
        {result ? (
          <div className="mt-4 text-center">
            <span className="text-5xl">🎟️</span>
            <p className="mt-2 text-lg font-bold text-green-700 dark:text-green-400">
              {t('marketing.events.reserved')}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {t('marketing.events.ticket-id')}: {String(result.ticketId)}
            </p>
          </div>
        ) : !isAuthenticated ? (
          <p className="mt-4 text-sm text-text-secondary">
            {t('marketing.events.sign-in-to-reserve')}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-52">
              <label htmlFor="ev-attendee" className="text-xs font-semibold">
                {t('marketing.events.attendee-name')}
              </label>
              <input
                id="ev-attendee"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder={t('marketing.events.name-placeholder')}
                className="mt-1 w-full rounded-lg border border-edge bg-surface-elevated px-3 py-2 text-sm"
              />
            </div>
            <Button
              size="lg"
              disabled={!attendeeName.trim() || reserveMut.isPending}
              onClick={() =>
                reserveMut.mutate({ eventId: event.id, attendeeName: attendeeName.trim() })
              }
            >
              {t('marketing.events.reserve')}
            </Button>
          </div>
        )}
        {reserveMut.isError && (
          <div className="mt-4">
            <ErrorAlert
              message={
                (reserveMut.error as { message?: string })?.message ?? t('common.loadFailed')
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}

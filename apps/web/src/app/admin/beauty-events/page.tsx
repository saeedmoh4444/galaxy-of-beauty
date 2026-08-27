'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize, type TranslationKey } from '@galaxy/shared';

const EVENT_TYPES: Array<{ key: string; labelKey: TranslationKey }> = [
  { key: 'workshop', labelKey: 'admin.beauty-events.type-workshop' },
  { key: 'masterclass', labelKey: 'admin.beauty-events.type-masterclass' },
  { key: 'launch', labelKey: 'admin.beauty-events.type-launch' },
  { key: 'seasonal', labelKey: 'admin.beauty-events.type-seasonal' },
];

export default function AdminBeautyEventsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: events, isLoading } = api.beautyEvents.listAll.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const createMut = api.beautyEvents.create.useMutation();
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [eventType, setEventType] = useState('workshop');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');

  const handleCreate = () => {
    if (!nameAr || !nameEn || !startsAt || !endsAt) return;
    createMut.mutate(
      {
        nameAr,
        nameEn,
        eventType: eventType as 'workshop',
        location: location || undefined,
        price: price ? Number(price) : undefined,
        maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        isPublished: true,
      },
      {
        onSuccess: () => {
          setNameAr('');
          setNameEn('');
          setLocation('');
          setPrice('');
          setMaxAttendees('');
        },
      },
    );
  };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.beauty-events.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.beauty-events.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.beauty-events.create-title')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={t('admin.beauty-events.name-ar')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={t('admin.beauty-events.name-en')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {EVENT_TYPES.map((et) => (
                <option key={et.key} value={et.key}>
                  {t(et.labelKey)}
                </option>
              ))}
            </select>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('admin.beauty-events.location')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              placeholder={t('admin.beauty-events.price')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              type="number"
              placeholder={t('admin.beauty-events.max-attendees')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              type="datetime-local"
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              type="datetime-local"
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <Button onClick={handleCreate} loading={createMut.isPending} className="w-full mt-3">
            {t('admin.beauty-events.create-button')}
          </Button>
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.beauty-events.events-title')}</h3>
          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : !(events ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('admin.beauty-events.empty')}</p>
          ) : (
            <div className="space-y-2">
              {(events ?? []).map((e: Record<string, unknown>) => (
                <div
                  key={e.id as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-bold">{localize(e.nameJson, locale)}</p>
                    <p className="text-xs text-text-secondary">
                      {e.eventType as string} · {e.location as string} ·{' '}
                      {new Date(e.startsAt as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {e.price ? formatCurrency(Number(e.price)) : t('admin.beauty-events.free')}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${e.isPublished ? 'bg-green-100 text-green-700' : 'bg-surface-muted'}`}
                    >
                      {e.isPublished
                        ? t('admin.beauty-events.published')
                        : t('admin.beauty-events.hidden')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

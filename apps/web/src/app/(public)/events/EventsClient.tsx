'use client';

import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import Link from 'next/link';

interface Event {
  id: number;
  nameJson: Record<string, string>;
  descriptionJson: Record<string, string> | null;
  eventType: string;
  location: string | null;
  price: string | null;
  maxAttendees: number | null;
  startsAt: string;
  endsAt: string;
  imageUrl: string | null;
}

const EVENT_TYPES = [
  { key: 'workshop', label: ' ورش عمل' },
  { key: 'masterclass', label: '‍ دروس متقدمة' },
  { key: 'launch', label: ' إطلاق منتجات' },
  { key: 'seasonal', label: ' موسمي' },
];

export function EventsClient({ initialEvents }: { initialEvents: unknown[] }): JSX.Element {
  const [activeType, setActiveType] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = (
    api as unknown as {
      beautyEvents: {
        list: {
          useQuery: (
            input: Record<string, never>,
            opts: { initialData: unknown[] },
          ) => {
            data: Event[] | undefined;
            isLoading: boolean;
            isError: boolean;
            refetch: () => void;
          };
        };
      };
    }
  ).beautyEvents.list.useQuery({}, { initialData: initialEvents });

  const events: Event[] = data ?? (isLoading ? (initialEvents as Event[]) : []);
  const filteredEvents = activeType ? events.filter((e) => e.eventType === activeType) : events;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">الفعاليات</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          ورش عمل، دروس، وفعاليات تجميلية
        </p>
      </div>

      {/* Type Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveType(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!activeType ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          الكل
        </button>
        {EVENT_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveType(key === activeType ? null : key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeType === key ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && !initialEvents.length ? (
        <GridSkeleton count={6} />
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الفعاليات" onRetry={() => refetch()} />
      ) : events.length === 0 ? (
        <EmptyState
          title="لا توجد فعاليات"
          description="لم تُضف أي فعاليات بعد. تابعي الصفحة قريباً! "
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title={`لا توجد فعاليات من هذا النوع`}
          description="جربي تصفية نوع آخر"
          action={
            activeType ? { label: 'عرض الكل', onPress: () => setActiveType(null) } : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const name = event.nameJson?.ar ?? event.nameJson?.en ?? '';
            const desc = event.descriptionJson
              ? ((event.descriptionJson as Record<string, string>).ar ??
                (event.descriptionJson as Record<string, string>).en ??
                '')
              : '';
            const date = new Date(event.startsAt).toLocaleDateString('ar-SA', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            });
            const time = new Date(event.startsAt).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card key={event.id} padding="md" className="flex flex-col">
                <div className="relative mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={name}
                      fill
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    ''
                  )}
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">{name}</h3>
                {desc && <p className="mt-1 text-sm text-text-secondary line-clamp-2">{desc}</p>}
                <div className="mt-3 space-y-1 text-xs text-text-tertiary">
                  <p> {date}</p>
                  <p> {time}</p>
                  {event.location && <p> {event.location}</p>}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="font-bold text-brand-600">
                    {event.price ? formatCurrency(Number(event.price)) : 'مجاناً '}
                  </span>
                  <Link href={`/events/${event.id}`}>
                    <Button size="sm">تفاصيل</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

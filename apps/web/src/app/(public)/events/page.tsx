'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency, EVENT_POLL_INTERVAL_MS } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
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

const EVENT_TYPES: Record<string, { label: string; emoji: string; gradient: string }> = {
  workshop: { label: 'ورشة عمل', emoji: '🛠️', gradient: 'from-blue-400 to-cyan-500' },
  masterclass: { label: 'ماستر كلاس', emoji: '👩‍🏫', gradient: 'from-purple-400 to-pink-500' },
  launch: { label: 'إطلاق منتج', emoji: '🚀', gradient: 'from-amber-400 to-orange-500' },
  seasonal: { label: 'موسمي', emoji: '🌸', gradient: 'from-emerald-400 to-teal-500' },
};

function EventCountdown({ startsAt }: { startsAt: string }): JSX.Element {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const start = new Date(startsAt).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setLabel('بدأت الفعالية!');
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      if (days > 0) setLabel(`متبقي ${days} يوم ${hours} ساعة`);
      else if (hours > 0) setLabel(`متبقي ${hours} ساعة ${minutes} د`);
      else if (minutes > 0) setLabel(`متبقي ${minutes} دقيقة`);
      else setLabel('تبدأ قريباً!');
    };

    update();
    const interval = setInterval(update, EVENT_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startsAt]);

  const isSoon = label !== 'بدأت الفعالية!' && label !== 'تبدأ قريباً!';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isSoon ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
      ⏰ {label}
    </span>
  );
}

export default function EventsPage(): JSX.Element {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<string | null>(null);

  const { data: events, isLoading, isError, refetch } = api.beautyEvents.upcoming.useQuery() as {
    data: Event[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const allEvents: Event[] = events ?? [];
  const filteredEvents = activeType ? allEvents.filter((e) => e.eventType === activeType) : allEvents;

  const typeKeys = Object.keys(EVENT_TYPES);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl">📅</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">الفعاليات والورش</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          ورش عمل، ماستر كلاس، وفعاليات تجميل حصرية — تعلمي من أفضل الخبراء
        </p>
      </div>

      {/* Event Type Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveType(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            !activeType
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          الكل
        </button>
        {typeKeys.map((key) => {
          const info = EVENT_TYPES[key]!;
          const count = allEvents.filter((e) => e.eventType === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveType(key === activeType ? null : key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeType === key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {info.emoji} {info.label}
              {count > 0 && (
                <span className="mr-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/30 px-1 text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الفعاليات" onRetry={() => refetch()} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title={activeType ? `لا توجد فعاليات "${EVENT_TYPES[activeType]?.label ?? activeType}"` : 'لا توجد فعاليات قادمة'}
          description={activeType ? 'جربي البحث عن نوع آخر' : 'لم تُضف أي فعاليات بعد. تابعي الصفحة قريباً! 🌸'}
          action={activeType ? { label: 'عرض الكل', onPress: () => setActiveType(null) } : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const name = event.nameJson?.ar ?? event.nameJson?.en ?? '';
            const desc = event.descriptionJson
              ? ((event.descriptionJson as Record<string, string>).ar ?? (event.descriptionJson as Record<string, string>).en ?? '')
              : '';
            const typeInfo = EVENT_TYPES[event.eventType] ?? { label: event.eventType, emoji: '📅', gradient: 'from-gray-400 to-gray-500' };
            const isFree = !event.price || Number(event.price) === 0;
            const startDate = new Date(event.startsAt);
            const isPast = startDate.getTime() < Date.now();

            return (
              <Card key={event.id} padding="lg" className={`group relative overflow-hidden transition-all hover:shadow-xl ${isPast ? 'opacity-70' : ''}`}>
                {/* Type gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${typeInfo.gradient}`} />

                {/* Image */}
                <div className="mt-1 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-5xl dark:from-purple-950 dark:to-pink-950">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={name}
                      className="h-full w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span>{typeInfo.emoji}</span>
                  )}
                </div>

                {/* Type Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${typeInfo.gradient} px-2.5 py-0.5 text-xs font-bold text-white`}>
                    {typeInfo.emoji} {typeInfo.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="mt-2 text-lg font-bold text-text-primary dark:text-gray-100 line-clamp-2">
                  {name}
                </h3>

                {/* Description */}
                {desc && (
                  <p className="mt-1 text-sm text-text-secondary dark:text-gray-400 line-clamp-2">
                    {desc}
                  </p>
                )}

                {/* Date & Location */}
                <div className="mt-3 space-y-1 text-sm text-text-secondary">
                  <p>
                    📅 {startDate.toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p>
                    🕐 {startDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(event.endsAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                </div>

                {/* Countdown */}
                <div className="mt-2">
                  <EventCountdown startsAt={event.startsAt} />
                </div>

                {/* Price & CTA */}
                <div className="mt-4 flex items-center justify-between">
                  <p className={`text-lg font-extrabold ${isFree ? 'text-green-600 dark:text-green-400' : 'text-brand-600'}`}>
                    {isFree ? 'مجاناً 🎉' : `${formatCurrency(Number(event.price))} ر.س`}
                  </p>
                  {user ? (
                    <Button size="sm" disabled={isPast}>
                      {isPast ? 'بدأت' : 'سجّلي الآن'}
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button size="sm" variant="ghost">تسجيل الدخول</Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom Banner */}
      {allEvents.length > 0 && (
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-center text-white">
          <p className="text-2xl font-bold">🎓 تعلمي من أفضل الخبراء</p>
          <p className="mt-1 text-white/80">
            ورش العمل والماستر كلاس يقدمها خبراء معتمدون في مجال التجميل
          </p>
        </div>
      )}
    </div>
  );
}

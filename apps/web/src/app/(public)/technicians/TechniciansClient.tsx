'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Input, Card, CardSkeleton, ErrorAlert, EmptyState, ar } from '@galaxy/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export interface TechniciansPageData {
  initialTechnicians: AnyRecord[];
}

export function TechniciansClient({ data }: { data: TechniciansPageData }): JSX.Element {
  const [city, setCity] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = api.technicians.list.useQuery({ city: city || undefined }) as any;
  const techs: AnyRecord[] = Array.isArray(query.data)
    ? query.data
    : Array.isArray(data.initialTechnicians)
      ? data.initialTechnicians
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">فنيات التجميل</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          تصفحي فنيات التجميل المعتمدات في مدينتك
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="المدينة"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {query.isLoading && techs.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorAlert message="فشل تحميل الفنيات" onRetry={() => query.refetch()} />
      ) : techs.length === 0 ? (
        <EmptyState title="لا توجد فنيات" description="لم يتم العثور على فنيات تطابق بحثك." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {techs.map((tech: AnyRecord) => {
            const user = tech.user ?? {};
            const name = user.name ?? '';
            const avatarUrl = user.avatarUrl ?? '';
            const cityName = tech.city ?? '';
            const rating = Number(tech.ratingAvg ?? 0);
            const bookings = tech.completedBookings ?? 0;
            const isEco = tech.isEcoFriendly ?? false;
            const bio = tech.bioJson ? ar(tech.bioJson) : '';

            return (
              <Link key={tech.id} href={`/technicians/${tech.id}`}>
                <Card hover padding="lg" className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-3xl dark:from-brand-900 dark:to-accent-900">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-full w-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>👩‍🎨</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">
                    {name}
                  </h3>
                  <p className="text-sm text-text-secondary">{cityName}</p>
                  {bio && <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">{bio}</p>}
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="text-amber-500">⭐ {rating.toFixed(1)}</span>
                    <span className="text-text-tertiary">{bookings} حجز</span>
                    {isEco && <span className="text-green-500">🌿</span>}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

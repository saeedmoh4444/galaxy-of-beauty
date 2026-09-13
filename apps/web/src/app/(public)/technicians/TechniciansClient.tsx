'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import {
  Input,
  Card,
  GridSkeleton,
  ErrorAlert,
  EmptyState,
  HeroSection,
  ServiceImage,
  Icon,
} from '@galaxy/ui';

type TechnicianItem = RouterOutputs['technicians']['list']['items'][number];

export interface TechniciansPageData {
  initialTechnicians: TechnicianItem[];
}

export function TechniciansClient({ data }: { data: TechniciansPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const [city, setCity] = useState('');

  const query = api.technicians.list.useQuery({ city: city || undefined });
  const techs: TechnicianItem[] = Array.isArray(query.data)
    ? query.data
    : Array.isArray(data.initialTechnicians)
      ? data.initialTechnicians
      : [];

  return (
    <div>
      <HeroSection
        align="center"
        eyebrow="🌸"
        title={t('marketing.technicians.title')}
        subtitle={t('marketing.technicians.subtitle')}
        gradient="from-brand-50 via-surface to-accent-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="mb-6 flex flex-wrap gap-4">
          <Input
            placeholder={t('marketing.technicians.city-placeholder')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {query.isLoading && techs.length === 0 ? (
          <GridSkeleton count={6} />
        ) : query.isError ? (
          <ErrorAlert
            message={t('marketing.technicians.load-error')}
            onRetry={() => query.refetch()}
          />
        ) : techs.length === 0 ? (
          <EmptyState
            title={t('marketing.technicians.no-technicians')}
            description={t('marketing.technicians.no-technicians-desc')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {techs.map((tech) => {
              const user = tech.user ?? ({} as typeof tech.user);
              const name = user.name ?? '';
              const avatarUrl = user.avatarUrl ?? '';
              const cityName = tech.city ?? '';
              const rating = Number(tech.ratingAvg ?? 0);
              const bookings = tech.completedBookings ?? 0;
              const isEco = tech.isEcoFriendly ?? false;
              const bio = tech.bioJson ? localize(tech.bioJson, locale) : '';

              return (
                <Link key={tech.id} href={`/technicians/${tech.id}`}>
                  <Card hover padding="lg" className="flex flex-col items-center text-center">
                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900 dark:to-accent-900">
                      <ServiceImage
                        src={avatarUrl || null}
                        alt={name}
                        size="full"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">
                      {name}
                    </h3>
                    <p className="text-sm text-text-secondary">{cityName}</p>
                    {bio && <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">{bio}</p>}
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Icon name="star" size="sm" />
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-text-tertiary">
                        {t('marketing.technicians.bookings-count', { count: bookings })}
                      </span>
                      {isEco && <Icon name="sparkle" size="sm" className="text-green-500" />}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

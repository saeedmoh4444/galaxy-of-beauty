'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import type { TranslationKey } from '@galaxy/shared';
import {
  Card,
  ErrorAlert,
  EmptyState,
  HeroSection,
  ServiceImage,
  formatCurrency,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const SPECIALTY_KEYS: Record<string, TranslationKey> = {
  yoga: 'trainers.specialty.yoga',
  pilates: 'trainers.specialty.pilates',
  strength: 'trainers.specialty.strength',
  aerobics: 'trainers.specialty.aerobics',
  zumba: 'trainers.specialty.zumba',
  general: 'trainers.specialty.general',
};

export interface TrainersPageData {
  trainers: Array<Record<string, unknown>>;
  // Stage 12 — verified TRAINER vendors with bookable 1:1 sessions.
  sessionTrainers: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function TrainersClient({ data }: { data: TrainersPageData }): JSX.Element {
  const { t } = useLocale();

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        eyebrow="🏋️♀️"
        title={t('trainers.title')}
        subtitle={t('trainers.subtitle')}
        gradient="from-brand-50 via-surface to-accent-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
        {data.trainers.length === 0 ? (
          <EmptyState title={t('trainers.empty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.trainers.map((tr: Record<string, unknown>) => {
              const user = (tr.user ?? {}) as Record<string, unknown>;
              const userId = user.id as number;
              return (
                <Link key={tr.id as number} href={`/gallery/${userId}`}>
                  <Card
                    padding="md"
                    className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
                        <ServiceImage
                          src={(user.avatarUrl as string) ?? null}
                          alt={(user.name as string) ?? ''}
                          size="full"
                          className="h-12 w-12 object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text-primary">
                          {user.name as string}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {(tr.city as string) ?? ''} · ⭐ {Number(tr.ratingAvg ?? 0).toFixed(1)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-brand-600">
                          {t('trainers.view-profile')} ←
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {data.sessionTrainers.length > 0 ? (
          <div className="border-t border-edge pt-8">
            <h2 className="text-xl font-bold text-text-primary">{t('trainers.book.title')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.sessionTrainers.map((tr) => {
                const specialtyKey =
                  SPECIALTY_KEYS[String(tr.trainerSpecialty ?? 'general')] ??
                  SPECIALTY_KEYS.general;
                return (
                  <Link key={tr.id as number} href={`/trainers/sessions/${tr.storeSlug as string}`}>
                    <Card
                      padding="md"
                      className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <ServiceImage
                        src={(tr.bannerUrl as string) ?? (tr.logoUrl as string) ?? null}
                        alt={tr.storeName as string}
                        className="mb-4 h-32 w-full rounded-xl object-cover"
                      />
                      <p className="font-bold text-text-primary">{tr.storeName as string}</p>
                      <p className="text-xs text-text-secondary">
                        {t(specialtyKey)} · {(tr.trainerCity as string) ?? '—'}
                      </p>
                      <p className="mt-2 text-sm font-bold text-brand-600">
                        {Number(tr.trainerSessionPrice ?? 0) > 0
                          ? `${t('trainers.book.price')}: ${formatCurrency(Number(tr.trainerSessionPrice))}`
                          : t('trainers.book.contact-pricing')}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

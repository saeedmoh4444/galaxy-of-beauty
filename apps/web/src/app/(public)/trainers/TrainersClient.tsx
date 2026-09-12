'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface TrainersPageData {
  trainers: Array<Record<string, unknown>>;
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
                        <p className="truncate font-bold text-text-primary dark:text-gray-100">
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
      </div>
    </div>
  );
}

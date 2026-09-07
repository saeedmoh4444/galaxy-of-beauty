'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState } from '@galaxy/ui';
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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('trainers.title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t('trainers.subtitle')}</p>
      </div>

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
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl as string}
                        alt={user.name as string}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
                        ️
                      </div>
                    )}
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
  );
}

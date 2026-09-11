'use client';

import Link from 'next/link';
import {
  Card,
  ErrorAlert,
  EmptyState,
  formatCurrency,
  HeroSection,
  ServiceImage,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface ClinicsPageData {
  clinics: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function ClinicsClient({ data }: { data: ClinicsPageData }): JSX.Element {
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
        eyebrow="🏥"
        title={t('clinics.title')}
        subtitle={t('clinics.subtitle')}
        gradient="from-brand-50 via-surface to-brand-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
        {data.clinics.length === 0 ? (
          <EmptyState title={t('clinics.empty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.clinics.map((c: Record<string, unknown>) => (
              <Link key={c.id as number} href={`/clinics/${c.storeSlug as string}`}>
                <Card
                  padding="md"
                  className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <ServiceImage
                      src={(c.logoUrl as string) ?? null}
                      alt={(c.storeName as string) ?? ''}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text-primary dark:text-gray-100">
                        {c.storeName as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(`clinics.treatment.${c.clinicType as string}` as never)}
                        {' · '}
                        {formatCurrency(Number(c.consultationPrice ?? 0))}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {t('clinics.verified-badge', { agency: 'MOH/SFDA' })}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

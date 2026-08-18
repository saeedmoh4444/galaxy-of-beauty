'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function SkinTimelinePage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.skinDiary.timeline.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const entries = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">️{t('skinTimeline.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('skinTimeline.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : entries.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2">️</p>
            <p className="text-text-secondary">{t('skinTimeline.empty')}</p>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-brand-200" />
            <div className="space-y-6">
              {entries.map((e: Record<string, unknown>, i: number) => (
                <div key={i} className="relative pr-10">
                  <div
                    className={`absolute right-2.5 top-4 w-3 h-3 rounded-full border-2 border-brand-600 bg-white dark:bg-gray-900`}
                  />
                  <Card padding="md">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl"></span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {(e.skinCondition as string) ?? t('skinTimeline.unspecified')}
                        </p>
                        <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                          <span>
                            {t('skinTimeline.hydration', {
                              value: (e.hydration as number) ?? '—',
                            })}
                          </span>
                          <span>
                            {' '}
                            {new Date(e.createdAt as string).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        {(e.notes as string) && (
                          <p className="text-xs text-text-tertiary mt-1">{e.notes as string}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

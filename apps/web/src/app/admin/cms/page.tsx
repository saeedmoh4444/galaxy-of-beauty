'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, GridSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function AdminCmsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: categories, isLoading: catLoading } = api.cms.listCategories.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const { data: services, isLoading: svcLoading } = api.cms.listServices.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const [tab, setTab] = useState<'categories' | 'services'>('categories');

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.cms.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.cms.subtitle')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('categories')}
            className={`rounded-lg px-4 py-2 text-sm ${tab === 'categories' ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
          >
            {t('admin.cms.categories-tab')}
          </button>
          <button
            onClick={() => setTab('services')}
            className={`rounded-lg px-4 py-2 text-sm ${tab === 'services' ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
          >
            {t('admin.cms.services-tab')}
          </button>
        </div>

        {tab === 'categories' &&
          (catLoading ? (
            <GridSkeleton count={6} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(categories ?? []).map((c: Record<string, unknown>) => (
                <Card key={c.id as number} padding="md">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.imageUrl ? '' : ''}</span>
                    <div>
                      <p className="font-bold">{localize(c.nameJson, locale)}</p>
                      <p className="text-xs text-text-secondary">
                        {c.slug as string} ·{' '}
                        {t('admin.cms.services-count', {
                          count: (c._count as Record<string, number>)?.services ?? 0,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}

        {tab === 'services' &&
          (svcLoading ? (
            <CardListSkeleton count={4} />
          ) : (
            <div className="space-y-2">
              {(services ?? []).map((s: Record<string, unknown>) => (
                <Card key={s.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{localize(s.titleJson, locale)}</p>
                      <p className="text-xs text-text-secondary">
                        {localize((s.category as Record<string, unknown>)?.nameJson, locale)} ·{' '}
                        {t('admin.cms.duration-min', { minutes: s.durationMin as number })}
                      </p>
                    </div>
                    <span className="font-bold text-brand-600">
                      {Number(s.basePrice ?? 0).toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA')}{' '}
                      {t('misc.sar')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
}

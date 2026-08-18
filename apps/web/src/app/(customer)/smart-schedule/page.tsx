'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const POPULAR_SERVICES: { id: number; name: TranslationKey; emoji: string }[] = [
  { id: 1, name: 'recommendations.manicure', emoji: '' },
  { id: 2, name: 'recommendations.pedicure', emoji: '' },
  { id: 3, name: 'recommendations.facialCleaning', emoji: '' },
  { id: 4, name: 'recommendations.massage', emoji: '‍️' },
  { id: 5, name: 'recommendations.hairDye', emoji: '' },
  { id: 6, name: 'recommendations.makeup', emoji: '' },
];

export default function SmartSchedulePage(): JSX.Element {
  const { t, locale } = useLocale();
  const [serviceId, setServiceId] = useState(1);
  const [datePref, setDatePref] = useState('');
  const { data, isLoading } = api.aiFeatures.smartSchedule.useQuery(
    { serviceId, datePreference: datePref || undefined },
    { enabled: !!serviceId },
  ) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const suggestions = (data?.suggestions as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('smartSchedule.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('smartSchedule.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('smartSchedule.chooseService')}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {POPULAR_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId === s.id ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
              >
                {s.emoji} {t(s.name)}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={datePref}
            onChange={(e) => setDatePref(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder={t('smartSchedule.datePlaceholder')}
          />
        </Card>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : suggestions.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('smartSchedule.noSlots')}</p>
          </Card>
        ) : (
          <Card padding="lg">
            <h3 className="font-bold mb-4">
              {t('smartSchedule.bestSlots', { count: suggestions.length })}
            </h3>
            <div className="space-y-2">
              {suggestions.map((s: Record<string, unknown>, i: number) => {
                const start = new Date(s.startAt as string);
                const end = new Date(s.endAt as string);
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">‍</span>
                      <div>
                        <p className="font-bold text-sm">
                          {t('smartSchedule.technicianLabel', { id: s.technicianId as number })}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {start.toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                          {' · '}
                          {start.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' — '}
                          {end.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-amber-500">{s.rating as number}</span>
                      <Button size="sm" className="mt-1 block">
                        {t('smartSchedule.book')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function TechWaitlistPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: waitlist, isLoading } = api.bookings.getTechnicianPending.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const bookings = waitlist ?? [];

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('tech.waitlist.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('tech.waitlist.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('tech.waitlist.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Record<string, unknown>) => {
              const service = b.service as Record<string, unknown> | undefined;
              return (
                <Card key={b.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">
                        {localize(service?.titleJson, locale) ||
                          t('tech.waitlist.booking-ref', { id: b.id as number })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(b.startAt as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                          {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}{' '}
                        · {b.bookingCode as string}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                      {t('tech.waitlist.pending')}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

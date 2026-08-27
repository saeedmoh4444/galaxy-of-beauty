'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminLoyaltyPage(): JSX.Element {
  const { t } = useLocale();
  const { data: rewards, isLoading: rwLoading } = api.loyalty.listRewards.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.loyalty.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.loyalty.subtitle')}</p>
        </div>

        <div>
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.loyalty.available-rewards')}</h3>
            {rwLoading ? (
              <CardListSkeleton count={4} />
            ) : !(rewards ?? []).length ? (
              <p className="text-sm text-text-tertiary">{t('admin.loyalty.no-rewards')}</p>
            ) : (
              <div className="space-y-2">
                {(rewards ?? []).map((r: Record<string, unknown>) => (
                  <div
                    key={r.id as number}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {(r.nameAr as string) ?? (r.nameJson as Record<string, string>)?.ar}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {(r.descriptionAr as string) ?? ''}
                      </p>
                    </div>
                    <span className="font-bold text-amber-600">
                      {t('admin.loyalty.points-cost', { points: r.pointsCost as number })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

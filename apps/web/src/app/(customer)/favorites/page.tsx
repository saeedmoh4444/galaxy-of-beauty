'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function FavoritesPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.favorites.list.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const removeMut = api.favorites.remove.useMutation();
  const favorites = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('favorites.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : favorites.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('favorites.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {favorites.map((f: Record<string, unknown>) => (
              <Card key={f.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <p className="font-bold">{f.label as string}</p>
                      <p className="text-xs text-text-secondary">
                        {t('aiFeed.serviceFallback', { id: f.serviceId as number })}
                        {f.technicianId
                          ? t('favorites.technicianSuffix', { id: f.technicianId as number })
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMut.mutate({ id: f.id as number })}
                    loading={removeMut.isPending}
                    className="text-red-500"
                  >
                    {t('favorites.remove')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

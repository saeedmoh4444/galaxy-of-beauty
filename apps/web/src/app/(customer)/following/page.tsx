'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function FollowingPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.technicianFollows.myFollows.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const unfollowMut = api.technicianFollows.unfollow.useMutation();
  const follows = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">‍{t('following.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('following.subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : follows.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2">‍</p>
            <p className="text-text-secondary">{t('following.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {follows.map((f: Record<string, unknown>) => (
              <Card key={f.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">‍</span>
                    <div>
                      <p className="font-bold">
                        {t('following.technicianLabel', { id: f.technicianId as number })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('following.followedOn', {
                          date: new Date(f.createdAt as string).toLocaleDateString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                          ),
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unfollowMut.mutate({ technicianId: f.technicianId as number })}
                    loading={unfollowMut.isPending}
                    className="text-red-500"
                  >
                    {t('following.unfollow')}
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

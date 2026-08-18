'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyAwardsPage(): JSX.Element {
  const { user } = useAuth();
  const { t } = useLocale();
  const { data, isLoading } = api.beautyAwards.current.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const voteMut = api.beautyAwards.vote.useMutation();

  const cats = (data?.categories ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.beauty-awards.title')}</h1>
        <p className="mt-2 text-text-secondary">
          {t('marketing.beauty-awards.vote-cta', { month: (data?.month as string) ?? '' })}
        </p>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : (
        <div className="space-y-6">
          {cats.map((c: Record<string, unknown>) => (
            <Card key={c.key as string} padding="lg">
              <h3 className="font-bold text-lg mb-4">
                {c.emoji as string} {c.nameAr as string}
              </h3>
              <div className="space-y-2">
                {(c.nominees as Array<Record<string, unknown>>).map(
                  (n: Record<string, unknown>) => (
                    <div
                      key={n.id as number}
                      className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                    >
                      <div>
                        <span className="font-bold">{n.name as string}</span>
                        {(n.desc as string) ? (
                          <span className="text-xs text-text-secondary mr-2">
                            — {n.desc as string}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">
                          {t('marketing.beauty-awards.votes', { count: n.votes as number })}
                        </span>
                        {user && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              voteMut.mutate({
                                category: c.key as string,
                                nomineeId: n.id as number,
                              })
                            }
                          >
                            {t('marketing.beauty-awards.vote')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function BehindScenesPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.behindScenes.feed.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const videos = data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.behind-scenes.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.behind-scenes.subtitle')}</p>
      </div>
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v: Record<string, unknown>) => (
            <Card
              key={v.id as number}
              padding="md"
              className="group hover:shadow-lg transition-all"
            >
              <div className="relative h-40 rounded-xl bg-gray-800 flex items-center justify-center text-4xl">
                {v.emoji as string}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-sm">{v.title as string}</h3>
                <p className="text-xs text-text-secondary mt-1">
                  ‍ {v.technicianName as string} · ️ {v.duration as string} · ️ {v.views as number}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

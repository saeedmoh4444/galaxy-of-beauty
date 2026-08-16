'use client';

import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert } from '@galaxy/ui';

export default function BeautyPodcastPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.beautyPodcast.episodes.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const episodes = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">️</span>
        <h1 className="mt-4 text-3xl font-bold">بودكاست الجمال</h1>
        <p className="mt-2 text-text-secondary">استمعي لأحدث حلقات خبراء التجميل</p>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          {episodes.map((ep: Record<string, unknown>) => (
            <Card
              key={ep.id as number}
              padding="lg"
              className="flex items-center gap-4 hover:shadow-md transition-all"
            >
              <span className="text-4xl">
                {(
                  {
                    skincare: '',
                    makeup: '',
                    hair: '‍️',
                    natural: '',
                    bridal: '',
                  } as Record<string, string>
                )[ep.category as string] ?? '️'}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-[10px] font-medium">
                    {ep.duration as string}
                  </span>
                </div>
                <h3 className="font-bold mt-1">{ep.titleAr as string}</h3>
                <p className="text-xs text-text-secondary mt-1"> {ep.host as string}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{ep.description as string}</p>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white text-lg">
                ▶
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

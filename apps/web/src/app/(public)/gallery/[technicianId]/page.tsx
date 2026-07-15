'use client';

import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState } from '@galaxy/shared';
import { MainLayout } from '@/components/layout/MainLayout';

export default function GalleryPage(): JSX.Element {
  const { technicianId } = useParams<{ technicianId: string }>();
  const tid = Number(technicianId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api.gallery as any).byTechnician.useQuery(
    { technicianId: tid, page: 1, limit: 50 },
    { enabled: !isNaN(tid) },
  );

  const items = ((data as Record<string, unknown>)?.items as Array<Record<string, unknown>>) || [];
  const total = ((data as Record<string, unknown>)?.total as number) || 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          معرض الأعمال
        </h1>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المعرض" onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="لا توجد صور في المعرض" description="لم تقم الفنية برفع أي صور بعد." />
        ) : (
          <>
            <p className="text-sm text-gray-500">{total} صورة</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((img) => (
                <Card key={img.id as number} padding="none" className="overflow-hidden group cursor-pointer">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-5xl">
                    {img.imageUrl ? (
                      <img
                        src={img.imageUrl as string}
                        alt={(img.captionAr as string) || 'Gallery image'}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>🖼️</span>
                    )}
                  </div>
                  {img.captionAr ? (
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(img.captionAr)}</p>
                      {img.isBefore ? (
                        <span className="mt-1 inline-block rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          قبل
                        </span>
                      ) : null}
                      {img.category ? (
                        <span className="mt-1 ml-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {String(img.category)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

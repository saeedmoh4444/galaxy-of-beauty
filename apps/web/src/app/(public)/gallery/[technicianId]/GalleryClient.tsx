'use client';

import { Card, EmptyState } from '@galaxy/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GalleryImage = Record<string, any>;

export interface GalleryPageData {
  items: GalleryImage[];
  total: number;
  fetchError?: string;
}

export function GalleryClient({ data }: { data: GalleryPageData }): JSX.Element {
  const { items, total, fetchError } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        معرض الأعمال
      </h1>

      {fetchError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{fetchError}</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="لا توجد صور في المعرض" description="لم تقم الفنية برفع أي صور بعد." />
      ) : (
        <>
          <p className="text-sm text-gray-500">{total} صورة</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((img: GalleryImage) => (
              <Card key={img.id} padding="none" className="group cursor-pointer overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-gray-100 text-5xl dark:bg-gray-800">
                  {img.imageUrl ? (
                    <img
                      src={String(img.imageUrl)}
                      alt={((img.captionJson as { ar?: string })?.ar) || 'Gallery image'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span>🖼️</span>
                  )}
                </div>
                {((img.captionJson as { ar?: string })?.ar) ? (
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {String((img.captionJson as { ar?: string }).ar)}
                    </p>
                    {img.isBefore ? (
                      <span className="mt-1 inline-block rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        قبل
                      </span>
                    ) : null}
                    {img.category ? (
                      <span className="ml-1 mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
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
  );
}

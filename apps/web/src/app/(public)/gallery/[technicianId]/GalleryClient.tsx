'use client';

import Image from 'next/image';
import type { RouterOutputs } from '@galaxy/api';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Card, EmptyState } from '@galaxy/ui';

type GalleryImage = RouterOutputs['gallery']['byTechnician']['items'][number];

export interface GalleryPageData {
  items: GalleryImage[];
  total: number;
  technicianUserId: number;
  fetchError?: string;
}

/** E6e — approved before/after shorts (E7 media) on the profile. */
function BeforeAfterSection({ technicianUserId }: { technicianUserId: number }): JSX.Element {
  const { t, locale } = useLocale();
  const galleryQ = api.beautyShorts.gallery.useQuery(
    { technicianUserId },
    { enabled: technicianUserId > 0 },
  );
  const beforeAfters = (galleryQ.data ?? []) as Array<Record<string, any>>;

  if (beforeAfters.length === 0) return <></>;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        ✨ {t('gallery.beforeAfterTitle')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {beforeAfters.map((s) => (
          <Card key={s.id} padding="none" className="overflow-hidden">
            {s.beforeImageUrl || s.thumbnailUrl ? (
              <div className="relative flex aspect-square items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Image
                  src={String(s.beforeImageUrl ?? s.thumbnailUrl)}
                  alt={(s.titleJson as Record<string, string>)?.ar ?? ''}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-brand-50 to-purple-50 text-5xl dark:from-brand-950 dark:to-purple-950">
                ✨
              </div>
            )}
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {locale === 'en'
                  ? ((s.titleJson as Record<string, string>)?.en ?? '')
                  : ((s.titleJson as Record<string, string>)?.ar ?? '')}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                👁️ {s.views as number} · {s.category as string}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function GalleryClient({ data }: { data: GalleryPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { items, total, fetchError, technicianUserId } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('marketing.gallery.title')}
      </h1>

      {/* E6e — before/after shorts from the media layer */}
      <BeforeAfterSection technicianUserId={technicianUserId} />

      {fetchError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{fetchError}</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('marketing.gallery.no-images')}
          description={t('marketing.gallery.no-images-desc')}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {t('marketing.gallery.images-count', { count: total })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((img: GalleryImage) => (
              <Card key={img.id} padding="none" className="group cursor-pointer overflow-hidden">
                <div className="relative flex aspect-square items-center justify-center bg-gray-100 text-5xl dark:bg-gray-800">
                  {img.imageUrl ? (
                    <Image
                      src={String(img.imageUrl)}
                      alt={localize(img.captionJson, locale) || t('marketing.gallery.image-alt')}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>️</span>
                  )}
                </div>
                {localize(img.captionJson, locale) ? (
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {localize(img.captionJson, locale)}
                    </p>
                    {img.isBefore ? (
                      <span className="mt-1 inline-block rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {t('marketing.gallery.before')}
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

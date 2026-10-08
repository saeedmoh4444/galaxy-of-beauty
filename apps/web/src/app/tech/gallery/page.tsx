'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

type GalleryItem = {
  id: number;
  imageUrl: string | null;
  videoUrl: string | null;
  captionJson: { ar?: string; en?: string } | null;
};

export default function TechGalleryPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const uploadMut = api.gallery.upload.useMutation();
  const deleteMut = api.gallery.delete.useMutation();
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploaded, setUploaded] = useState(false);

  const myItems = api.gallery.byTechnician.useQuery(
    { technicianId: user?.id ?? 0, limit: 50 },
    { enabled: !!user },
  );
  const items = (myItems.data?.items as unknown as GalleryItem[]) ?? [];

  const canUpload = url.trim().length > 0;

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('tech.gallery.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('tech.gallery.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('tech.gallery.upload-title')}</h3>
          <div className="mb-3 flex gap-2">
            <Button
              variant={mode === 'image' ? 'primary' : 'ghost'}
              onClick={() => setMode('image')}
            >
              {t('tech.gallery.image-tab')}
            </Button>
            <Button
              variant={mode === 'video' ? 'primary' : 'ghost'}
              onClick={() => setMode('video')}
            >
              {t('tech.gallery.video-tab')}
            </Button>
          </div>
          <div className="space-y-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t(
                mode === 'video'
                  ? 'tech.gallery.video-url-placeholder'
                  : 'tech.gallery.image-url-placeholder',
              )}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('tech.gallery.caption-placeholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
            <Button
              disabled={!canUpload}
              onClick={() => {
                if (!canUpload) return;
                uploadMut.mutate(
                  mode === 'video'
                    ? { videoUrl: url.trim(), captionAr: caption || undefined }
                    : { imageUrl: url.trim(), captionAr: caption || undefined },
                  {
                    onSuccess: () => {
                      setUrl('');
                      setCaption('');
                      setUploaded(true);
                      void myItems.refetch();
                    },
                  },
                );
              }}
              loading={uploadMut.isPending}
              className="w-full"
            >
              {t('tech.gallery.upload-button')}
            </Button>
          </div>
        </Card>

        {uploaded && (
          <Card
            padding="lg"
            className="text-center border-2 border-green-300 bg-green-50 dark:bg-green-950"
          >
            <p className="text-2xl">✅</p>
            <p className="font-bold text-green-700 dark:text-green-300 mt-2">
              {t('tech.gallery.upload-success')}
            </p>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('tech.gallery.my-items')}</h3>
          {items.length === 0 ? (
            <p className="text-sm text-text-secondary">{t('tech.gallery.no-items')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-2">
                  {item.videoUrl ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.videoUrl} controls className="w-full rounded-lg bg-black" />
                  ) : item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={localize(item.captionJson, locale) ?? ''}
                      className="w-full rounded-lg object-cover"
                    />
                  ) : null}
                  {item.captionJson && (
                    <p className="text-xs text-text-secondary">
                      {localize(item.captionJson, locale)}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      deleteMut.mutate(
                        { id: item.id },
                        { onSuccess: () => void myItems.refetch() },
                      );
                    }}
                    loading={deleteMut.isPending}
                  >
                    {t('tech.gallery.delete')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

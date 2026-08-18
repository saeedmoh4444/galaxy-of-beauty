'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function TechGalleryPage(): JSX.Element {
  const { t } = useLocale();
  const uploadMut = api.gallery.upload.useMutation();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploaded, setUploaded] = useState(false);

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('tech.gallery.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('tech.gallery.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('tech.gallery.upload-title')}</h3>
          <div className="space-y-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('tech.gallery.image-url-placeholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('tech.gallery.caption-placeholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (url.trim())
                  uploadMut.mutate(
                    { imageUrl: url.trim(), captionAr: caption || undefined },
                    {
                      onSuccess: () => {
                        setUrl('');
                        setCaption('');
                        setUploaded(true);
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
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-2xl"></p>
            <p className="font-bold text-green-700 mt-2">{t('tech.gallery.upload-success')}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

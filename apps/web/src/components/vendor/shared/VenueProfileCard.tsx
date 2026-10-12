'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import type * as React from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore } from '@galaxy/api';

/**
 * E6d/E7/K3 — venue profile card: trust toggles + hero banner upload.
 * Shared by the store, clinic, gym and nail-bar dashboards.
 */
export function VenueProfileCard({
  store,
  refetchStore,
}: {
  store: NonNullable<MyStore>;
  refetchStore: () => void;
}): JSX.Element {
  const { t } = useLocale();
  const trustMut = api.vendorPortal.setTrustFlags.useMutation({});
  const bannerMut = api.vendorPortal.setBanner.useMutation({
    onSuccess: () => refetchStore(),
  });
  const uploadMut = api.uploads.uploadMedia.useMutation({});
  const [bannerPreview, setBannerPreview] = useState('');

  const onBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadMut.mutate(
        {
          mediaType: 'image',
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: String(reader.result ?? ''),
          },
        },
        {
          onSuccess: (res) => {
            setBannerPreview(res.url);
            bannerMut.mutate({ bannerUrl: res.url });
          },
        },
      );
    };
    reader.readAsDataURL(file);
  };

  const banner = store.bannerUrl ?? bannerPreview;

  return (
    <Card padding="md">
      <h3 className="mb-2 text-sm font-semibold">{t('vendorPortal.trust.title')}</h3>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={store.womenOnlyStaff}
            onChange={(e) =>
              trustMut.mutate(
                { womenOnlyStaff: e.target.checked },
                { onSuccess: () => refetchStore() },
              )
            }
          />
          🙋‍♀️ {t('vendorPortal.trust.women-only')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={store.privateSuite}
            onChange={(e) =>
              trustMut.mutate(
                { privateSuite: e.target.checked },
                { onSuccess: () => refetchStore() },
              )
            }
          />
          🚪 {t('vendorPortal.trust.private-suite')}
        </label>
        {/* K3 W9 — child-friendly corner (toys/coloring for moms). */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={store.childFriendlyCorner}
            onChange={(e) =>
              trustMut.mutate(
                { childFriendlyCorner: e.target.checked },
                { onSuccess: () => refetchStore() },
              )
            }
          />
          🧸 {t('vendorPortal.trust.child-friendly')}
        </label>
      </div>

      {/* E7 — venue hero banner (upload via the media pipeline). */}
      <div className="mt-4 border-t border-border-muted pt-4">
        <p className="mb-2 text-sm font-semibold">{t('vendorPortal.banner.title')}</p>
        <div className="flex items-center gap-3">
          {banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner} alt="banner" className="h-16 w-32 rounded-xl object-cover" />
          )}
          <input type="file" accept="image/*" onChange={onBannerFile} className="w-full text-sm" />
          {store.bannerUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setBannerPreview('');
                bannerMut.mutate({ bannerUrl: null });
              }}
              loading={bannerMut.isPending}
            >
              ✕
            </Button>
          )}
        </div>
        {uploadMut.isPending && (
          <p className="mt-1 text-xs text-text-tertiary">{t('vendorPortal.banner.uploading')}</p>
        )}
      </div>
    </Card>
  );
}

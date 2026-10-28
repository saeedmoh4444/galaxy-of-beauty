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
  // C6 — About editor for the public storefront profile.
  const aboutMut = api.vendorPortal.updateStoreProfile.useMutation({
    onSuccess: () => refetchStore(),
  });
  const uploadMut = api.uploads.uploadMedia.useMutation({});
  const [bannerPreview, setBannerPreview] = useState('');
  const aboutJson = (store.descriptionJson ?? {}) as { ar?: string; en?: string };
  const [aboutAr, setAboutAr] = useState(aboutJson.ar ?? '');
  const [aboutEn, setAboutEn] = useState(aboutJson.en ?? '');
  // G3 — license/CR expiry self-service.
  const licenseMut = api.vendorPortal.setLicenseExpiry.useMutation({
    onSuccess: () => refetchStore(),
  });
  const [licenseExpiry, setLicenseExpiry] = useState(
    store.licenseExpiryDate
      ? new Date(store.licenseExpiryDate as unknown as string).toISOString().slice(0, 10)
      : '',
  );
  // B6 — social presence (one URL per network; empty = hidden).
  const socialMut = api.vendorPortal.updateSocialLinks.useMutation({
    onSuccess: () => refetchStore(),
  });
  const socialJson = (store.socialLinks ?? {}) as Record<string, string>;
  const [socials, setSocials] = useState<Record<string, string>>({
    snapchat: socialJson.snapchat ?? '',
    tiktok: socialJson.tiktok ?? '',
    x: socialJson.x ?? '',
    instagram: socialJson.instagram ?? '',
    facebook: socialJson.facebook ?? '',
  });

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

      {/* C6 — About editor (storefront profile bio). */}
      <div className="mt-4 border-t border-border-muted pt-4">
        <p className="mb-2 text-sm font-semibold">{t('vendorPortal.about.title')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <textarea
            value={aboutAr}
            onChange={(e) => setAboutAr(e.target.value)}
            placeholder={t('vendorPortal.about.arPlaceholder')}
            rows={3}
            className="w-full rounded-xl border border-border-muted bg-surface p-2 text-sm"
          />
          <textarea
            value={aboutEn}
            onChange={(e) => setAboutEn(e.target.value)}
            placeholder={t('vendorPortal.about.enPlaceholder')}
            rows={3}
            className="w-full rounded-xl border border-border-muted bg-surface p-2 text-sm"
          />
        </div>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => aboutMut.mutate({ aboutAr, aboutEn })}
          loading={aboutMut.isPending}
        >
          {t('vendorPortal.about.save')}
        </Button>
      </div>

      {/* G3 — license/CR expiry self-service (drives the 60/30/7 reminders). */}
      <div className="mt-4 border-t border-border-muted pt-4">
        <p className="mb-2 text-sm font-semibold">{t('vendorPortal.license.title')}</p>
        <div className="flex flex-wrap items-end gap-2">
          <input
            type="date"
            value={licenseExpiry}
            onChange={(e) => setLicenseExpiry(e.target.value)}
            className="rounded-xl border border-border-muted bg-surface p-2 text-sm"
          />
          <Button
            size="sm"
            disabled={!licenseExpiry}
            onClick={() => licenseMut.mutate({ date: new Date(licenseExpiry).toISOString() })}
            loading={licenseMut.isPending}
          >
            {t('vendorPortal.license.save')}
          </Button>
        </div>
        <p className="mt-1 text-xs text-text-tertiary">{t('vendorPortal.license.hint')}</p>
      </div>

      {/* B6 — social presence (Snapchat/TikTok/X/Instagram/Facebook). */}
      <div className="mt-4 border-t border-border-muted pt-4">
        <p className="mb-2 text-sm font-semibold">{t('vendorPortal.social.title')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['snapchat', 'tiktok', 'x', 'instagram', 'facebook'] as const).map((network) => (
            <div key={network}>
              <p className="mb-1 text-xs font-medium capitalize text-text-secondary">{network}</p>
              <input
                type="url"
                value={socials[network] ?? ''}
                onChange={(e) => setSocials((prev) => ({ ...prev, [network]: e.target.value }))}
                placeholder="https://"
                data-testid={`social-input-${network}`}
                className="w-full rounded-xl border border-border-muted bg-surface p-2 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => socialMut.mutate(socials)}
            loading={socialMut.isPending}
            data-testid="social-save-button"
          >
            {t('vendorPortal.social.save')}
          </Button>
          <p className="text-xs text-text-tertiary">{t('vendorPortal.social.hint')}</p>
        </div>
      </div>
    </Card>
  );
}

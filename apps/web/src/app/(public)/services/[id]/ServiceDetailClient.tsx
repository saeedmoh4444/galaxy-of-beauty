'use client';

import Link from 'next/link';
import type { RouterOutputs } from '@galaxy/api';
import { localize, serviceKeyFromCategorySlug } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { api } from '@/lib/trpc';
import {
  Button,
  Card,
  EmptyState,
  formatCurrency,
  ServiceImage,
  TrustBadge,
  TrustBadges,
} from '@galaxy/ui';

type ServiceJson = { ar?: string; en?: string };

type ServiceDetailCategory = RouterOutputs['services']['getById']['category'] & {
  nameAr?: string;
};
type ServiceDetailVariant = RouterOutputs['services']['getById']['variants'][number] & {
  nameJson?: ServiceJson | null;
};
type ServiceDetailTech =
  RouterOutputs['services']['getById']['technicianServices'][number]['technician'] & {
    city?: string;
    bioJson?: ServiceJson | null;
  };
type ServiceDetailTechService =
  RouterOutputs['services']['getById']['technicianServices'][number] & {
    technician: ServiceDetailTech;
  };
type ServiceDetailRelated = RouterOutputs['services']['getRelated'][number] & {
  titleJson?: ServiceJson | null;
};
type GalleryItem = RouterOutputs['beautyShorts']['gallery'][number];

export interface ServiceDetailData {
  id: number;
  titleJson: ServiceJson;
  descriptionJson: ServiceJson | null;
  basePrice: number;
  durationMin: number;
  imageUrl: string | null;
  isWomenOnlyStaff: boolean;
  isPrivateSuite: boolean;
  isPregnancySafe: boolean;
  isMommyFriendly: boolean;
  category: ServiceDetailCategory;
  variants: ServiceDetailVariant[];
  technicianServices: ServiceDetailTechService[];
  tags: Array<{ tag: { nameJson?: ServiceJson | null } }>;
  related: ServiceDetailRelated[];
  fetchError?: string;
}

export function ServiceDetailClient({ svc }: { svc: ServiceDetailData }): JSX.Element {
  const { t, locale } = useLocale();
  const title = localize(svc.titleJson, locale);
  const desc = localize(svc.descriptionJson, locale);
  const variants = svc.variants ?? [];
  const techs = svc.technicianServices ?? [];
  const tags = svc.tags ?? [];
  const cat = svc.category ?? ({} as ServiceDetailCategory);
  const related = svc.related ?? [];
  const id = svc.id;

  // Phase 3 sprint 2 — data-driven trust layer (E6d fields are on the model).
  const verifiedTechCount = techs.filter((ts) => ts.technician?.kycStatus === 'VERIFIED').length;
  const bestRating = techs.reduce(
    (max, ts) => Math.max(max, Number(ts.technician?.ratingAvg ?? 0)),
    0,
  );
  const trustItems = [
    { variant: 'safeSpace' as const, label: t('trust.safeSpace') },
    ...(svc.isWomenOnlyStaff
      ? [{ variant: 'womenOnly' as const, label: t('trust.womenOnly') }]
      : []),
    ...(svc.isPrivateSuite
      ? [{ variant: 'private' as const, label: t('trust.privateSuite') }]
      : []),
    ...(verifiedTechCount > 0
      ? [{ variant: 'verified' as const, label: t('trust.verified') }]
      : []),
    ...(techs.length > 0
      ? [{ variant: 'rating' as const, label: t('misc.rating'), value: bestRating.toFixed(1) }]
      : []),
  ];
  const stageChips = [
    ...(svc.isPregnancySafe ? [t('trust.pregnancySafe')] : []),
    ...(svc.isMommyFriendly ? [t('trust.mommyFriendly')] : []),
  ];

  // E6e — before/after gallery for the first mapped technician.
  const galleryTechUserId = techs[0]?.technician?.user?.id;
  const galleryQ = api.beautyShorts.gallery.useQuery(
    { technicianUserId: galleryTechUserId ?? 0 },
    { enabled: !!galleryTechUserId },
  );
  const galleryItems = (galleryQ.data as GalleryItem[] | undefined) ?? [];

  if (svc.fetchError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">{svc.fetchError}</p>
          <Link href="/services" className="mt-4 inline-block text-brand-600 hover:underline">
            {t('marketing.service-detail.back-to-services')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero — real imagery (imageUrl → category mapping fallback) */}
      <div data-testid="service-hero" className="overflow-hidden rounded-3xl">
        <ServiceImage
          src={svc.imageUrl}
          service={serviceKeyFromCategorySlug(cat.slug)}
          size="full"
          alt={title}
          className="h-64 w-full object-cover md:h-80"
        />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            >
              {localize(tag.tag.nameJson, locale)}
            </span>
          ))}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-bold text-text-primary">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">{(cat.nameAr as string) || ''}</p>
      {desc && <p className="mt-3 text-text-secondary">{desc}</p>}

      {/* Trust layer (E6d, data-driven) */}
      <TrustBadges className="mt-4" items={trustItems} />

      {/* Stage-friendly chips (pregnancy-safe / mommy-friendly) */}
      {stageChips.length > 0 && (
        <div data-testid="stage-chips" className="mt-3 flex flex-wrap gap-2">
          {stageChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600 dark:bg-accent-950 dark:text-accent-300"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Share */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() =>
            navigator
              .share?.({ title, url: window.location.href })
              .catch(() => navigator.clipboard.writeText(window.location.href))
          }
          className="rounded-lg border border-edge px-3 py-1 text-xs text-text-secondary hover:bg-surface-muted dark:border-gray-700 dark:text-text-tertiary"
        >
          {t('marketing.service-detail.share')}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="rounded-lg border border-edge px-3 py-1 text-xs text-text-secondary hover:bg-surface-muted dark:border-gray-700 dark:text-text-tertiary"
        >
          {t('marketing.service-detail.copy-link')}
        </button>
      </div>

      <div className="mt-6 flex gap-8">
        <div>
          <span className="text-sm text-text-secondary">{t('marketing.service-detail.price')}</span>
          <p className="text-2xl font-bold text-brand-600">
            {formatCurrency(Number(svc.basePrice))}
          </p>
        </div>
        <div>
          <span className="text-sm text-text-secondary">
            {t('marketing.service-detail.duration')}
          </span>
          <p className="text-2xl font-bold">
            {t('marketing.service-detail.duration-min', { min: svc.durationMin })}
          </p>
        </div>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('marketing.service-detail.options')}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <span
                key={v.id}
                className="rounded-full bg-surface-muted px-3 py-1 text-sm dark:bg-gray-800"
              >
                {localize(v.nameJson, locale)}
                {Number(v.priceDelta) > 0 ? ` (+${formatCurrency(Number(v.priceDelta))})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex gap-3">
        <Link href={`/bookings/create?serviceId=${id}`}>
          <Button size="lg">{t('marketing.service-detail.book-now')}</Button>
        </Link>
        <Link href={`/compare?ids=${id}`}>
          <Button size="lg" variant="outline">
            {t('marketing.service-detail.compare')}
          </Button>
        </Link>
      </div>

      {/* Technicians — with per-card verified badges (kycStatus) */}
      {techs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('marketing.service-detail.available-technicians')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {techs.map((ts) => {
              const tech = ts.technician ?? ({} as typeof ts.technician);
              const user = tech.user ?? ({} as typeof tech.user);
              return (
                <Card key={ts.id} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary">{user.name}</p>
                        {tech.kycStatus === 'VERIFIED' && (
                          <TrustBadge variant="verified" label={t('trust.verified')} />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {tech.city} · {Number(tech.ratingAvg ?? 0).toFixed(1)}
                      </p>
                      {tech.bioJson ? (
                        <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">
                          {localize(tech.bioJson, locale)}
                        </p>
                      ) : null}
                    </div>
                    <Link href={`/bookings/create?serviceId=${id}`}>
                      <Button size="sm">{t('marketing.service-detail.book')}</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {techs.length === 0 && (
        <div className="mt-8">
          <EmptyState title={t('marketing.service-detail.no-technicians')} />
        </div>
      )}

      {/* E6e — before/after gallery (approved shorts of the first technician) */}
      {galleryItems.length > 0 && (
        <div className="mt-12" data-testid="ba-gallery">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('gallery.beforeAfterTitle')}
            </h2>
            {galleryTechUserId && (
              <Link
                href={`/gallery/${galleryTechUserId}`}
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                {t('marketing.service-detail.view-full-gallery')}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
            {galleryItems.slice(0, 4).map((g) => (
              <ServiceImage
                key={g.id}
                src={g.thumbnailUrl ?? g.beforeImageUrl}
                alt={localize(g.titleJson as ServiceJson, locale)}
                size="full"
                className="h-32 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Related — real imagery, same category mapping as the hero */}
      {related.length > 0 && (
        <div className="mt-12" data-testid="related-services">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('marketing.service-detail.related-services')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/services/${r.id}`}>
                <Card hover padding="sm">
                  <ServiceImage
                    src={r.imageUrl}
                    service={serviceKeyFromCategorySlug(cat.slug)}
                    size="full"
                    alt={localize(r.titleJson, locale)}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {localize(r.titleJson, locale)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-brand-600">
                    {formatCurrency(Number(r.basePrice))}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

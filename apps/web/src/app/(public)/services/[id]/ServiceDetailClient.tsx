'use client';

import Link from 'next/link';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Button, Card, EmptyState, formatCurrency } from '@galaxy/ui';

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

export interface ServiceDetailData {
  id: number;
  titleJson: ServiceJson;
  descriptionJson: ServiceJson | null;
  basePrice: number;
  durationMin: number;
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
      {/* Hero */}
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-200 to-accent-200 dark:from-brand-900 dark:to-accent-900">
        <span className="text-6xl"></span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            >
              {localize(t.tag.nameJson, locale)}
            </span>
          ))}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{(cat.nameAr as string) || ''}</p>
      {desc && <p className="mt-3 text-gray-600 dark:text-gray-400">{desc}</p>}

      {/* Share */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() =>
            navigator
              .share?.({ title, url: window.location.href })
              .catch(() => navigator.clipboard.writeText(window.location.href))
          }
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
        >
          {t('marketing.service-detail.share')}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
        >
          {t('marketing.service-detail.copy-link')}
        </button>
      </div>

      <div className="mt-6 flex gap-8">
        <div>
          <span className="text-sm text-gray-500">{t('marketing.service-detail.price')}</span>
          <p className="text-2xl font-bold text-brand-600">
            {formatCurrency(Number(svc.basePrice))}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">{t('marketing.service-detail.duration')}</span>
          <p className="text-2xl font-bold">
            {t('marketing.service-detail.duration-min', { min: svc.durationMin })}
          </p>
        </div>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('marketing.service-detail.options')}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <span
                key={v.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
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

      {/* Technicians */}
      {techs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
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
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {tech.city} · {Number(tech.ratingAvg ?? 0).toFixed(1)}
                      </p>
                      {tech.bioJson ? (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
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

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('marketing.service-detail.related-services')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/services/${r.id}`}>
                <Card hover padding="sm">
                  <div className="flex h-24 items-center justify-center rounded-lg bg-gray-100 text-3xl dark:bg-gray-800"></div>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
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

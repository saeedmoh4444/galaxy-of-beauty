'use client';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

import { api } from '@/lib/trpc';
import {
  Card,
  Button,
  formatCurrency,
  ErrorAlert,
  EmptyState,
  useToast,
  useAuth,
  ServiceImage,
  TrustBadges,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import { SocialIcons } from '@/components/vendor/shared/SocialIcons';

export interface StorefrontPageData {
  store: {
    id: number;
    storeName: string;
    storeSlug: string;
    descriptionJson: { ar?: string; en?: string } | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    isVerified: boolean;
    ratingAvg: number | null;
    totalReviews: number;
    socialLinks: Record<string, string> | null;
    tierBadges: Array<'top_rated' | 'fast_fulfillment' | 'responsive_seller'>;
  } | null;
  products: Array<Record<string, unknown>>;
  productCount: number;
  fetchError?: string;
}

/** C6 — store QR code: rendered client-side from the store URL and
 *  downloadable (mirrors the service-menu QR concept). */
function StoreQrCard(): JSX.Element {
  const { t } = useLocale();
  const [qr, setQr] = useState('');

  useEffect(() => {
    void QRCode.toDataURL(window.location.href, { width: 240, margin: 1 }).then(setQr);
  }, []);

  if (!qr) return <></>;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border-muted p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt={t('stores.qr.title')} className="h-28 w-28 rounded-xl" />
      <div>
        <p className="text-sm font-semibold">{t('stores.qr.title')}</p>
        <p className="mt-1 text-xs text-text-secondary">{t('stores.qr.desc')}</p>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => {
            const a = document.createElement('a');
            a.href = qr;
            a.download = 'store-qr.png';
            a.click();
          }}
        >
          {t('stores.qr.download')}
        </Button>
      </div>
    </div>
  );
}

export function StorefrontClient({ data }: { data: StorefrontPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const addToCartMut = api.marketplace.addToCart.useMutation({
    onSuccess: () => addToast('success', t('stores.added-to-cart')),
    onError: (e) => addToast('error', e.message),
  });

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!data.store) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState title={t('stores.not-found')} />
      </div>
    );
  }

  const { store } = data;
  const bio = (store.descriptionJson ?? {}) as { ar?: string; en?: string };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* F4 — breadcrumbs (SEO): home / stores / store name. */}
      <nav aria-label={t('misc.breadcrumbs')} className="text-xs text-text-secondary">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-brand-600">
              {t('nav.home')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/stores" className="hover:text-brand-600">
              {t('stores.title')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-text-primary">
            {store.storeName}
          </li>
        </ol>
      </nav>

      {/* Store header */}
      <div className="flex items-center gap-4">
        <ServiceImage
          src={store.logoUrl ?? null}
          alt={store.storeName ?? ''}
          size="xl"
          className="h-20 w-20 rounded-2xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{store.storeName}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('stores.product-count', { count: data.productCount })}
          </p>
          <TrustBadges
            className="mt-3"
            items={[
              // B2 — computed tier badges lead the trust row.
              ...(store.tierBadges ?? []).map((badge) => ({
                variant: 'tier' as const,
                label: t(
                  badge === 'top_rated'
                    ? 'stores.badge.top-rated'
                    : badge === 'fast_fulfillment'
                      ? 'stores.badge.fast-fulfillment'
                      : 'stores.badge.responsive-seller',
                ),
              })),
              ...(store.isVerified
                ? [{ variant: 'verified' as const, label: t('stores.verified') }]
                : []),
              ...(store.totalReviews > 0
                ? [
                    {
                      variant: 'rating' as const,
                      label: t('misc.rating'),
                      value: (store.ratingAvg ?? 0).toFixed(1),
                    },
                  ]
                : []),
            ]}
          />
          {/* B6 — social presence (only networks the vendor set). */}
          <SocialIcons links={store.socialLinks} className="mt-3" />
        </div>
      </div>

      {/* Store banner — E7 KYC banner media */}
      {store.bannerUrl ? (
        <div className="overflow-hidden rounded-3xl">
          <ServiceImage
            src={store.bannerUrl}
            alt={store.storeName ?? ''}
            size="full"
            className="h-48 w-full object-cover md:h-64"
          />
        </div>
      ) : null}

      {bio[locale] ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{bio[locale]}</p>
      ) : null}

      {/* C6 — store QR code for physical-store discovery. */}
      <StoreQrCard />

      {/* Product grid */}
      {data.products.length === 0 ? (
        <EmptyState title={t('stores.empty-products')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((p: Record<string, unknown>) => (
            <Card key={p.id as number} padding="md">
              <ServiceImage
                src={(p.imageUrl as string) ?? null}
                alt={localize(p.nameJson, locale)}
                size="full"
                className="mb-3 h-32 w-full"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-text-primary">
                    {localize(p.nameJson, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-600">
                    {formatCurrency(Number(p.price ?? 0))}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('stores.stock', { count: Number(p.stock ?? 0) })}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={!isAuthenticated || Number(p.stock ?? 0) <= 0}
                  loading={addToCartMut.isPending}
                  onClick={() => {
                    if (isAuthenticated) {
                      addToCartMut.mutate({ productId: p.id as number, quantity: 1 });
                    } else {
                      addToast('warning', t('stores.login-to-buy'));
                    }
                  }}
                >
                  {t('stores.add-to-cart')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

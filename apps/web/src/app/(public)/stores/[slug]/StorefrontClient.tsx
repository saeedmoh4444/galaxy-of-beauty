'use client';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ReelCard,
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
    recentReviews: Array<{
      id: number;
      rating: number;
      comment: string;
      createdAt: string;
      replied: boolean;
      replyAr: string;
      replyEn: string;
      productNameAr: string;
      productNameEn: string;
      customerName: string;
    }>;
    // C5 — hybrid store-services: the store's bookable services.
    services?: Array<{
      id: number;
      titleJson: { ar?: string; en?: string } | null;
      descriptionJson: { ar?: string; en?: string } | null;
      basePrice: number;
      durationMin: number;
      imageUrl: string | null;
    }>;
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
  const router = useRouter();
  // C4c — the gallery image selected per product (thumbnail hover).
  const [galleryImage, setGalleryImage] = useState<Record<number, string>>({});
  // C1c — the selected variant per product (picker state).
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const addToCartMut = api.marketplace.addToCart.useMutation({
    onSuccess: () => addToast('success', t('stores.added-to-cart')),
    onError: (e) => addToast('error', e.message),
  });

  // R4 — shoppable reels strip (REELS_SHOPPABLE_PLAN): approved reels
  // attached to this store. Poster-first tiles, hover-play, no eager video.
  const reelsQ = api.beautyShorts.surfaceShorts.useQuery(
    { vendorId: data.store?.id ?? 0 },
    { enabled: Boolean(data.store?.id), refetchOnWindowFocus: false },
  );
  const storeReels = (reelsQ.data ?? []) as Array<Record<string, unknown>>;

  // B5 — one store-view per browser session (the funnel input).
  const trackViewMut = api.marketplace.trackStoreView.useMutation();
  useEffect(() => {
    const slug = data.store?.storeSlug;
    if (!slug) return;
    const key = `gob-store-view-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Private browsing: still track, just without the session guard.
    }
    void trackViewMut.mutate({ slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.store?.storeSlug]);

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
          {data.products.map((p: Record<string, unknown>) => {
            // C4c — gallery + video + AR: the main image switches on
            // thumbnail hover; the alt ladder = name (en → ar).
            const gallery = (p.images as string[] | undefined) ?? [];
            const nameText = localize(p.nameJson, locale);
            const activeImage =
              (galleryImage[Number(p.id)] as string | undefined) ?? (p.imageUrl as string) ?? null;
            // C1c — variant picker: chips with the final price; the add
            // button below targets the selected variant.
            const variants = ((p as { variants?: Array<Record<string, unknown>> }).variants ??
              []) as Array<{
              id: number;
              nameJson?: { ar?: string; en?: string } | null;
              priceDelta?: string | number;
              stock?: number;
            }>;
            const selectedVariant = variants.find((v) => v.id === selectedVariants[Number(p.id)]);
            return (
              <Card key={p.id as number} padding="md">
                {activeImage ? (
                  <ServiceImage
                    src={activeImage}
                    alt={nameText}
                    size="full"
                    className="mb-3 h-32 w-full"
                  />
                ) : null}
                {gallery.length > 0 ? (
                  <div className="mb-3 flex gap-2 overflow-x-auto">
                    {gallery.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onMouseEnter={() =>
                          setGalleryImage((prev) => ({ ...prev, [Number(p.id)]: src }))
                        }
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
                          activeImage === src ? 'border-brand-500' : 'border-border-muted'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={nameText} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
                {p.videoUrl ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={p.videoUrl as string}
                    controls
                    preload="none"
                    className="mb-3 w-full rounded-lg"
                  />
                ) : null}
                {p.arTryOnUrl ? (
                  <a
                    href={p.arTryOnUrl as string}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  >
                    ✨ {t('stores.ar-try-on')}
                  </a>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary">{nameText}</p>
                    {variants.length > 0 ? (
                      <div
                        className="mt-2 flex flex-wrap gap-1.5"
                        role="group"
                        aria-label={t('stores.variant-select')}
                      >
                        {variants.map((v) => {
                          const active = selectedVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [Number(p.id)]: v.id,
                                }))
                              }
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                active
                                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                                  : 'border-border-muted text-text-secondary hover:bg-surface-muted'
                              }`}
                            >
                              {(v.nameJson as { ar?: string; en?: string } | null)?.[
                                locale === 'ar' ? 'ar' : 'en'
                              ] ?? `#${v.id}`}
                              {Number(v.priceDelta ?? 0) !== 0
                                ? ` · ${formatCurrency(Number(p.price ?? 0) + Number(v.priceDelta ?? 0))}`
                                : ''}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <p className="mt-1 text-sm font-semibold text-brand-600">
                      {formatCurrency(
                        Number(p.price ?? 0) + Number(selectedVariant?.priceDelta ?? 0),
                      )}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t('stores.stock', {
                        count: selectedVariant
                          ? Number(selectedVariant.stock ?? 0)
                          : Number(p.stock ?? 0),
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={!isAuthenticated || Number(p.stock ?? 0) <= 0}
                    loading={addToCartMut.isPending}
                    onClick={() => {
                      if (isAuthenticated) {
                        addToCartMut.mutate({
                          productId: p.id as number,
                          quantity: 1,
                          variantId: selectedVariants[Number(p.id)],
                        });
                      } else {
                        addToast('warning', t('stores.login-to-buy'));
                      }
                    }}
                  >
                    {t('stores.add-to-cart')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* R4 — store reel strip: approved reels attached to this store.
          Rendered only when the store has reels (no empty-state noise). */}
      {storeReels.length > 0 && (
        <section aria-label={t('beautyShorts.storeReels')} data-testid="store-reels">
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            {t('beautyShorts.storeReels')}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {storeReels.map((s) => (
              <ReelCard
                key={s.id as number}
                title={localize(s.titleJson as { ar?: string; en?: string }, locale)}
                videoUrl={s.videoUrl as string | null}
                thumbnailUrl={s.thumbnailUrl as string | null}
                beforeImageUrl={s.beforeImageUrl as string | null}
                durationSec={Number(s.durationSec ?? 0)}
                views={Number(s.views ?? 0)}
                className="shrink-0"
              />
            ))}
          </div>
        </section>
      )}

      {/* C5 — hybrid store-services: bookable services ride the booking
          engine; the create page auto-resolves the store's provider. */}
      {(data.store?.services ?? []).length > 0 && (
        <section aria-label={t('stores.services.title')}>
          <h2 className="mb-3 text-lg font-bold text-text-primary">{t('stores.services.title')}</h2>
          <div className="space-y-3">
            {(data.store!.services ?? []).map((s) => (
              <Card key={s.id} padding="md" className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{localize(s.titleJson, locale)}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatCurrency(Number(s.basePrice))} · {s.durationMin}{' '}
                    {t('stores.services.minutes')}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push(`/bookings/create?serviceId=${s.id}`);
                    } else {
                      addToast('warning', t('stores.login-to-buy'));
                    }
                  }}
                >
                  {t('stores.services.book')}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* B3 — review showcase: recent reviews WITH owner replies. */}
      {(data.store?.recentReviews ?? []).length > 0 && (
        <section aria-label={t('stores.reviews.title')}>
          <h2 className="mb-3 text-lg font-bold text-text-primary">{t('stores.reviews.title')}</h2>
          <div className="space-y-3">
            {data.store!.recentReviews.map((r) => (
              <Card key={r.id} padding="md" className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">
                    {'★'.repeat(r.rating)}
                    <span className="ml-2 font-normal text-text-secondary">
                      {r.customerName} · {r.productNameAr || r.productNameEn}
                    </span>
                  </p>
                  {r.replied && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      {t('stores.reviews.replied')}
                    </span>
                  )}
                </div>
                {r.comment && <p className="text-sm text-text-primary">{r.comment}</p>}
                {r.replied && (
                  <p className="rounded-lg bg-surface-elevated p-2 text-sm text-text-secondary">
                    <span className="font-semibold">{t('stores.reviews.ownerReply')}: </span>
                    {locale === 'ar' ? r.replyAr : r.replyEn || r.replyAr}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

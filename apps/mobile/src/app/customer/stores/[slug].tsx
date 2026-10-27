import type { JSX } from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ServiceImage } from '@/components/ServiceImage';
import { SkeletonList } from '@/components/SkeletonCard';
import { TrustChips } from '@/components/TrustChips';
import { SocialIconsRow } from '@/components/SocialIconsRow';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useEffect } from 'react';

/** B5 — session-level store-view dedupe (one per store per app session). */
const trackedStoreViews = new Set<string>();
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';
import { useHaptics } from '@/hooks/useHaptics';

interface StoreDetail {
  id?: number;
  storeName?: string;
  descriptionJson?: { ar?: string; en?: string } | null;
  ratingAvg?: number;
  totalReviews?: number;
  isVerified?: boolean;
  bannerUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  tierBadges?: Array<'top_rated' | 'fast_fulfillment' | 'responsive_seller'>;
  recentReviews?: Array<{
    id?: number;
    rating?: number;
    comment?: string | null;
    replied?: boolean;
    replyAr?: string;
    replyEn?: string;
    productNameAr?: string;
    customerName?: string;
  }>;
  products?: Array<{
    id?: number;
    nameJson?: { ar?: string; en?: string };
    price?: number;
    stock?: number;
    variants?: Array<{
      id?: number;
      nameJson?: { ar?: string; en?: string };
      priceDelta?: number;
      stock?: number;
    }>;
  }>;
  // C5 — hybrid store-services (mobile Services section).
  services?: Array<{
    id?: number;
    titleJson?: { ar?: string; en?: string };
    basePrice?: number;
    durationMin?: number;
  }>;
}

export default function StoreDetailScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const isAuthed = useAuthState();
  const { showToast } = useToast();
  // 5.5 Mobile polish — haptic feedback on cart add.
  const { trigger } = useHaptics();

  const detailQ = trpc.marketplace.vendorDetail.useQuery({ slug: slug ?? '' });
  const trackViewMut = trpc.marketplace.trackStoreView.useMutation();
  const addToCartMut = trpc.marketplace.addToCart.useMutation({
    onSuccess: () => {
      trigger('success');
      showToast('success', t('mobile.stores.added-to-cart'));
    },
  });

  const store = detailQ.data as unknown as StoreDetail | null;
  const products = store?.products ?? [];

  // C1d — the selected variant per product (picker state).
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

  // B5 — one store-view per app session (the funnel input).
  useEffect(() => {
    if (slug && store && !trackedStoreViews.has(slug)) {
      trackedStoreViews.add(slug);
      void trackViewMut.mutate({ slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, store]);

  if (detailQ.isLoading) return <SkeletonList count={4} />;
  if (detailQ.isError || !store)
    return <ErrorAlert message={t('mobile.stores.not-found')} onRetry={() => detailQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={detailQ.isRefetching}
          onRefresh={async () => {
            await detailQ.refetch();
          }}
        />
      }
    >
      <Text style={s.name}>{store.storeName}</Text>
      <TrustChips
        verifiedLabel={store.isVerified ? t('mobile.stores.verified') : undefined}
        rating={store.ratingAvg}
        reviews={store.totalReviews}
        tierLabels={(store.tierBadges ?? []).map((badge) =>
          t(
            badge === 'top_rated'
              ? 'mobile.stores.badge.top-rated'
              : badge === 'fast_fulfillment'
                ? 'mobile.stores.badge.fast-fulfillment'
                : 'mobile.stores.badge.responsive-seller',
          ),
        )}
      />
      {/* B6 — social presence (only networks the vendor set). */}
      <SocialIconsRow links={store.socialLinks} />
      {store.bannerUrl ? (
        <ServiceImage
          src={store.bannerUrl}
          alt={store.storeName ?? ''}
          height={160}
          style={s.banner}
        />
      ) : null}

      {products.map((p, idx) => {
        const variants = p.variants ?? [];
        const selected = variants.find((v) => v.id === selectedVariants[Number(p.id)]);
        const price = Number(p.price ?? 0) + Number(selected?.priceDelta ?? 0);
        const stock = selected ? Number(selected.stock ?? 0) : Number(p.stock ?? 0);
        return (
          <View key={p.id ?? idx} style={s.card}>
            <View style={s.pBody}>
              <Text style={s.pName}>{localize(p.nameJson, locale)}</Text>
              {/* C1d — variant chips (label + final price). */}
              {variants.length > 0 ? (
                <View style={s.chips}>
                  {variants.map((v) => {
                    const active = selected?.id === v.id;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() =>
                          setSelectedVariants((prev) => ({ ...prev, [Number(p.id)]: Number(v.id) }))
                        }
                        style={[s.chip, active && s.chipActive]}
                      >
                        <Text style={[s.chipText, active && s.chipTextActive]}>
                          {(v.nameJson as { ar?: string; en?: string } | null)?.[
                            locale === 'ar' ? 'ar' : 'en'
                          ] ?? ''}
                          {Number(v.priceDelta ?? 0) !== 0
                            ? ` · ${(Number(p.price ?? 0) + Number(v.priceDelta ?? 0)).toFixed(0)}`
                            : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
              <Text style={s.pPrice}>
                {price.toFixed(0)} {t('misc.sar')}
              </Text>
              <Text style={s.pStock}>{t('mobile.stores.stock', { count: stock })}</Text>
            </View>
            <TouchableOpacity
              style={[s.buyBtn, (!isAuthed || stock <= 0) && s.buyBtnDisabled]}
              disabled={!isAuthed || stock <= 0}
              onPress={() => {
                if (isAuthed && p.id)
                  addToCartMut.mutate({
                    productId: p.id,
                    quantity: 1,
                    variantId: selectedVariants[Number(p.id)],
                  });
                else showToast('warning', t('mobile.stores.login-to-buy'));
              }}
            >
              <Text style={s.buyText}>{t('mobile.stores.add-to-cart')}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {products.length === 0 && <Text style={s.empty}>{t('mobile.stores.empty-products')}</Text>}

      {/* C5 — hybrid store-services: bookable services (the service detail
          screen auto-resolves the store's provider). */}
      {(store?.services ?? []).length > 0 && (
        <View style={s.svcWrap}>
          <Text style={s.reviewsTitle}>{t('mobile.stores.services.title')}</Text>
          {(store!.services ?? []).map((svc, idx) => (
            <View key={svc.id ?? idx} style={s.svcCard}>
              <View style={s.svcBody}>
                <Text style={s.svcName}>{localize(svc.titleJson, locale)}</Text>
                <Text style={s.svcMeta}>
                  {Number(svc.basePrice ?? 0).toFixed(0)} {t('misc.sar')} · {svc.durationMin ?? 0}{' '}
                  {t('mobile.stores.services.minutes')}
                </Text>
              </View>
              <TouchableOpacity
                style={s.svcBtn}
                disabled={!isAuthed}
                onPress={() => {
                  if (isAuthed && svc.id) {
                    router.push(`/services/${svc.id}` as never);
                  } else {
                    showToast('warning', t('mobile.stores.login-to-buy'));
                  }
                }}
              >
                <Text style={s.svcBtnText}>{t('mobile.stores.services.book')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* B3 — review showcase (recent reviews with owner replies). */}
      {(store.recentReviews ?? []).length > 0 && (
        <View style={s.reviewsWrap}>
          <Text style={s.reviewsTitle}>{t('mobile.stores.reviews.title')}</Text>
          {(store.recentReviews ?? []).map((r, idx) => (
            <View key={r.id ?? idx} style={s.reviewCard}>
              <Text style={s.reviewMeta}>
                {'★'.repeat(r.rating ?? 0)} {r.customerName ?? ''} · {r.productNameAr ?? ''}
              </Text>
              {r.comment ? <Text style={s.reviewBody}>{r.comment}</Text> : null}
              {r.replied ? (
                <Text style={s.reviewReply}>
                  {t('mobile.stores.reviews.ownerReply')}:{' '}
                  {locale === 'ar' ? r.replyAr : r.replyEn || r.replyAr}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  banner: { width: '100%', borderRadius: 20, marginTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  pBody: { flex: 1 },
  pName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  pPrice: { fontSize: 14, fontWeight: '700', color: '#7c3aed', marginTop: 2 },
  pStock: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  // C1d — variant chips.
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  chipText: { fontSize: 11, color: '#6b7280' },
  chipTextActive: { color: '#7c3aed', fontWeight: '700' },
  buyBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buyBtnDisabled: { opacity: 0.5 },
  buyText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
  reviewsWrap: { marginTop: 24 },
  svcWrap: { marginTop: 24 },
  svcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  svcBody: { flex: 1 },
  svcName: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  svcMeta: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  svcBtn: {
    backgroundColor: '#e11d48',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  svcBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  reviewMeta: { fontSize: 12, fontWeight: '700', color: '#374151', textAlign: 'right' },
  reviewBody: { fontSize: 13, color: '#111827', textAlign: 'right', marginTop: 4 },
  reviewReply: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 6,
  },
});

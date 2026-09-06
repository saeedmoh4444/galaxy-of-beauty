import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';

interface StoreDetail {
  id?: number;
  storeName?: string;
  descriptionJson?: { ar?: string; en?: string } | null;
  ratingAvg?: number;
  totalReviews?: number;
  isVerified?: boolean;
  products?: Array<{
    id?: number;
    nameJson?: { ar?: string; en?: string };
    price?: number;
    stock?: number;
  }>;
}

export default function StoreDetailScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isAuthed = useAuthState();
  const { showToast } = useToast();

  const detailQ = trpc.marketplace.vendorDetail.useQuery({ slug: slug ?? '' });
  const addToCartMut = trpc.marketplace.addToCart.useMutation({
    onSuccess: () => showToast('success', t('mobile.stores.added-to-cart')),
  });

  const store = detailQ.data as unknown as StoreDetail | null;
  const products = store?.products ?? [];

  if (detailQ.isLoading) return <SkeletonList count={4} />;
  if (detailQ.isError || !store)
    return <ErrorAlert message={t('mobile.stores.not-found')} onRetry={() => detailQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={detailQ.isRefetching} onRefresh={() => detailQ.refetch()} />
      }
    >
      <Text style={s.name}>{store.storeName}</Text>
      <Text style={s.meta}>
        ⭐ {Number(store.ratingAvg ?? 0).toFixed(1)} ({store.totalReviews ?? 0}) ·{' '}
        {store.isVerified ? t('mobile.stores.verified') : ''}
      </Text>

      {products.map((p, idx) => (
        <View key={p.id ?? idx} style={s.card}>
          <View style={s.pBody}>
            <Text style={s.pName}>{localize(p.nameJson, locale)}</Text>
            <Text style={s.pPrice}>
              {Number(p.price ?? 0).toFixed(0)} {t('misc.sar')}
            </Text>
            <Text style={s.pStock}>
              {t('mobile.stores.stock', { count: Number(p.stock ?? 0) })}
            </Text>
          </View>
          <TouchableOpacity
            style={[s.buyBtn, (!isAuthed || Number(p.stock ?? 0) <= 0) && s.buyBtnDisabled]}
            disabled={!isAuthed || Number(p.stock ?? 0) <= 0}
            onPress={() => {
              if (isAuthed && p.id) addToCartMut.mutate({ productId: p.id, quantity: 1 });
              else showToast('warning', t('mobile.stores.login-to-buy'));
            }}
          >
            <Text style={s.buyText}>{t('mobile.stores.add-to-cart')}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {products.length === 0 && <Text style={s.empty}>{t('mobile.stores.empty-products')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 16 },
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
  buyBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buyBtnDisabled: { opacity: 0.5 },
  buyText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});

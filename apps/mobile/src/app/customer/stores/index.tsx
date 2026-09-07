import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface StoreItem {
  id?: number;
  storeName?: string;
  storeSlug?: string;
  logoUrl?: string | null;
  ratingAvg?: number;
  totalReviews?: number;
  _count?: { products?: number };
}

export default function StoresScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const storesQ = trpc.marketplace.vendors.useQuery({ page: 1, limit: 50 });

  const stores: StoreItem[] = Array.isArray(
    (storesQ.data as unknown as { items?: StoreItem[] } | null)?.items,
  )
    ? ((storesQ.data as unknown as { items: StoreItem[] }).items as StoreItem[])
    : [];

  if (storesQ.isLoading) return <SkeletonList count={6} />;
  if (storesQ.isError)
    return <ErrorAlert message={t('mobile.stores.load-error')} onRetry={() => storesQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={storesQ.isRefetching} onRefresh={() => storesQ.refetch()} />
      }
    >
      <Text style={s.title}>{t('mobile.stores.title')}</Text>
      {stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          style={s.card}
          onPress={() => router.push(`/customer/stores/${store.storeSlug ?? ''}`)}
        >
          <View style={s.icon}>
            <Text style={s.iconText}>🛍️</Text>
          </View>
          <View style={s.body}>
            <Text style={s.name}>{store.storeName ?? ''}</Text>
            <Text style={s.meta}>
              ⭐ {Number(store.ratingAvg ?? 0).toFixed(1)} ({store.totalReviews ?? 0}) ·{' '}
              {store._count?.products ?? 0} {t('mobile.stores.products')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      {stores.length === 0 && <Text style={s.empty}>{t('mobile.stores.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});

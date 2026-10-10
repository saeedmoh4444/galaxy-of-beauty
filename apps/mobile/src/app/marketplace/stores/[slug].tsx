import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

// S2 — mobile store detail: logo, name, product grid (marketplace.vendorDetail).
export default function StoreDetailScreen(): JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useLocale();
  const q = trpc.marketplace.vendorDetail.useQuery({ slug: slug ?? '' }, { enabled: !!slug });
  const store = q.data as unknown as
    | {
        storeName?: string;
        logoUrl?: string | null;
        products?: Array<{ id?: number; nameAr?: string; price?: number; emoji?: string }>;
      }
    | undefined;

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.marketplace.store-load-error')}
        onRetry={() => q.refetch()}
      />
    );

  const products = store?.products ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#db2777']}
        />
      }
    >
      <View style={styles.header}>
        {store?.logoUrl ? (
          <Image source={{ uri: store.logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoEmoji}>🏬</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{store?.storeName ?? ''}</Text>
          <Text style={styles.meta}>
            {t('mobile.public.marketplace.store-product-count', {
              count: products.length,
            })}
          </Text>
        </View>
      </View>

      {products.length === 0 ? (
        <Text style={styles.empty}>{t('mobile.public.marketplace.store-products-empty')}</Text>
      ) : (
        <View style={styles.grid}>
          {products.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.ci}>
                <Text style={styles.ce}>{p.emoji ?? ''}</Text>
              </View>
              <Text style={styles.ct}>{p.nameAr ?? ''}</Text>
              <Text style={styles.cp}>
                {t('mobile.public.currency', { price: p.price?.toLocaleString() ?? '' })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#fce7f3' },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 28 },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'right' },
  meta: { fontSize: 13, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  empty: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  ci: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ce: { fontSize: 40 },
  ct: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cp: { fontSize: 14, fontWeight: '800', color: '#db2777', textAlign: 'right', marginTop: 4 },
});

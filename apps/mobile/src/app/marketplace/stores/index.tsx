import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

// S2 — mobile store browsing: verified marketplace stores with product counts.
export default function StoresScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();
  const q = trpc.marketplace.vendors.useQuery({ limit: 50 });
  const stores =
    (q.data as unknown as { items?: Array<Record<string, unknown>> } | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.marketplace.stores-load-error')}
        onRetry={() => q.refetch()}
      />
    );

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
      <Text style={styles.t}>{t('mobile.public.marketplace.stores-title')}</Text>

      {stores.length === 0 ? (
        <Text style={styles.empty}>{t('mobile.public.marketplace.stores-empty')}</Text>
      ) : (
        stores.map((s) => (
          <TouchableOpacity
            key={s.id as number}
            testID={`store-card-${s.storeSlug as string}`}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/marketplace/stores/${s.storeSlug as string}` as never)}
          >
            {s.logoUrl ? (
              <Image source={{ uri: s.logoUrl as string }} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoEmoji}>🏬</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{s.storeName as string}</Text>
              <Text style={styles.meta}>
                {t('mobile.public.marketplace.store-product-count', {
                  count: (s._count as Record<string, number> | undefined)?.products ?? 0,
                })}
              </Text>
              {/* S5 — denormalized store rating (kept fresh by product reviews). */}
              {Number(s.totalReviews ?? 0) > 0 && (
                <Text style={styles.meta}>
                  {t('mobile.public.marketplace.store-rating', {
                    rating: Number(s.ratingAvg ?? 0).toFixed(1),
                    count: Number(s.totalReviews ?? 0),
                  })}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  empty: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  logo: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#fce7f3' },
  logoFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  meta: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
});

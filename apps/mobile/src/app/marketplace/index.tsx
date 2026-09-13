import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface MarketplaceProduct {
  id?: number;
  emoji?: string;
  nameAr?: string;
  titleAr?: string;
  price?: number;
}

export default function MarketplaceScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.marketplace.products.useQuery({});
  const products = (q.data as unknown as { items?: MarketplaceProduct[] } | null)?.items ?? [];
  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.public.marketplace.load-error')} onRetry={() => q.refetch()} />
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.marketplace.title')}</Text>
      <View style={styles.grid}>
        {products.map((p) => (
          <TouchableOpacity key={p.id} style={styles.card}>
            <View style={styles.ci}>
              <Text style={styles.ce}>{p.emoji ?? ''}</Text>
            </View>
            <Text style={styles.ct}>{p.nameAr ?? p.titleAr}</Text>
            <Text style={styles.cp}>
              {t('mobile.public.currency', { price: p.price?.toLocaleString() ?? '' })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
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

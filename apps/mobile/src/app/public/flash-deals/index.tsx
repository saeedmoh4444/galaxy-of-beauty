import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

export default function FlashDealsScreen(): JSX.Element {
  const { t } = useLocale();
  const dealsQ = trpc.flashDeals.active.useQuery();

  if (dealsQ.isLoading) return <SkeletonList count={4} />;
  if (dealsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.flash-deals.load-error')}
        onRetry={() => dealsQ.refetch()}
      />
    );

  const items = (dealsQ.data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dealsQ.isRefetching}
          onRefresh={() => dealsQ.refetch()}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.flash-deals.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.flash-deals.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.flash-deals.empty')}</Text>
      ) : (
        items.map((d: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.dealEmoji}>{(d.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dealName}>{d.nameAr as string}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.oldPrice}>
                  {(d.originalPrice as number)?.toLocaleString()} {t('misc.sar')}
                </Text>
                <Text style={styles.newPrice}>
                  {(d.price as number)?.toLocaleString()} {t('misc.sar')}
                </Text>
              </View>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{d.discount as number}%</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  dealEmoji: { fontSize: 32 },
  dealName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  priceRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  oldPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 16, fontWeight: '800', color: '#dc2626' },
  discountBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
});

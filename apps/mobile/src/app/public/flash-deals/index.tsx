import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

export default function FlashDealsScreen(): JSX.Element {
  const {
    data: deals,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => rawTrpc.flashDeals.active.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل العروض" onRetry={refetch} />;

  const items = (deals ?? []) as Record<string, unknown>[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#dc2626']} />
      }
    >
      <Text style={styles.t}> عروض فلاش</Text>
      <Text style={styles.sub}>عروض لفترة محدودة — سارعي!</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد عروض حالية</Text>
      ) : (
        items.map((d: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.dealEmoji}>{(d.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dealName}>{d.nameAr as string}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.oldPrice}>
                  {(d.originalPrice as number)?.toLocaleString()} ر.س
                </Text>
                <Text style={styles.newPrice}>{(d.price as number)?.toLocaleString()} ر.س</Text>
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

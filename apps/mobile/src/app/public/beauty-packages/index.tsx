import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface BeautyPackage {
  id?: number;
  emoji?: string;
  nameAr?: string;
  services?: string;
  serviceCount?: number;
  originalPrice?: number;
  price?: number;
  savings?: number;
}

export default function BeautyPackagesScreen(): JSX.Element {
  const {
    data: packages,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().beautyPackages.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الباقات" onRetry={refetch} />;

  const items = (packages ?? []) as BeautyPackage[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={styles.t}> باقات التجميل</Text>
      <Text style={styles.sub}>باقات مجمعة بأسعار مخفضة</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد باقات</Text>
      ) : (
        items.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.pkgEmoji}>{(p.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pkgName}>{p.nameAr as string}</Text>
              <Text style={styles.pkgServices}>
                {(p.services as string) ?? (p.serviceCount as number) + ' خدمات'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.originalPrice}>
                {(p.originalPrice as number)?.toLocaleString()} ر.س
              </Text>
              <Text style={styles.price}>{(p.price as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.savings}>وفر {(p.savings as number)?.toLocaleString()} ر.س</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
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
  pkgEmoji: { fontSize: 32 },
  pkgName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  pkgServices: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  originalPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  price: { fontSize: 18, fontWeight: '800', color: '#db2777' },
  savings: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
});

import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function GroupBuyScreen(): JSX.Element {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).groupBuy.deals.query() as any)
      .then((d: any) => {
        setDeals(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> شراء جماعي</Text>
      {deals.map((d: any) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.de}>{(d.emoji as string) ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dn}>{d.nameAr as string}</Text>
            <Text style={styles.dp}>{(d.price as number)?.toLocaleString()} ر.س</Text>
            <Text style={styles.dm}>
              {d.buyers as number} / {d.minBuyers as number} مشترين
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  de: { fontSize: 32 },
  dn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dp: { fontSize: 15, fontWeight: '700', color: '#059669', marginTop: 2 },
  dm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});

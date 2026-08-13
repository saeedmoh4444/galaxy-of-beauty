import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface GroupDeal {
  id?: number;
  emoji?: string;
  nameAr?: string;
  price?: number;
  buyers?: number;
  minBuyers?: number;
}

export default function GroupBuyScreen(): JSX.Element {
  const [deals, setDeals] = useState<GroupDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().groupBuy.deals.query() as Promise<GroupDeal[]>)
      .then((d: GroupDeal[]) => {
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
      {deals.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.de}>{d.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dn}>{d.nameAr ?? ''}</Text>
            <Text style={styles.dp}>{(d.price ?? 0).toLocaleString()} ر.س</Text>
            <Text style={styles.dm}>
              {d.buyers ?? 0} / {d.minBuyers ?? 0} مشترين
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

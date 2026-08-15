import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface SaleAlert {
  id?: number;
  emoji?: string;
  serviceName?: string;
  discount?: number;
}

export default function SaleAlertsScreen(): JSX.Element {
  const [data, setData] = useState<SaleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .saleAlerts.list.query()
      .then((d: SaleAlert[]) => {
        setData(d || []);
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
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>️ تنبيهات التخفيضات</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{a.emoji ?? '️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.serviceName}</Text>
            <Text style={styles.discount}>-{a.discount}%</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  discount: { fontSize: 13, fontWeight: '700', color: '#dc2626', marginTop: 2 },
});

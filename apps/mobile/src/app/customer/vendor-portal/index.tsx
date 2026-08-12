import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function VendorPortalScreen(): JSX.Element {
  const [dash, setDash] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      (trpc as any).vendorPortal.dashboard.query() as any,
      (trpc as any).vendorPortal.myProducts.query() as any,
    ])
      .then(([d, p]: any[]) => {
        setDash(d);
        setProducts(p || []);
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
  const remove = (id: number) => {
    ((trpc as any).vendorPortal.deleteProduct.mutate({ id }) as any).then(() => fetch());
  };
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>🏪 بوابة البائعين</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}>📦</Text>
          <Text style={styles.kv}>{(dash?.totalProducts as number) ?? 0}</Text>
          <Text style={styles.kl}>منتجات</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}>💰</Text>
          <Text style={[styles.kv, { color: '#059669' }]}>
            {((dash?.totalRevenue as number) ?? 0)?.toLocaleString()}
          </Text>
          <Text style={styles.kl}>ر.س</Text>
        </View>
      </View>
      {products.map((p: any) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.em}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{p.name as string}</Text>
            <Text style={styles.meta}>{(p.price as number)?.toLocaleString()} ر.س</Text>
          </View>
          <TouchableOpacity onPress={() => remove(p.id)}>
            <Text style={styles.del}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 22, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});

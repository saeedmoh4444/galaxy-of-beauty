import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ExpiryTrackerScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).expiryTracker.myItems.query() as any)
      .then((d: any) => {
        setItems(d || []);
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
    ((trpc as any).expiryTracker.delete.mutate({ id }) as any).then(() => fetch());
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
          colors={['#ef4444']}
        />
      }
    >
      <Text style={styles.t}>️ متعقب الصلاحية</Text>
      {items.map((i: any) => (
        <View key={i.id} style={[styles.card, i.expired && styles.exp, i.isClose && styles.close]}>
          <Text style={styles.em}>{i.emoji as string}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{i.productName as string}</Text>
            <Text style={styles.meta}>ينتهي بعد {i.expiryMonths as number} شهر</Text>
          </View>
          <TouchableOpacity onPress={() => remove(i.id)}>
            <Text style={styles.del}>️</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  exp: { borderWidth: 2, borderColor: '#fca5a5', opacity: 0.7 },
  close: { borderWidth: 2, borderColor: '#fcd34d' },
  em: { fontSize: 32 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});

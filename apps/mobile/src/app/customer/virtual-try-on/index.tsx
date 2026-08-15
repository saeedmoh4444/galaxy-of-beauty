import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface TryOnProduct {
  id?: number;
  hex?: string;
  nameAr?: string;
}

export default function VirtualTryOnScreen(): JSX.Element {
  const [data, setData] = useState<TryOnProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    rawTrpc.virtualTryOn.palettes
      .query()
      .then((d) => {
        setData(Object.values(d).flat() as unknown as TryOnProduct[]);
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
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> تجربة افتراضية</Text>
      <Text style={styles.sub}>جربي ألوان المكياج افتراضياً</Text>
      {data.map((p, i) => (
        <TouchableOpacity key={i} style={styles.card}>
          <View style={[styles.swatch, { backgroundColor: p.hex }]} />
          <Text style={styles.name}>{p.nameAr}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
});

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function SubscriptionBoxesScreen(): JSX.Element {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().subscriptionBoxes.list.query() as any)
      .then((d: any) => {
        setBoxes(d || []);
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
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}> الصناديق الشهرية</Text>
      {boxes.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.be}>{(b.emoji as string) ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bn}>{b.nameAr as string}</Text>
            <Text style={styles.bd}>{(b.descAr as string)?.substring(0, 80)}</Text>
            <Text style={styles.bi}> {b.itemCount as number} منتجات</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bp}>{(b.price as number)?.toLocaleString()} ر.س</Text>
            <Text style={styles.bper}>/شهرياً</Text>
            <TouchableOpacity style={styles.sb}>
              <Text style={styles.sbt}>اشتراك</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  be: { fontSize: 36 },
  bn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  bd: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  bi: { fontSize: 12, color: '#7c3aed', marginTop: 4 },
  bp: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  bper: { fontSize: 11, color: '#9ca3af' },
  sb: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
  },
  sbt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

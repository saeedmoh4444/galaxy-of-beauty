import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function VIPMembershipScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().vipMembership.status.query() as any)
      .then((d: any) => {
        setData(d);
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
  if (loading) return <SkeletonList count={3} />;
  const tiers = (data?.tiers ?? []) as any[];
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
      <Text style={styles.t}> العضوية المميزة</Text>
      {tiers.map((t: any, i: number) => (
        <View key={i} style={[styles.card, { borderColor: (t.color as string) ?? '#e5e7eb' }]}>
          <Text style={styles.emoji}>{t.emoji as string}</Text>
          <Text style={styles.name}>{t.nameAr as string}</Text>
          <Text style={styles.price}>{(t.price as number)?.toLocaleString()} ر.س</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#7c3aed', marginTop: 2 },
});

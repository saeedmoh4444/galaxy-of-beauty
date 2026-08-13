import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function TechniciansScreen(): JSX.Element {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().technicians.list.query({}) as any)
      .then((d: any) => {
        setTechs(d || []);
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
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>‍ الفنيات</Text>
      {techs.map((t: any) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.av}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name as string}</Text>
            <Text style={styles.ts}>{(t.specialtyAr as string) ?? (t.specialty as string)}</Text>
            <View style={styles.tm}>
              <Text style={styles.tr}> {(t.rating as number) ?? 0}</Text>
              <Text style={styles.tb}> {(t.totalBookings as number) ?? 0} حجز</Text>
              <Text style={styles.tp}>{(t.startingPrice as number)?.toLocaleString()} ر.س</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  av: { fontSize: 40 },
  tn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ts: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  tm: { flexDirection: 'row', gap: 12, marginTop: 6 },
  tr: { fontSize: 12, color: '#f59e0b' },
  tb: { fontSize: 12, color: '#6b7280' },
  tp: { fontSize: 13, fontWeight: '700', color: '#db2777' },
});

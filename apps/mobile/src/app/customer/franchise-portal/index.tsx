import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function FranchisePortalScreen(): JSX.Element {
  const [dash, setDash] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      typedTrpc().franchisePortal.dashboard.query() as any,
      typedTrpc().franchisePortal.locations.query() as any,
    ])
      .then(([d, l]: any[]) => {
        setDash(d);
        setLocations(l || []);
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
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> بوابة الامتياز</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>{((dash?.totalRevenue as number) ?? 0)?.toLocaleString()}</Text>
          <Text style={styles.kl}>الإيرادات</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#2563eb' }]}>
            {(dash?.totalBookings as number) ?? 0}
          </Text>
          <Text style={styles.kl}>حجز</Text>
        </View>
      </View>
      {locations.map((l: any) => (
        <View key={l.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ln}>{l.branch as string}</Text>
            <Text style={styles.lm}>
               {l.city as string} · {l.staff as number} موظفات
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.lb}>{l.bookings as number} حجز</Text>
            <Text style={styles.lr}>{(l.revenue as number)?.toLocaleString()} ر.س</Text>
            <View style={[styles.badge, l.status === 'active' ? styles.ba : styles.bp]}>
              <Text style={styles.bt}>{l.status === 'active' ? 'نشط' : 'معلق'}</Text>
            </View>
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
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 24, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ln: { fontSize: 14, fontWeight: '600', color: '#111827' },
  lm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  lb: { fontSize: 12, color: '#6b7280' },
  lr: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  ba: { backgroundColor: '#dcfce7' },
  bp: { backgroundColor: '#fef3c7' },
  bt: { fontSize: 11, fontWeight: '600' },
});

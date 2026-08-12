import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ReferralRaceScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).referralRace.leaderboard.query() as any)
      .then((d: any) => {
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
  if (loading) return <SkeletonList count={5} />;
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
      <Text style={styles.t}>🏁 سباق الإحالات</Text>
      {data.map((r: any, i: number) => (
        <View key={i} style={styles.card}>
          <View style={[styles.rk, i === 0 && styles.rk1]}>
            <Text style={styles.rkt}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rn}>{r.name as string}</Text>
            <Text style={styles.rc}>{r.referrals as number} إحالة</Text>
          </View>
          {i === 0 && <Text style={styles.cr}>👑</Text>}
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
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  rk: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rk1: { backgroundColor: '#fcd34d' },
  rkt: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  rn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cr: { fontSize: 28 },
});

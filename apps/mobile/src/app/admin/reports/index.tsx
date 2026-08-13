import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function AdminReportsScreen(): JSX.Element {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().adminReports.dashboard.query() as any)
      .then((d: any) => {
        setData(d || {});
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

  const d = data ?? {};
  const topTechs = (d.topTechs ?? []) as any[];
  const byService = (d.byService ?? []) as any[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}> التقارير</Text>
      {topTechs.length > 0 && <Text style={styles.st}>‍ أفضل الفنيات</Text>}
      {topTechs.map((t: any, i: number) => (
        <View key={i} style={styles.row}>
          <Text style={styles.r}>#{i + 1}</Text>
          <Text style={styles.n}>{t.name as string}</Text>
          <Text style={styles.s}>{t.bookings as number} حجز</Text>
        </View>
      ))}
      {byService.length > 0 && <Text style={styles.st}> حسب الخدمة</Text>}
      {byService.map((s: any, i: number) => (
        <View key={i} style={styles.row}>
          <Text style={styles.r}>#{i + 1}</Text>
          <Text style={styles.n}>{s.name as string}</Text>
          <Text style={styles.s}>{s.bookings as number} حجز</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  r: { fontSize: 12, fontWeight: '700', color: '#4f46e5', width: 28 },
  n: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  s: { fontSize: 12, color: '#6b7280' },
});

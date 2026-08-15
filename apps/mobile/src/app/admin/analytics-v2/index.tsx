import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface AnalyticsKpi {
  today?: number;
  week?: number;
  month?: number;
  growth?: number;
  chart?: number[];
}

interface TopService {
  name?: string;
  bookings?: number;
  revenue?: number;
  growth?: number;
}

interface AnalyticsData {
  revenue?: AnalyticsKpi;
  bookings?: AnalyticsKpi;
  users?: Record<string, number>;
  technicians?: Record<string, number>;
  topServices?: TopService[];
  forecast?: Record<string, number>;
}

export default function AdminAnalyticsV2Screen(): JSX.Element {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.adminAnalyticsV2.dashboard.query() as Promise<AnalyticsData>)
      .then((d: AnalyticsData) => {
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
  const revenue = d.revenue ?? {};
  const bookings = d.bookings ?? {};
  const top = d.topServices ?? [];

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
      <Text style={styles.t}> التحليلات المتقدمة</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={styles.kpiVal}>{(revenue.today ?? 0)?.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>إيراد اليوم</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiEmoji}></Text>
          <Text style={[styles.kpiVal, { color: '#2563eb' }]}>{bookings.today ?? 0}</Text>
          <Text style={styles.kpiLabel}>حجز اليوم</Text>
        </View>
      </View>
      {top.length > 0 && <Text style={styles.sectionTitle}> الأعلى</Text>}
      {top.map((s, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rank}>#{i + 1}</Text>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.stat}>{s.bookings} حجز</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  rank: { fontSize: 12, fontWeight: '700', color: '#4f46e5', width: 28 },
  name: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  stat: { fontSize: 12, color: '#6b7280' },
});

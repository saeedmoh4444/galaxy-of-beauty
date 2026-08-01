import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TechEarningsScreen(): JSX.Element {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).analytics.technicianDashboard.query() as any).then((d: any) => { setData(d || {}); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  const d = data ?? {};

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#059669']} />}>
      <Text style={styles.t}>💰 أرباحي</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={styles.kpiVal}>{(d.todayEarnings as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>اليوم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal,{color:'#2563eb'}]}>{(d.weekEarnings as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>الأسبوع</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📈</Text><Text style={[styles.kpiVal,{color:'#059669'}]}>{(d.monthEarnings as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>الشهر</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  kpiRow: { gap: 8 },
  kpi: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 8 },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 22, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
});

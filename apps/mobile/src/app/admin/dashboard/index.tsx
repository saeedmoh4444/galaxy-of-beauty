import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminDashboardScreen(): JSX.Element {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).admin.dashboardStats.query() as any).then((d: any) => { setStats(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={5} />;

  const s = stats ?? {};

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#6366f1']} />}>
      <Text style={styles.t}>📊 لوحة التحكم</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👥</Text><Text style={styles.kpiVal}>{s.totalUsers as number ?? 0}</Text><Text style={styles.kpiLabel}>مستخدم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal,{color:'#2563eb'}]}>{s.totalBookings as number ?? 0}</Text><Text style={styles.kpiLabel}>حجز</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={[styles.kpiVal,{color:'#059669'}]}>{(s.totalRevenue as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>ر.س</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👩‍🎨</Text><Text style={[styles.kpiVal,{color:'#7c3aed'}]}>{s.totalTechnicians as number ?? 0}</Text><Text style={styles.kpiLabel}>فنية</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 24, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
});

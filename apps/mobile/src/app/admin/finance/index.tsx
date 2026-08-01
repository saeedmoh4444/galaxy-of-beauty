import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminFinanceScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).analytics.adminDashboard.query() as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  const d = data ?? {};

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#059669']} />}>
      <Text style={styles.t}>💰 المالية</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={styles.kpiVal}>{(d.totalRevenue as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>الإيرادات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💸</Text><Text style={[styles.kpiVal,{color:'#dc2626'}]}>{(d.totalPayouts as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>المدفوعات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📊</Text><Text style={[styles.kpiVal,{color:'#059669'}]}>{(d.platformFees as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>رسوم المنصة</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { flex: 1, minWidth: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
});

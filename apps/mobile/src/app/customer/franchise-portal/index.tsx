import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function FranchisePortalScreen(): JSX.Element {
  const [dash, setDash] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).franchisePortal.dashboard.query() as any),
      ((trpc as any).franchisePortal.locations.query() as any),
    ]).then(([d, l]: any[]) => { setDash(d); setLocations(l || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🤝 بوابة الامتياز</Text>
      <Text style={styles.sub}>أديري فروع صالونكِ المتعددة</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={styles.kpiVal}>{(dash?.totalRevenue as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>الإيرادات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{dash?.totalBookings as number ?? 0}</Text><Text style={styles.kpiLabel}>حجز</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👩‍🎨</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{dash?.totalStaff as number ?? 0}</Text><Text style={styles.kpiLabel}>موظفة</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📈</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>+{dash?.growth as number ?? 0}%</Text><Text style={styles.kpiLabel}>نمو</Text></View>
      </View>

      <Text style={styles.sectionTitle}>📍 الفروع</Text>
      {locations.length === 0 ? <Text style={styles.e}>لا توجد فروع</Text> :
        locations.map((l: any) => (
          <View key={l.id} style={styles.locCard}>
            <View style={{flex:1}}>
              <Text style={styles.locName}>{l.branch as string}</Text>
              <Text style={styles.locMeta}>📍 {l.city as string} · {l.staff as number} موظفات</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.locBookings}>{l.bookings as number} حجز</Text>
              <Text style={styles.locRevenue}>{(l.revenue as number)?.toLocaleString()} ر.س</Text>
              <View style={[styles.locBadge, l.status === 'active' ? styles.locActive : styles.locPending]}>
                <Text style={[styles.locBadgeText, l.status === 'active' ? {color:'#059669'} : {color:'#d97706'}]}>{l.status === 'active' ? 'نشط' : 'معلق'}</Text>
              </View>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  kpi: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 24, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  locCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  locName: { fontSize: 14, fontWeight: '600', color: '#111827' }, locMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  locBookings: { fontSize: 12, color: '#6b7280' }, locRevenue: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  locBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  locActive: { backgroundColor: '#dcfce7' }, locPending: { backgroundColor: '#fef3c7' },
  locBadgeText: { fontSize: 11, fontWeight: '600' },
});

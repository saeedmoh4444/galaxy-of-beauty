import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SalonManagementScreen(): JSX.Element {
  const [dash, setDash] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).salonManagement.dashboard.query() as any),
      ((trpc as any).salonManagement.staff.query() as any),
    ]).then(([d, s]: any[]) => { setDash(d); setStaff(s || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🤝 إدارة الصالون</Text>
      <Text style={styles.sub}>تابعي أداء فريقكِ وصالونكِ</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={styles.kpiVal}>{dash?.todayBookings as number ?? 0}</Text><Text style={styles.kpiLabel}>حجز اليوم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{(dash?.todayRevenue as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>إيراد اليوم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👩‍🎨</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{dash?.activeStaff as number ?? 0}</Text><Text style={styles.kpiLabel}>موظفات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>⭐</Text><Text style={[styles.kpiVal, {color:'#f59e0b'}]}>{dash?.avgRating as number ?? 0}</Text><Text style={styles.kpiLabel}>التقييم</Text></View>
      </View>
      <Text style={styles.sectionTitle}>👩‍🎨 فريق العمل</Text>
      {staff.length === 0 ? <Text style={styles.e}>لا يوجد فريق</Text> :
        staff.map((s: any) => (
          <View key={s.id} style={styles.staffCard}>
            <Text style={styles.staffEmoji}>👩‍🎨</Text>
            <View style={{flex:1}}>
              <Text style={styles.staffName}>{s.name as string}</Text>
              <Text style={styles.staffRole}>{s.role as string}</Text>
            </View>
            <Text style={styles.staffRating}>⭐ {s.rating as number ?? 0}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  kpi: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 24, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  staffCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  staffEmoji: { fontSize: 28 }, staffName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  staffRole: { fontSize: 12, color: '#6b7280' }, staffRating: { fontSize: 13, fontWeight: '600', color: '#f59e0b' },
});

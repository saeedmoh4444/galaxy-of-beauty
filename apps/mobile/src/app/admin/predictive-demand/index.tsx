import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function PredictiveDemandScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).predictiveDemand.forecast.query() as any).then((d: any) => { setData(d || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  const f = data ?? {};
  const nextWeek = f.nextWeek as Record<string, any> ?? {};
  const nextMonth = f.nextMonth as Record<string, any> ?? {};
  const byService = (f.byService ?? []) as Array<Record<string, any>>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 توقعات الطلب</Text>
      <Text style={styles.sub}>توقعات الحجوزات والطلب المستقبلي</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>📅 الأسبوع القادم</Text>
          <Text style={styles.kpiVal}>{nextWeek.predictedBookings as number ?? 0} حجز</Text>
          <Text style={styles.kpiMeta}>الذروة: {nextWeek.peakDay as string} {nextWeek.peakTime as string}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>📈 الشهر القادم</Text>
          <Text style={[styles.kpiVal, {color:'#059669'}]}>{nextMonth.predictedBookings as number ?? 0} حجز</Text>
          <Text style={styles.kpiMeta}>ثقة {nextMonth.confidence as number}% · نمو +{nextMonth.growth as number}%</Text>
        </View>
      </View>

      {byService.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💄 حسب الخدمة</Text>
          {byService.map((s: any, i: number) => (
            <View key={i} style={styles.svcRow}>
              <Text style={styles.svcName}>{s.name as string}</Text>
              <Text style={styles.svcDemand}>الطلب: {s.currentDemand as number}%</Text>
              <Text style={[styles.svcTrend, s.trend === 'up' ? {color:'#059669'} : s.trend === 'down' ? {color:'#dc2626'} : {color:'#6b7280'}]}>{s.prediction as string}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  kpiRow: { gap: 10, marginBottom: 16 },
  kpi: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  kpiTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  kpiVal: { fontSize: 24, fontWeight: '800', color: '#7c3aed' },
  kpiMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  svcRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  svcName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  svcDemand: { fontSize: 12, color: '#6b7280' }, svcTrend: { fontSize: 12, fontWeight: '600' },
});

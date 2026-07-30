import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminReportsScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).adminReports.dashboard.query() as any).then((d: any) => { setData(d || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  const d = data ?? {};
  const topTechs = (d.topTechs ?? []) as Array<Record<string, any>>;
  const byService = (d.byService ?? []) as Array<Record<string, any>>;
  const byCity = (d.byCity ?? []) as Array<Record<string, any>>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 التقارير</Text>
      <Text style={styles.sub}>تقارير الأداء والإحصائيات</Text>

      {topTechs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👩‍🎨 أفضل الفنيات</Text>
          {topTechs.map((t: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.name}>{t.name as string}</Text>
              <Text style={styles.stat}>{t.bookings as number} حجز</Text>
              <Text style={styles.revenue}>{(t.revenue as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {byService.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💄 حسب الخدمة</Text>
          {byService.map((s: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.name}>{s.name as string}</Text>
              <Text style={styles.stat}>{s.bookings as number} حجز</Text>
              <Text style={styles.revenue}>{(s.revenue as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {byCity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 حسب المدينة</Text>
          {byCity.map((c: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.name}>{c.city as string}</Text>
              <Text style={styles.stat}>{c.bookings as number} حجز</Text>
              <Text style={styles.revenue}>{(c.revenue as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rank: { fontSize: 12, fontWeight: '700', color: '#4f46e5', width: 30 },
  name: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  stat: { fontSize: 12, color: '#6b7280' }, revenue: { fontSize: 13, fontWeight: '700', color: '#059669' },
});

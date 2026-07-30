import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminAnalyticsV2Screen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).adminAnalyticsV2.dashboard.query() as any).then((d: any) => { setData(d || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  const d = data ?? {};
  const revenue = d.revenue as Record<string, number> ?? {};
  const bookings = d.bookings as Record<string, number> ?? {};
  const users = d.users as Record<string, number> ?? {};
  const techs = d.technicians as Record<string, number> ?? {};
  const topServices = (d.topServices ?? []) as Array<Record<string, unknown>>;
  const forecast = d.forecast as Record<string, number> ?? {};

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 التحليلات المتقدمة</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={styles.kpiVal}>{(revenue.today ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>إيراد اليوم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{bookings.today ?? 0}</Text><Text style={styles.kpiLabel}>حجز اليوم</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👥</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{users.activeToday ?? 0}</Text><Text style={styles.kpiLabel}>مستخدم نشط</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👩‍🎨</Text><Text style={[styles.kpiVal, {color:'#7c3aed'}]}>{techs.active ?? 0}</Text><Text style={styles.kpiLabel}>فنية نشطة</Text></View>
      </View>
      {topServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 الخدمات الأعلى</Text>
          {topServices.map((s: any, i: number) => (
            <View key={i} style={styles.svcRow}>
              <Text style={styles.svcRank}>#{i + 1}</Text>
              <Text style={styles.svcName}>{s.name as string}</Text>
              <Text style={styles.svcBookings}>{s.bookings as number} حجز</Text>
              <Text style={styles.svcRevenue}>{(s.revenue as number)?.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.forecast}>
        <Text style={styles.forecastTitle}>📊 توقعات الشهر القادم</Text>
        <Text style={styles.forecastValue}>{(forecast.nextMonthRevenue ?? 0)?.toLocaleString()} ر.س</Text>
        <Text style={styles.forecastMeta}>نسبة الثقة: {forecast.confidence ?? 0}%</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 24, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  svcRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10, marginBottom: 4 },
  svcRank: { fontSize: 13, fontWeight: '700', color: '#4f46e5', width: 30 },
  svcName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  svcBookings: { fontSize: 12, color: '#6b7280' }, svcRevenue: { fontSize: 13, fontWeight: '700', color: '#059669' },
  forecast: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  forecastTitle: { fontSize: 14, fontWeight: '700', color: '#111827' }, forecastValue: { fontSize: 28, fontWeight: '800', color: '#4f46e5', marginTop: 8 },
  forecastMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
});

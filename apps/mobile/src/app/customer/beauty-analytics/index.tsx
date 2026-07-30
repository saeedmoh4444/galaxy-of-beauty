import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyAnalyticsScreen(): JSX.Element {
  const [summary, setSummary] = useState<any>(null);
  const [byCat, setByCat] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).beautyAnalytics.summary.query() as any),
      ((trpc as any).beautyAnalytics.byCategory.query() as any),
      ((trpc as any).beautyAnalytics.monthlyTrend.query() as any),
    ]).then(([s, c, t]: any[]) => {
      setSummary(s); setByCat(c || []); setTrend(t || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  const s = summary ?? { totalBookings: 0, completedBookings: 0, completionRate: 0, totalSpent: 0 };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 تحليلات الجمال</Text>
      <Text style={styles.sub}>ملخص إنفاقكِ وحجوزاتكِ</Text>
      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={styles.kpiVal}>{s.totalBookings}</Text><Text style={styles.kpiLabel}>حجوزات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>✅</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{s.completedBookings}</Text><Text style={styles.kpiLabel}>مكتملة</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📈</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{s.completionRate}%</Text><Text style={styles.kpiLabel}>نسبة</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={[styles.kpiVal, {color:'#7c3aed'}]}>{(s.totalSpent as number)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>ر.س</Text></View>
      </View>
      {byCat.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 الحجوزات حسب الفئة</Text>
          {byCat.map((cat: any, i: number) => (
            <View key={i} style={styles.catRow}>
              <Text style={styles.catName}>{cat.category}</Text>
              <View style={styles.catBar}><View style={[styles.catFill, {width: `${cat.pct}%`}]} /></View>
              <Text style={styles.catCount}>{cat.count}</Text>
            </View>
          ))}
        </View>
      )}
      {trend.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 الاتجاه الشهري</Text>
          <View style={styles.trendRow}>
            {trend.map((m: any, i: number) => (
              <View key={i} style={styles.trendBar}>
                <Text style={styles.trendCount}>{m.count}</Text>
                <View style={[styles.trendFill, {height: `${(m.count / Math.max(1, ...trend.map((x: any) => x.count))) * 80}%`}]} />
                <Text style={styles.trendMonth}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 24, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catName: { width: 70, fontSize: 12, color: '#6b7280', textAlign: 'right' },
  catBar: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  catFill: { height: 8, backgroundColor: '#8b5cf6', borderRadius: 4 },
  catCount: { width: 30, fontSize: 12, fontWeight: '600', color: '#111827' },
  trendRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, paddingTop: 10 },
  trendBar: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  trendCount: { fontSize: 11, fontWeight: '600', color: '#111827', marginBottom: 2 },
  trendFill: { width: 24, backgroundColor: '#8b5cf6', borderRadius: 4, minHeight: 4 },
  trendMonth: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
});

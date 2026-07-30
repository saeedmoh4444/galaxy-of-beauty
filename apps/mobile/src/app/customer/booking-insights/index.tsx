import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BookingInsightsScreen(): JSX.Element {
  const [analytics, setAnalytics] = useState<any>(null);
  const [byCat, setByCat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).beautyAnalytics.summary.query() as any).catch(() => null),
      ((trpc as any).beautyAnalytics.byCategory.query() as any).catch(() => []),
    ]).then(([a, c]: any[]) => { setAnalytics(a); setByCat(c || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  const s = analytics ?? {};
  const totalSpent = s.totalSpent as number ?? 0;
  const totalBookings = s.totalBookings as number ?? 0;
  const avgPerBooking = totalBookings > 0 ? Math.round(totalSpent / totalBookings) : 0;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 رؤى الحجوزات</Text>
      <Text style={styles.sub}>تحليلات ذكية عن عادات جمالكِ</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={styles.kpiVal}>{totalSpent.toLocaleString()}</Text><Text style={styles.kpiLabel}>ر.س إنفاق</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{totalBookings}</Text><Text style={styles.kpiLabel}>حجز</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📊</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{avgPerBooking.toLocaleString()}</Text><Text style={styles.kpiLabel}>متوسط/حجز</Text></View>
      </View>

      {byCat.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💆‍♀️ توزيع الفئات</Text>
          {byCat.map((cat: any, i: number) => (
            <View key={i} style={styles.catRow}>
              <Text style={styles.catName}>{cat.category as string}</Text>
              <View style={styles.catBar}>
                <View style={[styles.catFill, {width: `${cat.pct as number}%`}]} />
              </View>
              <Text style={styles.catPct}>{cat.pct as number}%</Text>
              <Text style={styles.catSpent}>{(cat.spent as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.insightCard}>
        <Text style={styles.insightEmoji}>💡</Text>
        <Text style={styles.insightTitle}>نصيحة ذكية</Text>
        <Text style={styles.insightText}>
          {totalBookings < 5 ? 'احجزي ٥ خدمات هذا الشهر للوصول للفئة الذهبية ✨' :
           avgPerBooking > 300 ? 'أنتِ تستثمرين في الجودة — استمري في اختيار الأفضل 👑' :
           'احجزي باقات للحصول على خصم يصل إلى ٢٥٪ 📦'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 10, color: '#9ca3af' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catName: { width: 70, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  catBar: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  catFill: { height: 8, backgroundColor: '#0891b2', borderRadius: 4 },
  catPct: { width: 36, fontSize: 11, fontWeight: '600', color: '#111827' },
  catSpent: { width: 55, fontSize: 10, color: '#6b7280', textAlign: 'right' },
  insightCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  insightEmoji: { fontSize: 36 }, insightTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  insightText: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center', lineHeight: 22 },
});

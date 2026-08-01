import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BookingInsightsScreen(): JSX.Element {
  const [analytics, setAnalytics] = useState<any>(null);
  const [byCat, setByCat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    Promise.all([((trpc as any).beautyAnalytics.summary.query() as any).catch(() => null), ((trpc as any).beautyAnalytics.byCategory.query() as any).catch(() => [])])
      .then(([a, c]: any[]) => { setAnalytics(a); setByCat(c || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  const s = analytics ?? {};
  const totalSpent = s.totalSpent as number ?? 0;
  const totalBookings = s.totalBookings as number ?? 0;
  const avgPerBooking = totalBookings > 0 ? Math.round(totalSpent / totalBookings) : 0;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#0891b2']} />}>
      <Text style={styles.t}>📊 رؤى الحجوزات</Text>
      <View style={styles.kr}>
        <View style={styles.k}><Text style={styles.ke}>💰</Text><Text style={styles.kv}>{totalSpent.toLocaleString()}</Text><Text style={styles.kl}>ر.س إنفاق</Text></View>
        <View style={styles.k}><Text style={styles.ke}>📅</Text><Text style={[styles.kv,{color:'#2563eb'}]}>{totalBookings}</Text><Text style={styles.kl}>حجز</Text></View>
        <View style={styles.k}><Text style={styles.ke}>📊</Text><Text style={[styles.kv,{color:'#059669'}]}>{avgPerBooking.toLocaleString()}</Text><Text style={styles.kl}>متوسط</Text></View>
      </View>
      {byCat.length > 0 && <View style={styles.sec}><Text style={styles.st}>💆‍♀️ توزيع الفئات</Text>
        {byCat.map((cat: any, i: number) => (<View key={i} style={styles.cr}><Text style={styles.cn}>{cat.category as string}</Text><View style={styles.cb}><View style={[styles.cf,{width:`${cat.pct as number}%`}]}/></View><Text style={styles.cp}>{cat.pct as number}%</Text><Text style={styles.cs}>{(cat.spent as number)?.toLocaleString()} ر.س</Text></View>))}</View>}
      <View style={styles.ic}><Text style={styles.ie}>💡</Text><Text style={styles.it}>نصيحة ذكية</Text><Text style={styles.ix}>{totalBookings < 5 ? 'احجزي ٥ خدمات للفئة الذهبية ✨' : avgPerBooking > 300 ? 'أنتِ تستثمرين في الجودة 👑' : 'احجزي باقات للخصم 📦'}</Text></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 }, kv: { fontSize: 20, fontWeight: '800', color: '#111827' }, kl: { fontSize: 10, color: '#9ca3af' },
  sec: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  cr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, cn: { width: 70, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  cb: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }, cf: { height: 8, backgroundColor: '#0891b2', borderRadius: 4 },
  cp: { width: 36, fontSize: 11, fontWeight: '600', color: '#111827' }, cs: { width: 55, fontSize: 10, color: '#6b7280', textAlign: 'right' },
  ic: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  ie: { fontSize: 36 }, it: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  ix: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center', lineHeight: 22 },
});

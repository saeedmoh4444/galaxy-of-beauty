import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WellnessTrackerScreen() {
  const [weekly, setWeekly] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (trpc.wellnessTracker.weekly.query() as any).then((d: any) => { setWeekly(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  const w = weekly;
  if (!w) return <Text style={styles.empty}>لا توجد بيانات</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🧘 متعقب العافية</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statEmoji}>💧</Text><Text style={styles.statNum}>{w.avgWater as number}</Text><Text style={styles.statLabel}>ماء</Text></View>
        <View style={styles.stat}><Text style={styles.statEmoji}>😴</Text><Text style={styles.statNum}>{w.avgSleep as number}</Text><Text style={styles.statLabel}>نوم</Text></View>
        <View style={styles.stat}><Text style={styles.statEmoji}>😊</Text><Text style={styles.statNum}>{w.avgMood as number}</Text><Text style={styles.statLabel}>مزاج</Text></View>
        <View style={styles.stat}><Text style={styles.statEmoji}>🧴</Text><Text style={styles.statNum}>{w.skincareDays as number}/7</Text><Text style={styles.statLabel}>عناية</Text></View>
      </View>
      <Text style={styles.section}>📈 الأسبوع</Text>
      <View style={styles.chart}>{(w.week as Record<string, unknown>[]).map((d: Record<string, unknown>, i: number) => {
        const h = Math.max(4, ((d.mood as number) || 0) * 20);
        const days = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
        return <View key={i} style={styles.barCol}><View style={[styles.bar, { height: h }]} /><Text style={styles.barLabel}>{days[new Date(d.date as string).getDay()]}</Text></View>;
      })}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  inner: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, width: 80 },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statNum: { fontSize: 20, fontWeight: '800', color: '#059669' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: '#059669', borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: 7, color: '#9ca3af', marginTop: 2 },
});

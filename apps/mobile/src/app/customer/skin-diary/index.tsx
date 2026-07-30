import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SkinDiaryScreen() {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [timeline, setTimeline] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([(trpc.skinDiary.entries.query() as any), (trpc.skinDiary.timeline.query() as any)])
      .then(([e, t]) => { setEntries(e || []); setTimeline(t || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🧬 يوميات البشرة</Text>
      {timeline.length > 1 && (
        <View style={styles.chart}><Text style={styles.sectionTitle}>📈 الترطيب</Text>
          <View style={styles.bars}>{timeline.slice(0,14).reverse().map((d: Record<string, unknown>, i: number) => (
            <View key={i} style={styles.barCol}><View style={[styles.bar, { height: ((d.hydration as number) || 5) * 10 }]} /><Text style={styles.barLabel}>{new Date(d.date as string).toLocaleDateString('ar-SA', {day:'numeric',month:'short'})}</Text></View>
          ))}</View>
        </View>
      )}
      <Text style={styles.sectionTitle}>📸 السجل</Text>
      {entries.length === 0 ? <Text style={styles.empty}>لا توجد إدخالات</Text> :
        entries.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.condition}>{e.skinCondition as string}</Text>
            <Text style={styles.date}>{new Date(e.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            <Text style={styles.hydration}>💧 {e.hydration as number}/10</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  inner: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10, marginTop: 8 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  chart: { marginBottom: 20 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: '#8b5cf6', borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: 7, color: '#9ca3af', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  condition: { fontSize: 14, fontWeight: '600', color: '#111827' },
  date: { fontSize: 12, color: '#9ca3af' },
  hydration: { fontSize: 13, fontWeight: '600', color: '#8b5cf6' },
});

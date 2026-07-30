import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RoutineSchedulerScreen() {
  const [routines, setRoutines] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.routineScheduler.myRoutines.query() as any).then((d: any) => { setRoutines(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📅 جدول الروتين</Text>
      {routines.map((r: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{r.nameAr as string}</Text>
          {(r.steps as Record<string, unknown>[]).map((s: Record<string, unknown>, j: number) => (
            <View key={j} style={styles.step}><Text style={styles.stepEmoji}>{s.emoji as string}</Text><Text style={styles.stepTime}>{s.time as string}</Text><Text style={styles.stepTask}>{s.task as string}</Text></View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10 },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 8 },
  stepEmoji: { fontSize: 22, width: 36, textAlign: 'center' },
  stepTime: { fontSize: 12, color: '#9ca3af', width: 48 },
  stepTask: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
});

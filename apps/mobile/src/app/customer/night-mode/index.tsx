import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function NightModeScreen() {
  const [routine, setRoutine] = useState<Record<string, unknown>[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.nightMode.routine.query() as any), (trpc.nightMode.tips.query() as any)])
      .then(([r, t]) => { setRoutine(r || []); setTips(t || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🌙 الروتين الليلي</Text>
      {routine.map((s: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.step}>
          <Text style={styles.stepEmoji}>{s.emoji as string}</Text>
          <View style={{flex:1}}><Text style={styles.stepTask}>{s.taskAr as string}</Text><Text style={styles.stepTime}>{s.time as string} · {s.durationMin as number}د</Text></View>
        </View>
      ))}
      {tips.length > 0 && <View style={styles.tips}><Text style={styles.tipsTitle}>💡 نصائح</Text>{tips.map((t: string, i: number) => <Text key={i} style={styles.tipText}>🌙 {t}</Text>)}</View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  step: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, alignItems: 'center' },
  stepEmoji: { fontSize: 28 },
  stepTask: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  stepTime: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
  tips: { marginTop: 20 }, tipsTitle: { fontSize: 16, fontWeight: '700', color: '#4f46e5', textAlign: 'right', marginBottom: 8 },
  tipText: { fontSize: 13, color: '#374151', textAlign: 'right', marginBottom: 4 },
});

import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SavingsGoalsScreen() {
  const [goals, setGoals] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).savingsGoals.list.query() as any).then((d: any) => { setGoals(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎯 أهداف التوفير</Text>
      {goals.length === 0 ? <Text style={styles.e}>لا توجد أهداف</Text> :
        goals.map((g: Record<string, unknown>, i: number) => {
          const pct = Math.min(100, ((g.saved as number) / (g.target as number || 1)) * 100);
          return (
            <View key={i} style={styles.card}>
              <Text style={styles.name}>{g.name as string}</Text>
              <View style={styles.bar}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
              <Text style={styles.progress}>{g.saved as number} / {g.target as number} ر.س</Text>
            </View>
          );
        })
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 4 }, fill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  progress: { fontSize: 12, color: '#9ca3af', textAlign: 'right' },
});

import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SpaPlannerScreen() {
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.spaPlanner.myPlans.query() as any).then((d: any) => { setPlans(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🕯️ مخطط يوم سبا</Text>
      {plans.length === 0 ? <Text style={styles.e}>لا توجد خطط</Text> : plans.map((p: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.name}>{p.name as string}</Text>
          <Text style={styles.date}>{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</Text>
          {(p.items as Record<string, unknown>[]).map((item: Record<string, unknown>, j: number) => (
            <View key={j} style={styles.item}><Text style={styles.itemEmoji}>{item.emoji as string}</Text><Text style={styles.itemName}>{item.nameAr as string}</Text><Text style={styles.itemTime}>{item.durationMin as number}د</Text></View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  date: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 2, marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 6 },
  itemEmoji: { fontSize: 18 }, itemName: { flex: 1, fontSize: 12, color: '#374151', textAlign: 'right' }, itemTime: { fontSize: 11, color: '#9ca3af' },
});

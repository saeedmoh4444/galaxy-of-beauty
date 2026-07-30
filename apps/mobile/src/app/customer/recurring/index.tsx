import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RecurringScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.recurringBookings.list.query() as any).then((d: any) => { setData(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔄 حجوزات متكررة</Text>
      {data.length === 0 ? <Text style={styles.e}>لا توجد حجوزات متكررة</Text> :
        data.map((r: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.name}>{(r as any).name || `حجز #${i+1}`}</Text>
            <Text style={styles.freq}>{(r as any).frequency || 'شهرياً'}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' }, freq: { fontSize: 12, color: '#6b7280' },
});

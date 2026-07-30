import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceHistoryScreen() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.bookings.list.query({ limit: 100 }) as any).then((d: any) => { setBookings((d as any).bookings || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 سجل الخدمات</Text>
      {bookings.length === 0 ? <Text style={styles.e}>لا توجد حجوزات سابقة</Text> :
        bookings.map((b: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.status}>{(b.status as string)}</Text>
            <Text style={styles.date}>{new Date(b.createdAt as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6 },
  status: { fontSize: 13, fontWeight: '600', color: '#111827' }, date: { fontSize: 12, color: '#9ca3af' },
});

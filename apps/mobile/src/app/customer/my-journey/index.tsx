import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function MyJourneyScreen() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.bookings.list.query({ limit: 100 }) as any), (trpc.analytics.customerInsights.query() as any)])
      .then(([b, i]) => { setBookings((b as any).bookings || []); setInsights(i); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🗺️ رحلتي</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statNum}>{bookings.length}</Text><Text style={styles.statLabel}>حجز</Text></View>
        {insights && <View style={styles.stat}><Text style={styles.statNum}>{insights.totalSpent || 0}</Text><Text style={styles.statLabel}>ر.س</Text></View>}
      </View>
      {bookings.slice(0, 10).map((b: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.status}>{(b.status as string)}</Text>
          <Text style={styles.date}>{new Date(b.createdAt as string).toLocaleDateString('ar-SA')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 16 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 20 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 120 },
  statNum: { fontSize: 24, fontWeight: '800', color: '#7c3aed' }, statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 4 },
  status: { fontSize: 13, fontWeight: '600', color: '#111827' }, date: { fontSize: 11, color: '#9ca3af' },
});

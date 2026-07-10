import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechDashboardScreen() {
  const [pending, setPending] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    trpc.bookings.getTechnicianPending.query()
      .then((d) => { setPending((d as unknown as Record<string, unknown>[]) ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    await trpc.bookings.transition.mutate({ id, action } as never);
    fetchData();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>لوحة تحكم الفنية</Text>
      <View style={styles.stats}>
        <View style={styles.statCard}><Text style={styles.statNum}>{pending.length}</Text><Text style={styles.statLabel}>طلبات معلقة</Text></View>
      </View>
      <Text style={styles.sectionTitle}>طلبات الحجز</Text>
      {loading ? <ActivityIndicator color="#7c3aed" /> : pending.length === 0 ? <Text style={styles.empty}>لا توجد طلبات</Text> : pending.map((b: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{b.bookingCode as string}</Text>
          <Text style={styles.cardDate}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction(b.id as number, 'accept')}><Text style={styles.btnText}>قبول</Text></TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(b.id as number, 'reject')}><Text style={[styles.btnText, { color: '#ef4444' }]}>رفض</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: { padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardDate: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 8, padding: 10, alignItems: 'center' },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: '#ef4444', borderRadius: 8, padding: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});

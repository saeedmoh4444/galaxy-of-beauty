import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechBookingsScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.bookings.getTechnicianPending as any).query()
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل الحجوزات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleAction = async (id: number, action: string) => {
    try {
      await (trpc.bookings as any)[action].mutate({ id });
      fetch();
    } catch {}
  };

  const statusColor = (s: string) => {
    if (s === 'REQUESTED') return '#f59e0b';
    if (s === 'ACCEPTED') return '#3b82f6';
    if (s === 'IN_PROGRESS') return '#7c3aed';
    if (s === 'COMPLETED') return '#10b981';
    return '#ef4444';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إدارة الحجوزات</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.empty}>لا توجد حجوزات حالية</Text>
        </View>
       ) : (
        data.map((b: Record<string, unknown>) => (
          <View key={b.id as number} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.code}>{b.bookingCode as string}</Text>
                <Text style={styles.customer}>العميلة: {b.customerName as string ?? '—'}</Text>
                <Text style={styles.date}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')} {new Date(b.startAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor(b.status as string) + '20' }]}>
                <Text style={{ color: statusColor(b.status as string), fontSize: 12, fontWeight: '600' }}>{b.status as string}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              {(b.status as string) === 'REQUESTED' && (
                <>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction(b.id as number, 'accept')}>
                    <Text style={styles.acceptText}>قبول</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(b.id as number, 'reject')}>
                    <Text style={styles.rejectText}>رفض</Text>
                  </TouchableOpacity>
                </>
              )}
              {(b.status as string) === 'ACCEPTED' && (
                <TouchableOpacity style={styles.startBtn} onPress={() => handleAction(b.id as number, 'start')}>
                  <Text style={styles.acceptText}>بدء</Text>
                </TouchableOpacity>
              )}
              {(b.status as string) === 'IN_PROGRESS' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleAction(b.id as number, 'complete')}>
                  <Text style={styles.acceptText}>إكمال</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  code: { fontSize: 16, fontWeight: '700', color: '#111827' },
  customer: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, padding: 12, alignItems: 'center' },
  acceptText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  rejectText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  startBtn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 10, padding: 12, alignItems: 'center' },
  completeBtn: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, padding: 12, alignItems: 'center' },
});

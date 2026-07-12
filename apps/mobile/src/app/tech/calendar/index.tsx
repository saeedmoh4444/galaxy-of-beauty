import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechCalendarScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    const today = new Date().toISOString().slice(0, 10);
    (trpc.slots.getMySlots as any).query({ startDate: today, endDate: today } as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل المواعيد'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleSync = async () => {
    try {
      await (trpc.calendar.sync as any).mutate({});
      fetch();
    } catch {}
  };

  const handleDisconnect = async () => {
    try {
      await (trpc.calendar.disconnect as any).mutate({});
      fetch();
    } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>التقويم</Text>

      <View style={styles.syncSection}>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
          <Text style={styles.syncText}>📅 مزامنة مع Google Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
          <Text style={styles.disconnectText}>قطع الاتصال</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.empty}>لا توجد مواعيد اليوم</Text>
          <Text style={styles.hint}>أضف مواعيد توفرك من شاشة المواعيد</Text>
        </View>
       ) : (
        data.map((s: Record<string, unknown>) => (
          <View key={s.id as number} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.timeText}>
                {new Date(s.startAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {new Date(s.endAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.statusText}>{s.isBooked ? 'محجوز' : s.isAvailable ? 'متاح' : 'غير متاح'}</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: s.isBooked ? '#ef4444' : s.isAvailable ? '#10b981' : '#9ca3af' }]} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  syncSection: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  syncBtn: { flex: 1, backgroundColor: '#f5f3ff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#c4b5fd' },
  syncText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  disconnectBtn: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
  disconnectText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  timeText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusText: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});

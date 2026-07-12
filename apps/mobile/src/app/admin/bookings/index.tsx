import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminBookingsScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.bookings.list as any).query({ status: filter as never, page: 1, limit: 50 })
      .then((d: Record<string, unknown>) => { setData((d?.bookings ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل الحجوزات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, [filter]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return '#10b981';
    if (s === 'CANCELLED' || s === 'REJECTED') return '#ef4444';
    return '#7c3aed';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة الحجوزات</Text>
      <ScrollView horizontal style={styles.filters} showsHorizontalScrollIndicator={false}>
        {['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, (f === 'ALL' && !filter) || filter === f ? styles.filterActive : {}]} onPress={() => setFilter(f === 'ALL' ? undefined : f)}>
            <Text style={[(f === 'ALL' && !filter) || filter === f ? { color: '#fff' } : { color: '#374151' }, { fontSize: 13, fontWeight: '600' }]}>{
              f === 'ALL' ? 'الكل' : f === 'REQUESTED' ? 'طلب' : f === 'ACCEPTED' ? 'مقبول' : f === 'IN_PROGRESS' ? 'جاري' : f === 'COMPLETED' ? 'مكتمل' : 'ملغي'
            }</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد حجوزات</Text></View>
       ) : (
        <ScrollView>
          {data.map((b: Record<string, unknown>) => (
            <View key={b.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.code}>{b.bookingCode as string}</Text>
                <Text style={styles.meta}>{b.customerName as string ?? '—'}</Text>
                <Text style={styles.meta}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor(b.status as string) + '20' }]}>
                <Text style={{ color: statusColor(b.status as string), fontSize: 12, fontWeight: '600' }}>{b.status as string}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  filters: { maxHeight: 44, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterActive: { backgroundColor: '#7c3aed' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  code: { fontSize: 16, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  centered: { alignItems: 'center', marginTop: 40 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

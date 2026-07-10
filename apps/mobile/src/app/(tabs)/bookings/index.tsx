import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BookingsScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    trpc.bookings.list.query({ status: filter as never, page: 1, limit: 20 })
      .then((d) => { setData((d?.bookings ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return '#10b981';
    if (s === 'CANCELLED' || s === 'REJECTED') return '#ef4444';
    return '#7c3aed';
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.filters} showsHorizontalScrollIndicator={false}>
        {['ALL', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, (f === 'ALL' && !filter) || filter === f ? styles.filterActive : {}]} onPress={() => setFilter(f === 'ALL' ? undefined : f)}>
            <Text style={[(f === 'ALL' && !filter) || filter === f ? { color: '#fff' } : { color: '#374151' }, { fontSize: 13, fontWeight: '600' }]}>{f === 'ALL' ? 'الكل' : f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> : (
        <ScrollView>
          {data.length === 0 ? <Text style={styles.empty}>لا توجد حجوزات</Text> : data.map((b: Record<string, unknown>, i: number) => (
            <View key={i} style={styles.card}>
              <View><Text style={styles.code}>{b.bookingCode as string}</Text><Text style={styles.date}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text></View>
              <View style={[styles.badge, { backgroundColor: statusColor(b.status as string) + '20' }]}><Text style={{ color: statusColor(b.status as string), fontSize: 12, fontWeight: '600' }}>{b.status as string}</Text></View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filters: { padding: 16, maxHeight: 50 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterActive: { backgroundColor: '#7c3aed' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  code: { fontSize: 16, fontWeight: '600', color: '#111827' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 16 },
});

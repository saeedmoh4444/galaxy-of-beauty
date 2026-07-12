import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminDisputesScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [resolution, setResolution] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.disputes.listAdmin as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل النزاعات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleResolve = async (id: number, inFavorOf: string) => {
    try {
      await (trpc.disputes.resolve as any).mutate({ id, resolution, inFavorOf });
      setSelected(null);
      setResolution('');
      fetch();
    } catch {}
  };

  const statusColor = (s: string) => {
    if (s === 'OPEN') return '#f59e0b';
    if (s === 'UNDER_REVIEW') return '#3b82f6';
    if (s?.startsWith('RESOLVED')) return '#10b981';
    return '#9ca3af';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة النزاعات</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد نزاعات</Text></View>
       ) : (
        <ScrollView>
          {data.map((d: Record<string, unknown>) => (
            <TouchableOpacity key={d.id as number} style={styles.card} onPress={() => setSelected(d)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingCode}>{d.bookingCode as string ?? `حجز #${d.bookingId as string}`}</Text>
                <Text style={styles.reason}>{d.reason as string}</Text>
                <Text style={styles.date}>{new Date(d.createdAt as string).toLocaleDateString('ar-SA')}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor(d.status as string) + '20' }]}>
                <Text style={{ color: statusColor(d.status as string), fontSize: 12, fontWeight: '600' }}>{d.status as string}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selected && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>حل النزاع</Text>
            <Text style={styles.modalInfo}>الحجز: {selected.bookingCode as string}</Text>
            <Text style={styles.modalInfo}>السبب: {selected.reason as string}</Text>
            <TextInput style={styles.input} placeholder="القرار" value={resolution} onChangeText={setResolution} multiline textAlignVertical="top" />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(selected.id as number, 'CUSTOMER')}>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>لصالح العميلة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(selected.id as number, 'TECHNICIAN')}>
                <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '600' }}>لصالح الفنية</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 40 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  bookingCode: { fontSize: 15, fontWeight: '600', color: '#111827' },
  reason: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' },
  modalInfo: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right', height: 80, marginTop: 8 },
  resolveBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelBtn: { alignItems: 'center', marginTop: 12, padding: 8 },
});

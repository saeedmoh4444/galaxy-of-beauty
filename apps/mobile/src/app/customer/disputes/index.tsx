import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function DisputesScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');
  const [createMsg, setCreateMsg] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.disputes.list as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل النزاعات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!bookingId || !reason) { setCreateMsg('يرجى إدخال رقم الحجز والسبب'); return; }
    try {
      await (trpc.disputes.create as any).mutate({ bookingId: Number(bookingId), reason });
      setShowCreate(false);
      setBookingId('');
      setReason('');
      fetch();
    } catch (e: any) { setCreateMsg(e?.message ?? 'فشل فتح النزاع'); }
  };

  const statusColor = (s: string) => {
    if (s === 'OPEN') return '#f59e0b';
    if (s === 'UNDER_REVIEW') return '#3b82f6';
    if (s === 'RESOLVED_CUSTOMER' || s === 'RESOLVED_TECHNICIAN') return '#10b981';
    return '#9ca3af';
  };

  const statusLabel = (s: string) => {
    if (s === 'OPEN') return 'مفتوحة';
    if (s === 'UNDER_REVIEW') return 'قيد المراجعة';
    if (s === 'RESOLVED_CUSTOMER') return 'تم الحل لصالحك';
    if (s === 'RESOLVED_TECHNICIAN') return 'تم الحل لصالح الفني';
    return 'مغلقة';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>النزاعات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+ فتح نزاع</Text>
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
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.empty}>لا توجد نزاعات</Text>
          <Text style={styles.hint}>لم تقم بفتح أي نزاع حتى الآن</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setShowCreate(true)}>
            <Text style={styles.retryText}>فتح نزاع</Text>
          </TouchableOpacity>
        </View>
       ) : (
        <ScrollView>
          {data.map((d: Record<string, unknown>) => (
            <View key={d.id as number} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.bookingCode}>{d.bookingCode as string ?? `حجز #${d.bookingId as string}`}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor(d.status as string) + '20' }]}>
                  <Text style={{ color: statusColor(d.status as string), fontSize: 12, fontWeight: '600' }}>{statusLabel(d.status as string)}</Text>
                </View>
              </View>
              <Text style={styles.reason}>{d.reason as string}</Text>
              {d.resolution ? (
                <View style={styles.resolutionBox}>
                  <Text style={styles.resolutionLabel}>قرار الإدارة</Text>
                  <Text style={styles.resolution}>{d.resolution as string}</Text>
                </View>
              ) : null}
              <Text style={styles.date}>{new Date(d.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {showCreate && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>فتح نزاع جديد</Text>
            {createMsg ? <Text style={styles.error}>{createMsg}</Text> : null}
            <TextInput style={styles.input} placeholder="رقم الحجز" value={bookingId} onChangeText={setBookingId} keyboardType="numeric" />
            <TextInput style={[styles.input, styles.textArea]} placeholder="سبب النزاع" value={reason} onChangeText={setReason} multiline numberOfLines={4} textAlignVertical="top" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btn} onPress={handleCreate}><Text style={styles.btnText}>إرسال</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}><Text style={styles.cancelText}>إلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingCode: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  reason: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  resolutionBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginTop: 8 },
  resolutionLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  resolution: { fontSize: 14, color: '#374151', marginTop: 4 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right', marginBottom: 12 },
  textArea: { height: 100 },
  modalBtns: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});

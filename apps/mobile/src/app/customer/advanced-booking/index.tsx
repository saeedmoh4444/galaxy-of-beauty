import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const RECURRENCE_OPTIONS = [
  { key: 'WEEKLY', emoji: '📅', label: 'أسبوعي', desc: 'كل أسبوع' },
  { key: 'BIWEEKLY', emoji: '📆', label: 'كل أسبوعين', desc: 'مرة كل أسبوعين' },
  { key: 'MONTHLY', emoji: '🗓️', label: 'شهري', desc: 'مرة في الشهر' },
];

export default function AdvancedBookingScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState('WEEKLY');
  const [occurrences, setOccurrences] = useState(4);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const create = () => {
    if (!selectedSvc) return;
    const startAt = new Date(Date.now() + 86400000).toISOString();
    const endAt = new Date(Date.now() + 86400000 + 3600000).toISOString();
    ((trpc as any).advancedBooking.createRecurring.mutate({
      technicianId: 1, serviceId: selectedSvc, addressId: 1, slotId: 1,
      startAt, endAt, recurrence, occurrences, notes: 'حجز متكرر',
    }) as any).then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🔄 حجز متكرر</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultTitle}>تم إنشاء الحجوزات المتكررة!</Text>
          <Text style={styles.resultCount}>{(result.bookings as any[])?.length ?? occurrences} حجوزات</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔄 حجز متكرر</Text>
      <Text style={styles.sub}>احجزي خدماتكِ المتكررة مرة واحدة</Text>

      <Text style={styles.sectionTitle}>💆‍♀️ اختاري الخدمة</Text>
      {services.slice(0, 10).map((s: any) => (
        <TouchableOpacity key={s.id} onPress={() => setSelectedSvc(s.id as number)} style={[styles.svcCard, selectedSvc === s.id && styles.svcCardActive]}>
          <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
          <Text style={styles.svcName}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>🔁 التكرار</Text>
      <View style={styles.recGrid}>
        {RECURRENCE_OPTIONS.map((r) => (
          <TouchableOpacity key={r.key} onPress={() => setRecurrence(r.key)} style={[styles.recCard, recurrence === r.key && styles.recCardActive]}>
            <Text style={styles.recEmoji}>{r.emoji}</Text>
            <Text style={[styles.recLabel, recurrence === r.key && styles.recLabelActive]}>{r.label}</Text>
            <Text style={styles.recDesc}>{r.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>🔢 عدد المرات: {occurrences}</Text>
      <View style={styles.occRow}>
        {[2, 4, 6, 8, 12].map(n => (
          <TouchableOpacity key={n} onPress={() => setOccurrences(n)} style={[styles.occBtn, occurrences === n && styles.occBtnActive]}>
            <Text style={[styles.occText, occurrences === n && styles.occTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={create} disabled={!selectedSvc} style={[styles.createBtn, !selectedSvc && styles.createBtnDisabled]}>
        <Text style={styles.createBtnText}>🔄 إنشاء {occurrences} حجوزات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  resultEmoji: { fontSize: 48 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  resultCount: { fontSize: 16, fontWeight: '600', color: '#059669', marginTop: 4 },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: '#e5e7eb' },
  svcCardActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  svcEmoji: { fontSize: 26 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  recGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  recCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  recCardActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  recEmoji: { fontSize: 28 }, recLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 4 }, recLabelActive: { color: '#059669' },
  recDesc: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  occRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  occBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  occBtnActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  occText: { fontSize: 14, fontWeight: '600', color: '#6b7280' }, occTextActive: { color: '#059669' },
  createBtn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

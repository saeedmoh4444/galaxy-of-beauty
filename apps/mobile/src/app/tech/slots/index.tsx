import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechSlotsScreen() {
  const [slots, setSlots] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');

  const fetchSlots = () => {
    setLoading(true);
    trpc.slots.getMySlots.query({ startDate: date, endDate: date } as never)
      .then((d) => { setSlots((d as unknown as Record<string, unknown>[]) ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [date]);

  const addSlot = async () => {
    const startAt = new Date(`${date}T09:00:00`).toISOString();
    const endAt = new Date(`${date}T10:00:00`).toISOString();
    try {
      await trpc.slots.createSlots.mutate({ slots: [{ startAt, endAt }] } as never);
      fetchSlots();
    } catch { Alert.alert('خطأ', 'فشل إضافة الموعد'); }
  };

  const deleteSlot = async (id: number) => {
    try {
      await trpc.slots.deleteSlot.mutate({ slotId: id } as never);
      fetchSlots();
    } catch { Alert.alert('خطأ', 'فشل حذف الموعد'); }
  };

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0] ?? ''; });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>المواعيد المتاحة</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {days.map((d) => (
          <TouchableOpacity key={d} style={[styles.dateBtn, d === date && styles.dateActive]} onPress={() => setDate(d)}>
            <Text style={[styles.dateText, d === date && { color: '#fff' }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addBtn} onPress={addSlot}><Text style={styles.addBtnText}>+ إضافة موعد (٩:٠٠ ص)</Text></TouchableOpacity>
      {loading ? <ActivityIndicator color="#7c3aed" /> : slots.length === 0 ? <Text style={styles.empty}>لا توجد مواعيد</Text> : slots.map((s: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.slotTime}>{new Date(s.startAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={{ color: s.isBooked ? '#ef4444' : '#10b981', fontSize: 12 }}>{s.isBooked ? 'محجوز' : 'متاح'}</Text>
          {!s.isBooked && <TouchableOpacity onPress={() => deleteSlot(s.id as number)}><Text style={styles.delBtn}>حذف</Text></TouchableOpacity>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  dateRow: { marginBottom: 16 },
  dateBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6', marginRight: 8 },
  dateActive: { backgroundColor: '#7c3aed' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  slotTime: { fontSize: 14, fontWeight: '600', color: '#111827' },
  delBtn: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});

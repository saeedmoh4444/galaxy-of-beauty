import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechCalendarScreen(): JSX.Element {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).techCalendar.availability.query() as any).then((d: any) => { setSlots(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  const days = slots.reduce((acc: any[], s: any) => {
    const day = new Date(s.date as string).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' });
    const existing = acc.find(x => x.day === day);
    if (existing) { existing.slots.push(s); } else { acc.push({ day, slots: [s] }); }
    return acc;
  }, []);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📅 تقويم الفنيات</Text>
      <Text style={styles.sub}>أوقات توفر الفنيات</Text>
      {days.length === 0 ? <Text style={styles.e}>لا توجد أوقات متاحة</Text> :
        days.map((d: any, di: number) => (
          <View key={di} style={styles.dayGroup}>
            <Text style={styles.dayLabel}>{d.day}</Text>
            {d.slots.map((s: any) => (
              <View key={s.id} style={styles.slot}>
                <Text style={styles.slotTime}>{new Date(s.date as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.slotTech}>👩‍🎨 {s.technician as string}</Text>
                <View style={[styles.slotBadge, s.available ? styles.slotFree : styles.slotBusy]}>
                  <Text style={[styles.slotBadgeText, s.available ? {color:'#059669'} : {color:'#dc2626'}]}>{s.available ? 'متاح' : 'محجوز'}</Text>
                </View>
              </View>
            ))}
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  dayGroup: { marginBottom: 16 },
  dayLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 8 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 4 },
  slotTime: { fontSize: 13, fontWeight: '600', color: '#111827' },
  slotTech: { flex: 1, fontSize: 13, color: '#6b7280' },
  slotBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  slotFree: { backgroundColor: '#dcfce7' }, slotBusy: { backgroundColor: '#fee2e2' },
  slotBadgeText: { fontSize: 11, fontWeight: '600' },
});

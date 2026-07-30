import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RescheduleScreen(): JSX.Element {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).bookings.list.query({ status: 'ACCEPTED', page: 1, limit: 20 }) as any)
      .then((d: any) => { setBookings(d?.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const reschedule = (bookingId: number) => {
    const newDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow
    ((trpc as any).reschedule.request.mutate({ bookingId, newStartAt: newDate, reason: 'طلب تعديل الموعد' }) as any)
      .then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🔄 تعديل الموعد</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultTitle}>تم طلب التعديل</Text>
          <Text style={styles.resultMsg}>سيتم إعلامكِ عند تأكيد الموعد الجديد</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔄 تعديل الموعد</Text>
      <Text style={styles.sub}>اختاري الحجز الذي ترغبين في تعديله</Text>
      {bookings.length === 0 ? <Text style={styles.e}>لا توجد حجوزات قابلة للتعديل</Text> :
        bookings.map((b: any) => (
          <TouchableOpacity key={b.id} onPress={() => setSelected(b.id as number)} style={[styles.card, selected === b.id && styles.cardActive]}>
            <View style={{flex:1}}>
              <Text style={styles.bookingCode}>{b.bookingCode as string}</Text>
              <Text style={styles.bookingDate}>{new Date(b.startAt as string).toLocaleDateString('ar-SA', { weekday:'long', month:'long', day:'numeric' })}</Text>
              <Text style={styles.bookingTime}>{new Date(b.startAt as string).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</Text>
            </View>
            {selected === b.id && (
              <TouchableOpacity onPress={() => reschedule(b.id as number)} style={styles.rescheduleBtn}>
                <Text style={styles.rescheduleBtnText}>تعديل للغد</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  cardActive: { borderWidth: 2, borderColor: '#2563eb' },
  bookingCode: { fontSize: 14, fontWeight: '700', color: '#111827', fontFamily: 'monospace' },
  bookingDate: { fontSize: 13, color: '#374151', marginTop: 2 },
  bookingTime: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rescheduleBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  rescheduleBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  resultEmoji: { fontSize: 48 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  resultMsg: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});

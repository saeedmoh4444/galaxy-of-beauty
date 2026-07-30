import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', PAYMENT_AUTHORIZED: 'تم الدفع',
  CONFIRMED_OFFLINE: 'مؤكد', PAID: 'مدفوع', IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي', NO_SHOW: 'لم تحضر',
};
const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  REQUESTED: { color: '#d97706', bg: '#fef3c7' }, ACCEPTED: { color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { color: '#059669', bg: '#dcfce7' }, CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REJECTED: { color: '#dc2626', bg: '#fee2e2' }, NO_SHOW: { color: '#6b7280', bg: '#f3f4f6' },
  PAID: { color: '#7c3aed', bg: '#ede9fe' }, IN_PROGRESS: { color: '#7c3aed', bg: '#ede9fe' },
};

export default function BookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) { setLoading(false); return; }
    ((trpc as any).bookings.getById.query({ id: bookingId }) as any)
      .then((d: any) => { setBooking(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;
  if (!booking) return <View style={styles.c}><Text style={styles.e}>تعذر تحميل الحجز</Text></View>;

  const sc = STATUS_COLORS[booking.status as string] ?? { color: '#6b7280', bg: '#f3f4f6' };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 تفاصيل الحجز</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>رمز الحجز</Text>
          <Text style={styles.valueCode}>{booking.bookingCode ?? `GOB-${String(booking.id).padStart(6, '0')}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الحالة</Text>
          <View style={[styles.statusBadge, {backgroundColor: sc.bg}]}>
            <Text style={[styles.statusText, {color: sc.color}]}>{STATUS_LABELS[booking.status] || booking.status}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>التاريخ</Text>
          <Text style={styles.value}>{new Date(booking.startAt as string).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الوقت</Text>
          <Text style={styles.value}>{new Date(booking.startAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        {booking.serviceName && (
          <View style={styles.row}>
            <Text style={styles.label}>الخدمة</Text>
            <Text style={styles.value}>{booking.serviceName as string}</Text>
          </View>
        )}
        {booking.technicianName && (
          <View style={styles.row}>
            <Text style={styles.label}>الفنية</Text>
            <Text style={styles.value}>👩‍🎨 {booking.technicianName as string}</Text>
          </View>
        )}
        {booking.totalAmount && (
          <View style={styles.row}>
            <Text style={styles.label}>المبلغ</Text>
            <Text style={styles.valuePrice}>{(booking.totalAmount as number)?.toLocaleString()} ر.س</Text>
          </View>
        )}
      </View>

      {booking.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 ملاحظات</Text>
          <Text style={styles.notes}>{booking.notes as string}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, fontWeight: '600', color: '#111827' },
  valueCode: { fontSize: 14, fontWeight: '700', color: '#db2777', fontFamily: 'monospace' },
  valuePrice: { fontSize: 16, fontWeight: '800', color: '#db2777' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  notes: { fontSize: 13, color: '#374151', lineHeight: 20 },
});

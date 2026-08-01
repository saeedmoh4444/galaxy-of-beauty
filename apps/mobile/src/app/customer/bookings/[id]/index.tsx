import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';

const SL: Record<string, string> = { REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', PAID: 'مدفوع', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي', NO_SHOW: 'لم تحضر' };
const SC: Record<string, { color: string; bg: string }> = {
  REQUESTED: { color: '#d97706', bg: '#fef3c7' }, ACCEPTED: { color: '#2563eb', bg: '#dbeafe' }, COMPLETED: { color: '#059669', bg: '#dcfce7' }, CANCELLED: { color: '#dc2626', bg: '#fee2e2' }, REJECTED: { color: '#dc2626', bg: '#fee2e2' }, NO_SHOW: { color: '#6b7280', bg: '#f3f4f6' }, PAID: { color: '#7c3aed', bg: '#ede9fe' }, IN_PROGRESS: { color: '#7c3aed', bg: '#ede9fe' },
};

export default function BookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    const bookingId = parseInt(id, 10); if (isNaN(bookingId)) { setLoading(false); return; }
    ((trpc as any).bookings.getById.query({ id: bookingId }) as any).then((d: any) => { setBooking(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, [id]);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  if (!booking) return <View style={styles.c}><Text style={styles.e}>تعذر تحميل الحجز</Text></View>;
  const sc = SC[booking.status as string] ?? { color: '#6b7280', bg: '#f3f4f6' };
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#ec4899']} />}>
      <Text style={styles.t}>📋 تفاصيل الحجز</Text>
      <View style={styles.sec}>
        <View style={styles.r}><Text style={styles.l}>رمز الحجز</Text><Text style={styles.vc}>{booking.bookingCode ?? `GOB-${String(booking.id).padStart(6, '0')}`}</Text></View>
        <View style={styles.r}><Text style={styles.l}>الحالة</Text><View style={[styles.sb,{backgroundColor:sc.bg}]}><Text style={[styles.sbt,{color:sc.color}]}>{SL[booking.status] || booking.status}</Text></View></View>
        <View style={styles.r}><Text style={styles.l}>التاريخ</Text><Text style={styles.v}>{new Date(booking.startAt as string).toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</Text></View>
        <View style={styles.r}><Text style={styles.l}>الوقت</Text><Text style={styles.v}>{new Date(booking.startAt as string).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'})}</Text></View>
        {booking.serviceName && <View style={styles.r}><Text style={styles.l}>الخدمة</Text><Text style={styles.v}>{booking.serviceName as string}</Text></View>}
        {booking.technicianName && <View style={styles.r}><Text style={styles.l}>الفنية</Text><Text style={styles.v}>👩‍🎨 {booking.technicianName as string}</Text></View>}
        {booking.totalAmount && <View style={styles.r}><Text style={styles.l}>المبلغ</Text><Text style={styles.vp}>{(booking.totalAmount as number)?.toLocaleString()} ر.س</Text></View>}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  sec: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  r: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  l: { fontSize: 13, color: '#6b7280' }, v: { fontSize: 13, fontWeight: '600', color: '#111827' },
  vc: { fontSize: 14, fontWeight: '700', color: '#db2777', fontFamily: 'monospace' }, vp: { fontSize: 16, fontWeight: '800', color: '#db2777' },
  sb: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 }, sbt: { fontSize: 12, fontWeight: '700' },
});

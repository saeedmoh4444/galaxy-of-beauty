import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface BookingRow {
  id: number;
  bookingCode: string;
  startAt: string;
}

interface BookingsListResult {
  bookings?: BookingRow[];
}

interface RescheduleResult {
  status?: string;
}

export default function RescheduleScreen(): JSX.Element {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<RescheduleResult | null>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (
      typedTrpc().bookings.list.query({
        status: 'ACCEPTED',
        page: 1,
        limit: LARGE_PAGE_SIZE,
      }) as unknown as Promise<BookingsListResult>
    )
      .then((d: BookingsListResult) => {
        setBookings(d?.bookings || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const reschedule = (bookingId: number) => {
    const nd = new Date(Date.now() + 86400000).toISOString();
    (
      typedTrpc().reschedule.request.mutate({
        bookingId,
        newStartAt: nd,
        reason: 'طلب تعديل الموعد',
      }) as Promise<RescheduleResult>
    ).then((d: RescheduleResult) => setResult(d));
  };
  if (loading) return <SkeletonList count={4} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> تعديل الموعد</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>تم طلب التعديل</Text>
          <Text style={styles.rm}>سيتم إعلامكِ عند تأكيد الموعد الجديد</Text>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}> تعديل الموعد</Text>
      {bookings.map((b) => (
        <TouchableOpacity
          key={b.id}
          onPress={() => setSelected(b.id)}
          style={[styles.card, selected === b.id && styles.ca]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.bc}>{b.bookingCode}</Text>
            <Text style={styles.bd}>
              {new Date(b.startAt).toLocaleDateString('ar-SA', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          {selected === b.id && (
            <TouchableOpacity onPress={() => reschedule(b.id)} style={styles.rb}>
              <Text style={styles.rbt}>تعديل للغد</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ca: { borderWidth: 2, borderColor: '#2563eb' },
  bc: { fontSize: 14, fontWeight: '700', color: '#111827', fontFamily: 'monospace' },
  bd: { fontSize: 13, color: '#374151', marginTop: 2 },
  rb: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  rbt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  re: { fontSize: 48 },
  rt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rm: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});

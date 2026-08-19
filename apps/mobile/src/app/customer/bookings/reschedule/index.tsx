import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface BookingRow {
  id: number;
  bookingCode: string;
  startAt: string;
}

interface RescheduleResult {
  status?: string;
}

export default function RescheduleScreen(): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<RescheduleResult | null>(null);
  const { locale, t } = useLocale();

  const bookingsQ = trpc.bookings.list.useQuery({
    status: 'ACCEPTED',
    page: 1,
    limit: LARGE_PAGE_SIZE,
  });
  const bookings: BookingRow[] =
    (bookingsQ.data as unknown as { bookings?: BookingRow[] })?.bookings ?? [];

  const rescheduleMut = trpc.reschedule.request.useMutation({
    onSuccess: (d) => setResult(d as unknown as RescheduleResult),
  });

  const reschedule = (bookingId: number) => {
    const nd = new Date(Date.now() + 86400000).toISOString();
    rescheduleMut.mutate({
      bookingId,
      newStartAt: nd,
      reason: 'طلب تعديل الموعد',
    });
  };
  if (bookingsQ.isLoading) return <SkeletonList count={4} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('bookings.reschedule.title')}</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>{t('bookings.reschedule.requested')}</Text>
          <Text style={styles.rm}>{t('bookings.reschedule.notified')}</Text>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={bookingsQ.isRefetching}
          onRefresh={() => bookingsQ.refetch()}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}>{t('bookings.reschedule.title')}</Text>
      {bookings.map((b) => (
        <TouchableOpacity
          key={b.id}
          onPress={() => setSelected(b.id)}
          style={[styles.card, selected === b.id && styles.ca]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.bc}>{b.bookingCode}</Text>
            <Text style={styles.bd}>
              {new Date(b.startAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          {selected === b.id && (
            <TouchableOpacity onPress={() => reschedule(b.id)} style={styles.rb}>
              <Text style={styles.rbt}>{t('bookings.reschedule.tomorrow')}</Text>
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

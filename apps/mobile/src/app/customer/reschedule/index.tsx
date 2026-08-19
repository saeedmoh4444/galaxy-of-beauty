import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface Booking {
  id?: number;
  status?: string;
  startAt?: string;
  service?: { titleJson?: { ar?: string; en?: string } };
}

interface BookingsData {
  bookings?: Booking[];
}

export default function RescheduleScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const bookingsQ = trpc.bookings.list.useQuery({ page: 1, limit: LARGE_PAGE_SIZE });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  const rescheduleMut = trpc.reschedule.request.useMutation({
    onSuccess: () => {
      setDone(true);
      void bookingsQ.refetch();
    },
  });

  const handleReschedule = () => {
    if (!selectedId || !newDate || !newTime) return;
    rescheduleMut.mutate({
      bookingId: selectedId,
      newStartAt: new Date(`${newDate}T${newTime}:00`).toISOString(),
      reason: reason || undefined,
    });
  };

  if (bookingsQ.isLoading) return <SkeletonList count={3} />;
  if (bookingsQ.isError)
    return <ErrorAlert message={t('booking.load-error')} onRetry={() => bookingsQ.refetch()} />;

  const bookings = (bookingsQ.data as unknown as BookingsData | null)?.bookings ?? [];
  const active = bookings.filter((b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED');

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={bookingsQ.isRefetching}
          onRefresh={() => bookingsQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}>{t('mobile.reschedule.title')}</Text>
      <Text style={s.sub}>{t('mobile.reschedule.subtitle')}</Text>

      {done && (
        <View
          style={{
            backgroundColor: '#ecfdf5',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}></Text>
          <Text style={{ fontWeight: '700', color: '#059669', marginTop: 8 }}>
            {t('mobile.reschedule.success')}
          </Text>
        </View>
      )}

      {active.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}></Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>
            {t('mobile.reschedule.no-reschedulable')}
          </Text>
        </View>
      )}

      {active.map((b) => {
        const isSel = selectedId === b.id;
        return (
          <TouchableOpacity
            key={b.id}
            onPress={() => {
              setSelectedId(isSel ? null : (b.id ?? null));
              setDone(false);
            }}
            style={[s.card, isSel && { borderColor: '#db2777', backgroundColor: '#fdf2f8' }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>
                {t('mobile.reschedule.booking', { id: b.id ?? 0 })}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {b.service?.titleJson ? localize(b.service.titleJson, locale) : ''}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                {b.startAt
                  ? new Date(b.startAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')
                  : ''}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: b.status === 'ACCEPTED' ? '#d1fae5' : '#fef3c7',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 11, color: b.status === 'ACCEPTED' ? '#047857' : '#b45309' }}
              >
                {b.status}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {selectedId && (
        <View
          style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 16, gap: 10 }}
        >
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>
            {t('mobile.reschedule.choose-new-date')}
          </Text>
          <TextInput
            value={newDate}
            onChangeText={setNewDate}
            placeholder="YYYY-MM-DD"
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:MM"
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t('mobile.reschedule.reason-placeholder')}
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={handleReschedule}
            style={[s.btn, (!newDate || !newTime) && { opacity: 0.5 }]}
          >
            <Text style={s.btnText}>{t('mobile.reschedule.confirm')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  btn: { backgroundColor: '#db2777', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  inp: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
  },
});

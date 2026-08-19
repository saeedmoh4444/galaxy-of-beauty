import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ConsultationBooking {
  consultantType?: string;
  slot?: string;
  status?: string;
}

const CONSULTANTS = [
  {
    key: 'skincare',
    emoji: '‍️',
    name: 'اخصائية بشرة',
    specialty: 'تحليل البشرة وتشخيص المشاكل',
    price: 150,
    rating: 4.9,
    slots: ['9:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
  {
    key: 'makeup',
    emoji: '',
    name: 'خبيرة مكياج',
    specialty: 'استشارة مكياج للمناسبات',
    price: 120,
    rating: 4.8,
    slots: ['10:00 ص', '1:00 م', '4:00 م', '7:00 م'],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'مصففة شعر',
    specialty: 'استشارة تسريحات وعناية',
    price: 100,
    rating: 4.7,
    slots: ['9:00 ص', '12:00 م', '3:00 م', '6:00 م'],
  },
  {
    key: 'nutrition',
    emoji: '',
    name: 'اخصائية تغذية',
    specialty: 'تغذية البشرة والشعر',
    price: 130,
    rating: 4.9,
    slots: ['8:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
];

export default function VirtualConsultationScreen(): JSX.Element {
  const { t } = useLocale();
  const bookingsQ = trpc.virtualConsultation.myConsultations.useQuery();
  const [selected, setSelected] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const consultant = CONSULTANTS.find((c) => c.key === selected);

  const bookMut = trpc.virtualConsultation.book.useMutation({
    onSuccess: () => {
      setBooked(true);
    },
    onError: () => {},
  });
  const handleBook = () => {
    if (!consultant || !slot) return;
    bookMut.mutate({
      consultantType: consultant.key,
      scheduledAt: new Date().toISOString(),
      slot,
      price: consultant.price,
    });
  };

  if (bookingsQ.isLoading) return <SkeletonList count={3} />;
  if (bookingsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.virtualConsultation.load-error')}
        onRetry={() => bookingsQ.refetch()}
      />
    );

  const myBookings = (bookingsQ.data ?? []) as ConsultationBooking[];

  return (
    <ScrollView
      style={st.c}
      contentContainerStyle={st.i}
      refreshControl={
        <RefreshControl
          refreshing={bookingsQ.isRefetching}
          onRefresh={() => bookingsQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={st.t}>{t('mobile.virtualConsultation.title')}</Text>
      <Text style={st.sub}>{t('mobile.virtualConsultation.subtitle')}</Text>

      {booked && (
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
            {t('mobile.virtualConsultation.booked')}
          </Text>
        </View>
      )}

      <View style={st.grid}>
        {CONSULTANTS.map((c) => (
          <TouchableOpacity
            key={c.key}
            onPress={() => {
              setSelected(c.key);
              setSlot(null);
            }}
            style={[
              st.consCard,
              selected === c.key && { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
            ]}
          >
            <Text style={{ fontSize: 40, textAlign: 'center' }}>{c.emoji}</Text>
            <Text style={{ fontWeight: '700', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              {c.name}
            </Text>
            <Text style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
              {c.specialty}
            </Text>
            <Text
              style={{ fontWeight: '700', color: '#db2777', textAlign: 'center', marginTop: 4 }}
            >
              {c.price} ر.س · {c.rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {consultant && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            {t('mobile.virtualConsultation.choose-time', {
              name: `${consultant.emoji} ${consultant.name}`,
            })}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {consultant.slots.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSlot(s)}
                style={[st.slotBtn, slot === s && { backgroundColor: '#db2777' }]}
              >
                <Text style={[st.slotText, slot === s && { color: '#fff' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {slot && (
            <TouchableOpacity onPress={handleBook} style={[st.btn, { marginTop: 12 }]}>
              <Text style={st.btnText}>
                {t('mobile.virtualConsultation.book-cta', { price: consultant.price })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {myBookings.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            {t('mobile.virtualConsultation.my-bookings')}
          </Text>
          {myBookings.map((b, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 12,
                marginBottom: 6,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 13 }}>
                {b.consultantType} — {b.slot}
              </Text>
              <Text
                style={{ fontSize: 11, color: b.status === 'CONFIRMED' ? '#059669' : '#f59e0b' }}
              >
                {b.status}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  consCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
  },
  slotBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  slotText: { fontSize: 13, color: '#374151' },
  btn: { backgroundColor: '#db2777', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

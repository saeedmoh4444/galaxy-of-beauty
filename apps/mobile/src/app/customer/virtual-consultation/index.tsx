import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Icon } from '@/components/Icon';
import { SkeletonList } from '@/components/SkeletonCard';
import type { TranslationKey } from '@galaxy/shared';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ConsultationBooking {
  consultantType?: string;
  slot?: string;
  status?: string;
}

interface Consultant {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  specialtyKey: TranslationKey;
  price: number;
  rating: number;
  slotKeys: TranslationKey[];
}

const CONSULTANTS: Consultant[] = [
  {
    key: 'skincare',
    emoji: '🧖',
    nameKey: 'virtualConsultation.consultant.skincare.name',
    specialtyKey: 'virtualConsultation.consultant.skincare.specialty',
    price: 150,
    rating: 4.9,
    slotKeys: [
      'virtualConsultation.slot.9am',
      'virtualConsultation.slot.11am',
      'virtualConsultation.slot.2pm',
      'virtualConsultation.slot.5pm',
    ],
  },
  {
    key: 'makeup',
    emoji: '💄',
    nameKey: 'virtualConsultation.consultant.makeup.name',
    specialtyKey: 'virtualConsultation.consultant.makeup.specialty',
    price: 120,
    rating: 4.8,
    slotKeys: [
      'virtualConsultation.slot.10am',
      'virtualConsultation.slot.1pm',
      'virtualConsultation.slot.4pm',
      'virtualConsultation.slot.7pm',
    ],
  },
  {
    key: 'hair',
    emoji: '💇',
    nameKey: 'virtualConsultation.consultant.hair.name',
    specialtyKey: 'virtualConsultation.consultant.hair.specialty',
    price: 100,
    rating: 4.7,
    slotKeys: [
      'virtualConsultation.slot.9am',
      'virtualConsultation.slot.12pm',
      'virtualConsultation.slot.3pm',
      'virtualConsultation.slot.6pm',
    ],
  },
  {
    key: 'nutrition',
    emoji: '🥗',
    nameKey: 'virtualConsultation.consultant.nutrition.name',
    specialtyKey: 'virtualConsultation.consultant.nutrition.specialty',
    price: 130,
    rating: 4.9,
    slotKeys: [
      'virtualConsultation.slot.8am',
      'virtualConsultation.slot.11am',
      'virtualConsultation.slot.2pm',
      'virtualConsultation.slot.5pm',
    ],
  },
];

export default function VirtualConsultationScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const bookingsQ = trpc.virtualConsultation.myConsultations.useQuery(undefined, {
    enabled: isAuthed,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [slot, setSlot] = useState<TranslationKey | null>(null);
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
      slot: t(slot),
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
          onRefresh={async () => {
            await bookingsQ.refetch();
          }}
          colors={['#c2255c']}
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
          <Icon name="check-circle" size={32} color="#059669" />
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
              {t(c.nameKey)}
            </Text>
            <Text style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
              {t(c.specialtyKey)}
            </Text>
            <Text
              style={{ fontWeight: '700', color: '#db2777', textAlign: 'center', marginTop: 4 }}
            >
              {t('mobile.virtualConsultation.price-rating', {
                price: c.price,
                rating: c.rating,
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {consultant && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            {t('mobile.virtualConsultation.choose-time', {
              name: `${consultant.emoji} ${t(consultant.nameKey)}`,
            })}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {consultant.slotKeys.map((slotKey) => (
              <TouchableOpacity
                key={slotKey}
                onPress={() => setSlot(slotKey)}
                style={[st.slotBtn, slot === slotKey && { backgroundColor: '#db2777' }]}
              >
                <Text style={[st.slotText, slot === slotKey && { color: '#fff' }]}>
                  {t(slotKey)}
                </Text>
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

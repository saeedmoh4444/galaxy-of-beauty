import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Icon } from '@/components/Icon';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { getAuthToken } from '@/lib/authToken';

// The consultant catalog is static (web keeps it static too); the API
// provides the bookings + the book mutation.
interface Consultant {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  specialtyKey: TranslationKey;
  price: number;
  rating: number;
  slots: TranslationKey[];
}

const CONSULTANTS: Consultant[] = [
  {
    key: 'skincare',
    emoji: '🧖',
    nameKey: 'virtualConsultation.consultant.skincare.name',
    specialtyKey: 'virtualConsultation.consultant.skincare.specialty',
    price: 150,
    rating: 4.9,
    slots: [
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
    slots: [
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
    slots: [
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
    slots: [
      'virtualConsultation.slot.8am',
      'virtualConsultation.slot.11am',
      'virtualConsultation.slot.2pm',
      'virtualConsultation.slot.5pm',
    ],
  },
];

interface ConsultationBooking {
  consultantType?: string;
  slot?: string;
  status?: string;
}

export default function VirtualConsultationScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = !!getAuthToken();
  const [selectedCons, setSelectedCons] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TranslationKey | null>(null);
  const [booked, setBooked] = useState(false);
  const utils = trpc.useUtils();

  const bookingsQ = trpc.virtualConsultation.myConsultations.useQuery(undefined, {
    enabled: isAuthed,
  });

  const consultant = CONSULTANTS.find((c) => c.key === selectedCons);

  const bookMut = trpc.virtualConsultation.book.useMutation({
    onSuccess: () => {
      setBooked(true);
      void utils.virtualConsultation.myConsultations.invalidate();
    },
    onError: () => {},
  });
  const handleBook = () => {
    if (!consultant || !selectedSlot || !getAuthToken()) return;
    bookMut.mutate({
      consultantType: consultant.key,
      scheduledAt: new Date().toISOString(),
      slot: t(selectedSlot),
      price: consultant.price,
    });
  };

  const myBookings = (bookingsQ.data as unknown as ConsultationBooking[] | undefined) ?? [];

  return (
    <ScreenState
      isLoading={bookingsQ.isLoading}
      isError={bookingsQ.isError}
      isEmpty={false}
      errorMessage={t('mobile.virtualConsultation.load-error')}
      onRetry={() => bookingsQ.refetch()}
    >
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('mobile.public.virtual-consultation.title')}</Text>
        <Text style={styles.sub}>{t('mobile.public.virtual-consultation.subtitle')}</Text>

        {booked && consultant ? (
          <View style={styles.confirmed}>
            <Icon name="check-circle" size={64} color="#7c3aed" />
            <Text style={styles.cfTitle}>
              {t('mobile.public.virtual-consultation.booked-title')}
            </Text>
            <Text style={styles.cfText}>
              {consultant.emoji} {t(consultant.nameKey)}
            </Text>
            <Text style={styles.cfSlot}>
              {t('mobile.public.virtual-consultation.booked-slot', {
                slot: selectedSlot ? t(selectedSlot) : '',
              })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setBooked(false);
                setSelectedCons(null);
                setSelectedSlot(null);
              }}
              style={styles.cfBtn}
            >
              <Text style={styles.cfBt}>{t('mobile.public.virtual-consultation.done')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {CONSULTANTS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => {
                    setSelectedCons(c.key);
                    setSelectedSlot(null);
                  }}
                  style={[styles.card, selectedCons === c.key && styles.cardA]}
                >
                  <Text style={styles.ce}>{c.emoji}</Text>
                  <Text style={styles.cn}>{t(c.nameKey)}</Text>
                  <Text style={styles.cs}>{t(c.specialtyKey)}</Text>
                  <View style={styles.cm}>
                    <Text style={styles.cp}>
                      {t('mobile.public.virtual-consultation.price', { price: c.price })}
                    </Text>
                    <Text style={styles.cr}> {c.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {consultant && (
              <View style={styles.slots}>
                <Text style={styles.st}>
                  {t('mobile.public.virtual-consultation.choose-time', {
                    emoji: consultant.emoji,
                    name: t(consultant.nameKey),
                  })}
                </Text>
                <View style={styles.slotGrid}>
                  {consultant.slots.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSelectedSlot(s)}
                      style={[styles.slot, selectedSlot === s && styles.slotA]}
                    >
                      <Text style={[styles.slotT, selectedSlot === s && styles.slotTA]}>
                        {t(s)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedSlot && (
                  <TouchableOpacity onPress={handleBook} style={styles.btn}>
                    <Text style={styles.bt}>
                      {t('mobile.public.virtual-consultation.book', { price: consultant.price })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {isAuthed && myBookings.length > 0 && (
          <View style={styles.bookings}>
            <Text style={styles.bookingsTitle}>{t('mobile.virtualConsultation.my-bookings')}</Text>
            {myBookings.map((b, i) => (
              <View key={i} style={styles.bookingRow}>
                <Text style={styles.bookingText}>
                  {b.consultantType} — {b.slot}
                </Text>
                <Text
                  style={[
                    styles.bookingStatus,
                    { color: b.status === 'CONFIRMED' ? '#059669' : '#f59e0b' },
                  ]}
                >
                  {b.status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardA: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  ce: { fontSize: 40 },
  cn: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 4 },
  cs: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cm: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cp: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  cr: { fontSize: 12, color: '#f59e0b' },
  slots: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slot: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slotA: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  slotT: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  slotTA: { color: '#fff' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmed: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  cfTitle: { fontSize: 20, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  cfText: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 8 },
  cfSlot: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  cfBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  cfBt: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  bookings: { marginTop: 20 },
  bookingsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  bookingRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingText: { fontSize: 13 },
  bookingStatus: { fontSize: 11 },
});

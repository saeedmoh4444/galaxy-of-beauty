import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const CONSULTANTS = [
  {
    key: 'skincare',
    emoji: '👩‍⚕️',
    name: 'اخصائية بشرة',
    specialty: 'تحليل البشرة وتشخيص المشاكل',
    price: 150,
    rating: 4.9,
    slots: ['9:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
  {
    key: 'makeup',
    emoji: '💄',
    name: 'خبيرة مكياج',
    specialty: 'استشارة مكياج للمناسبات',
    price: 120,
    rating: 4.8,
    slots: ['10:00 ص', '1:00 م', '4:00 م', '7:00 م'],
  },
  {
    key: 'hair',
    emoji: '💇‍♀️',
    name: 'مصففة شعر',
    specialty: 'استشارة تسريحات وعناية',
    price: 100,
    rating: 4.7,
    slots: ['9:00 ص', '12:00 م', '3:00 م', '6:00 م'],
  },
  {
    key: 'nutrition',
    emoji: '🥗',
    name: 'اخصائية تغذية',
    specialty: 'تغذية البشرة والشعر',
    price: 130,
    rating: 4.9,
    slots: ['8:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
];

export default function VirtualConsultationScreen(): JSX.Element {
  const [selectedCons, setSelectedCons] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const consultant = CONSULTANTS.find((c) => c.key === selectedCons);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📹 استشارة افتراضية</Text>
      <Text style={styles.sub}>استشيري خبيرات التجميل عبر الفيديو</Text>

      {booked && consultant ? (
        <View style={styles.confirmed}>
          <Text style={styles.cfEmoji}>📹</Text>
          <Text style={styles.cfTitle}>تم حجز الاستشارة!</Text>
          <Text style={styles.cfText}>
            {consultant.emoji} {consultant.name}
          </Text>
          <Text style={styles.cfSlot}>📅 {selectedSlot} — الرابط سيصلكِ عبر الإيميل</Text>
          <TouchableOpacity
            onPress={() => {
              setBooked(false);
              setSelectedCons(null);
              setSelectedSlot(null);
            }}
            style={styles.cfBtn}
          >
            <Text style={styles.cfBt}>تم</Text>
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
                <Text style={styles.cn}>{c.name}</Text>
                <Text style={styles.cs}>{c.specialty}</Text>
                <View style={styles.cm}>
                  <Text style={styles.cp}>{c.price} ر.س</Text>
                  <Text style={styles.cr}>⭐ {c.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {consultant && (
            <View style={styles.slots}>
              <Text style={styles.st}>
                📅 اختر الوقت — {consultant.emoji} {consultant.name}
              </Text>
              <View style={styles.slotGrid}>
                {consultant.slots.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSlot(s)}
                    style={[styles.slot, selectedSlot === s && styles.slotA]}
                  >
                    <Text style={[styles.slotT, selectedSlot === s && styles.slotTA]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedSlot && (
                <TouchableOpacity onPress={() => setBooked(true)} style={styles.btn}>
                  <Text style={styles.bt}>📹 احجزي الاستشارة — {consultant.price} ر.س</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
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
  cfEmoji: { fontSize: 64 },
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
});

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
const EVENTS = [
  {
    id: 1,
    emoji: '',
    name: 'معرض العرائس',
    date: '20 سبتمبر',
    location: 'الرياض',
    status: 'upcoming',
    attendees: 120,
  },
  {
    id: 2,
    emoji: '',
    name: 'مهرجان الجمال',
    date: '15 أكتوبر',
    location: 'جدة',
    status: 'upcoming',
    attendees: 250,
  },
  {
    id: 3,
    emoji: '',
    name: 'ورشة مكياج احترافي',
    date: '5 أغسطس',
    location: 'الدمام',
    status: 'active',
    attendees: 30,
  },
  {
    id: 4,
    emoji: '',
    name: 'ملتقى رائدات التجميل',
    date: '1 يوليو',
    location: 'الرياض',
    status: 'completed',
    attendees: 85,
  },
];
export default function AdminBeautyEventsScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}> فعاليات التجميل</Text>
      <Text style={s.sub}>إدارة الفعاليات والمناسبات</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
        {['upcoming', 'active', 'completed'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.fb, st === 'upcoming' && { backgroundColor: '#dbeafe' }]}
          >
            <Text style={[s.ft, st === 'upcoming' && { color: '#2563eb' }]}>
              {st === 'upcoming' ? 'قادمة' : st === 'active' ? 'نشطة' : 'منتهية'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {EVENTS.map((e) => (
        <View key={e.id} style={s.card}>
          <Text style={s.ce}>{e.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{e.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Text style={s.cl}> {e.date}</Text>
              <Text style={s.cl}> {e.location}</Text>
            </View>
            <Text style={s.ca}> {e.attendees} مشاركة</Text>
          </View>
          <View
            style={[
              s.st,
              {
                backgroundColor:
                  e.status === 'upcoming'
                    ? '#dbeafe'
                    : e.status === 'active'
                      ? '#d1fae5'
                      : '#f3f4f6',
              },
            ]}
          >
            <Text
              style={[
                s.stt,
                {
                  color:
                    e.status === 'upcoming'
                      ? '#2563eb'
                      : e.status === 'active'
                        ? '#059669'
                        : '#6b7280',
                },
              ]}
            >
              {e.status === 'upcoming' ? 'قادم' : e.status === 'active' ? 'نشط' : 'منتهي'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  fb: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6' },
  ft: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    gap: 10,
  },
  ce: { fontSize: 32 },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cl: { fontSize: 11, color: '#6b7280' },
  ca: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  st: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stt: { fontSize: 11, fontWeight: '700' },
});
const s = sc;

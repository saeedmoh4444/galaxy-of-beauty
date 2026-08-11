import { View, Text, ScrollView, StyleSheet } from 'react-native';
const SUBS = [
  {
    id: 1,
    customer: 'نورة',
    plan: 'Premium',
    emoji: '👩',
    price: 99,
    status: 'active',
    since: 'يناير 2026',
    nextBilling: '1 سبتمبر',
  },
  {
    id: 2,
    customer: 'مها',
    plan: 'Platinum',
    emoji: '👩',
    price: 299,
    status: 'active',
    since: 'مارس 2026',
    nextBilling: '15 سبتمبر',
  },
  {
    id: 3,
    customer: 'ريم',
    plan: 'Basic',
    emoji: '👩',
    price: 0,
    status: 'active',
    since: 'يونيو 2026',
    nextBilling: '—',
  },
  {
    id: 4,
    customer: 'سارة',
    plan: 'Premium',
    emoji: '👩',
    price: 99,
    status: 'cancelled',
    since: 'فبراير 2026',
    nextBilling: '—',
  },
];
export default function AdminSubscriptionsScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>🔄 الاشتراكات</Text>
      <Text style={s.sub}>إدارة اشتراكات العضوية</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 16,
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#7c3aed' }}>4</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>نشطة</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#059669' }}>497</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>ر.س شهرياً</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#d97706' }}>1</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>ملغاة</Text>
        </View>
      </View>
      {SUBS.map((sb) => (
        <View key={sb.id} style={[s.card, { opacity: sb.status === 'cancelled' ? 0.5 : 1 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={s.ce}>{sb.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cn}>{sb.customer}</Text>
              <Text style={s.cp}>
                {sb.plan} · {sb.price === 0 ? 'مجاناً' : `${sb.price} ر.س/شهر`}
              </Text>
            </View>
            <View
              style={[s.b, { backgroundColor: sb.status === 'active' ? '#d1fae5' : '#fee2e2' }]}
            >
              <Text style={[s.bt, { color: sb.status === 'active' ? '#059669' : '#dc2626' }]}>
                {sb.status === 'active' ? 'نشط' : 'ملغى'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <Text style={s.cl}>📅 منذ {sb.since}</Text>
            <Text style={s.cl}>🔄 {sb.nextBilling}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  ce: { fontSize: 28 },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cp: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  b: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  bt: { fontSize: 11, fontWeight: '700' },
  cl: { fontSize: 11, color: '#6b7280' },
});
const s = sc;

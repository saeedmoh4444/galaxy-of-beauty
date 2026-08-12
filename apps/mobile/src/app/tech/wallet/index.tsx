import { View, Text, ScrollView, StyleSheet } from 'react-native';
const TRANSACTIONS = [
  { id: 1, type: 'credit', amount: 350, desc: 'حجز — مكياج سارة', date: '15 أغسطس', emoji: '💄' },
  { id: 2, type: 'credit', amount: 150, desc: 'حجز — مانيكير نورة', date: '14 أغسطس', emoji: '💅' },
  { id: 3, type: 'debit', amount: 200, desc: 'سحب للمحفظة البنكية', date: '10 أغسطس', emoji: '🏦' },
  { id: 4, type: 'credit', amount: 500, desc: 'حجز — مساج مجموعة', date: '5 أغسطس', emoji: '💆' },
  { id: 5, type: 'bonus', amount: 50, desc: 'مكافأة تقييم 5 نجوم', date: '1 أغسطس', emoji: '⭐' },
];
export default function TechWalletScreen(): JSX.Element {
  const balance = 4850;
  const pending = 750;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>💰 المحفظة</Text>
      <View style={s.bc}>
        <Text style={s.bl}>الرصيد الحالي</Text>
        <Text style={s.bv}>{balance.toLocaleString()} ر.س</Text>
        <Text style={s.bp}>💰 {pending.toLocaleString()} ر.س قيد التسوية</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={[s.stat, { backgroundColor: '#d1fae5' }]}>
          <Text style={[s.sv, { color: '#059669' }]}>12,450</Text>
          <Text style={s.sl}>الشهر الحالي</Text>
        </View>
        <View style={[s.stat, { backgroundColor: '#dbeafe' }]}>
          <Text style={[s.sv, { color: '#2563eb' }]}>48</Text>
          <Text style={s.sl}>حجز مكتمل</Text>
        </View>
      </View>
      <Text style={s.ct}>📋 آخر المعاملات</Text>
      {TRANSACTIONS.map((t) => (
        <View key={t.id} style={s.card}>
          <Text style={s.ce}>{t.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{t.desc}</Text>
            <Text style={s.cd}>{t.date}</Text>
          </View>
          <Text
            style={[
              s.ca,
              {
                color: t.type === 'debit' ? '#dc2626' : t.type === 'bonus' ? '#8b5cf6' : '#059669',
              },
            ]}
          >
            {t.type === 'debit' ? '-' : '+'}
            {t.amount.toLocaleString()} ر.س
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 16 },
  bc: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  bl: { fontSize: 14, color: '#ddd6fe' },
  bv: { fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 4 },
  bp: { fontSize: 13, color: '#c4b5fd', marginTop: 8 },
  stat: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  sv: { fontSize: 24, fontWeight: '800' },
  sl: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  ce: { fontSize: 22 },
  cn: { fontSize: 13, fontWeight: '600', color: '#111827' },
  cd: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  ca: { fontSize: 15, fontWeight: '700' },
});
const s = sc;

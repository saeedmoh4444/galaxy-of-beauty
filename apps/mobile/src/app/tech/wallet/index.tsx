import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
const TRANSACTIONS = [
  { id: 1, type: 'credit', amount: 350, desc: 'حجز — مكياج سارة', date: '15 أغسطس', emoji: '' },
  { id: 2, type: 'credit', amount: 150, desc: 'حجز — مانيكير نورة', date: '14 أغسطس', emoji: '' },
  { id: 3, type: 'debit', amount: 200, desc: 'سحب للمحفظة البنكية', date: '10 أغسطس', emoji: '' },
  { id: 4, type: 'credit', amount: 500, desc: 'حجز — مساج مجموعة', date: '5 أغسطس', emoji: '' },
  { id: 5, type: 'bonus', amount: 50, desc: 'مكافأة تقييم 5 نجوم', date: '1 أغسطس', emoji: '' },
];
export default function TechWalletScreen(): JSX.Element {
  const { t } = useLocale();
  const balance = 4850;
  const pending = 750;
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.tech.wallet.title')}</Text>
      <View style={s.bc}>
        <Text style={s.bl}>{t('mobile.tech.wallet.current-balance')}</Text>
        <Text style={s.bv}>
          {balance.toLocaleString()} {t('misc.sar')}
        </Text>
        <Text style={s.bp}>
          {t('mobile.tech.wallet.pending-settlement', { amount: pending.toLocaleString() })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={[s.stat, { backgroundColor: '#d1fae5' }]}>
          <Text style={[s.sv, { color: '#059669' }]}>12,450</Text>
          <Text style={s.sl}>{t('mobile.tech.wallet.current-month')}</Text>
        </View>
        <View style={[s.stat, { backgroundColor: '#dbeafe' }]}>
          <Text style={[s.sv, { color: '#2563eb' }]}>48</Text>
          <Text style={s.sl}>{t('mobile.tech.wallet.completed-bookings')}</Text>
        </View>
      </View>
      <Text style={s.ct}>{t('mobile.tech.wallet.recent-transactions')}</Text>
      {TRANSACTIONS.map((tx) => (
        <View key={tx.id} style={s.card}>
          <Text style={s.ce}>{tx.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{tx.desc}</Text>
            <Text style={s.cd}>{tx.date}</Text>
          </View>
          <Text
            style={[
              s.ca,
              {
                color:
                  tx.type === 'debit' ? '#dc2626' : tx.type === 'bonus' ? '#8b5cf6' : '#059669',
              },
            ]}
          >
            {tx.type === 'debit' ? '-' : '+'}
            {tx.amount.toLocaleString()} {t('misc.sar')}
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

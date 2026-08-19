import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
const TIERS = [
  { name: 'برونزي', emoji: '', points: 0, color: '#d97706', discount: 0, members: 1250 },
  { name: 'فضي', emoji: '', points: 500, color: '#9ca3af', discount: 10, members: 680 },
  { name: 'ذهبي', emoji: '', points: 2000, color: '#f59e0b', discount: 15, members: 320 },
  { name: 'بلاتيني', emoji: '', points: 5000, color: '#7c3aed', discount: 20, members: 85 },
];
export default function AdminLoyaltyScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.loyalty.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.loyalty.subtitle')}</Text>
      {TIERS.map((tier) => (
        <View key={tier.name} style={[s.card, { borderLeftColor: tier.color, borderLeftWidth: 4 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={s.ce}>{tier.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.cn, { color: tier.color }]}>{tier.name}</Text>
              <Text style={s.cd}>
                {t('mobile.admin.loyalty.tier-summary', {
                  discount: tier.discount,
                  points: tier.points.toLocaleString(),
                })}
              </Text>
            </View>
            <Text style={s.cm}>
              {t('mobile.admin.loyalty.members-count', { count: tier.members.toLocaleString() })}
            </Text>
          </View>
        </View>
      ))}
      <View style={[s.card, { marginTop: 16 }]}>
        <Text style={s.cn}>{t('mobile.admin.loyalty.stats')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <View style={s.stat}>
            <Text style={s.sv}>2,335</Text>
            <Text style={s.sl}>{t('mobile.admin.loyalty.total-members')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.sv}>4.8M</Text>
            <Text style={s.sl}>{t('mobile.admin.loyalty.points-awarded')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.sv}>85%</Text>
            <Text style={s.sl}>{t('mobile.admin.loyalty.retention-rate')}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  ce: { fontSize: 28 },
  cn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cm: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  stat: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  sv: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sl: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
const s = sc;

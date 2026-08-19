import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
const PROMOS = [
  {
    id: 1,
    code: 'SUMMER30',
    emoji: '️',
    discount: 30,
    type: 'percentage',
    uses: 45,
    maxUses: 100,
    active: true,
    expires: '31 أغسطس',
  },
  {
    id: 2,
    code: 'WELCOME50',
    emoji: '',
    discount: 50,
    type: 'fixed',
    uses: 120,
    maxUses: 200,
    active: true,
    expires: '31 ديسمبر',
  },
  {
    id: 3,
    code: 'RAMADAN20',
    emoji: '',
    discount: 20,
    type: 'percentage',
    uses: 200,
    maxUses: 200,
    active: false,
    expires: 'انتهت',
  },
];
export default function AdminPromoScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.promo.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.promo.subtitle')}</Text>
      {PROMOS.map((p) => (
        <View key={p.id} style={[s.card, { opacity: p.active ? 1 : 0.6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={s.ce}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cc}>{p.code}</Text>
              <Text style={s.cd}>
                {p.type === 'percentage'
                  ? t('mobile.admin.promo.discount-percent', { discount: p.discount })
                  : t('mobile.admin.promo.discount-fixed', { discount: p.discount })}
                {' · '}
                {p.expires}
              </Text>
            </View>
            <View style={[s.b, { backgroundColor: p.active ? '#d1fae5' : '#fee2e2' }]}>
              <Text style={[s.bt, { color: p.active ? '#059669' : '#dc2626' }]}>
                {p.active ? t('admin.enabled') : t('admin.promo.expired')}
              </Text>
            </View>
          </View>
          <View style={s.pb}>
            <View style={[s.pf, { width: `${(p.uses / p.maxUses) * 100}%` }]} />
          </View>
          <Text style={s.pu}>{t('mobile.admin.promo.uses', { used: p.uses, max: p.maxUses })}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn}>
        <Text style={s.btnText}>{t('mobile.admin.promo.add-code')}</Text>
      </TouchableOpacity>
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
  cc: { fontSize: 18, fontWeight: '800', color: '#111827', fontFamily: 'monospace' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  b: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  bt: { fontSize: 11, fontWeight: '700' },
  pb: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  pf: { height: 8, backgroundColor: '#8b5cf6', borderRadius: 4 },
  pu: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  btn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
const s = sc;

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
// NO API: aiFeatures router has no procedure that lists AI feature flags/toggles
// (only generateDescription/analyzeSentiment admin mutations + customer-side
// personalizedFeed/smartSchedule queries; web admin page is mutation-only with
// local state) — the feature list stays static.
export default function AIFeaturesScreen(): JSX.Element {
  const { t } = useLocale();
  const features = [
    {
      key: 'ai_routine',
      emoji: '',
      name: 'روتين ذكي',
      desc: 'توليد روتين عناية مخصص',
      enabled: true,
    },
    {
      key: 'ai_advisor',
      emoji: '',
      name: 'مستشارة AI',
      desc: 'محادثات ذكية للإجابة',
      enabled: true,
    },
    {
      key: 'ai_color',
      emoji: '',
      name: 'تحليل ألوان AI',
      desc: 'تحليل لون البشرة آلياً',
      enabled: false,
    },
    {
      key: 'ai_skin',
      emoji: '',
      name: 'تحليل بشرة AI',
      desc: 'تشخيص مشاكل البشرة',
      enabled: true,
    },
  ];
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.ai-features.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.ai-features.subtitle')}</Text>
      {features.map((f) => (
        <View key={f.key} style={s.card}>
          <Text style={s.ce}>{f.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{f.name}</Text>
            <Text style={s.cd}>{f.desc}</Text>
          </View>
          <TouchableOpacity style={[s.t, { backgroundColor: f.enabled ? '#059669' : '#6b7280' }]}>
            <Text style={s.tt}>{f.enabled ? t('admin.enabled') : t('admin.disabled')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  ce: { fontSize: 32 },
  cn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  t: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  tt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
const s = sc;

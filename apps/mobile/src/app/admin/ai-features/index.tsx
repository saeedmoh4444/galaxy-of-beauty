import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface AiFeature {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  enabled: boolean;
}

// NO API: aiFeatures router has no procedure that lists AI feature flags/toggles
// (only generateDescription/analyzeSentiment admin mutations + customer-side
// personalizedFeed/smartSchedule queries; web admin page is mutation-only with
// local state) — the feature list stays static.
const FEATURES: AiFeature[] = [
  {
    key: 'ai_routine',
    emoji: '🧴',
    nameKey: 'mobile.adminAiFeatures.feature.aiRoutine.name',
    descKey: 'mobile.adminAiFeatures.feature.aiRoutine.desc',
    enabled: true,
  },
  {
    key: 'ai_advisor',
    emoji: '💬',
    nameKey: 'mobile.adminAiFeatures.feature.aiAdvisor.name',
    descKey: 'mobile.adminAiFeatures.feature.aiAdvisor.desc',
    enabled: true,
  },
  {
    key: 'ai_color',
    emoji: '🎨',
    nameKey: 'mobile.adminAiFeatures.feature.aiColor.name',
    descKey: 'mobile.adminAiFeatures.feature.aiColor.desc',
    enabled: false,
  },
  {
    key: 'ai_skin',
    emoji: '🔬',
    nameKey: 'mobile.adminAiFeatures.feature.aiSkin.name',
    descKey: 'mobile.adminAiFeatures.feature.aiSkin.desc',
    enabled: true,
  },
];

export default function AIFeaturesScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.ai-features.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.ai-features.subtitle')}</Text>
      {FEATURES.map((f) => (
        <View key={f.key} style={s.card}>
          <Text style={s.ce}>{f.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{t(f.nameKey)}</Text>
            <Text style={s.cd}>{t(f.descKey)}</Text>
          </View>
          <View style={[s.t, { backgroundColor: f.enabled ? '#059669' : '#6b7280' }]}>
            <Text style={s.tt}>{f.enabled ? t('admin.enabled') : t('admin.disabled')}</Text>
          </View>
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

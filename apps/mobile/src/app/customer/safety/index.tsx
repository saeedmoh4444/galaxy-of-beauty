import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface SafetyItem {
  emoji: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  color: string;
  bg: string;
}

const SAFETY_ITEMS: SafetyItem[] = [
  {
    emoji: '🆘',
    titleKey: 'mobile.safety.item.emergencyButton.title',
    descKey: 'mobile.safety.item.emergencyButton.desc',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    emoji: '🚗',
    titleKey: 'mobile.safety.item.carEscort.title',
    descKey: 'mobile.safety.item.carEscort.desc',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    emoji: '📍',
    titleKey: 'mobile.safety.item.locationSharing.title',
    descKey: 'mobile.safety.item.locationSharing.desc',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    emoji: '🏠',
    titleKey: 'mobile.safety.item.homeArrival.title',
    descKey: 'mobile.safety.item.homeArrival.desc',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    emoji: '🎭',
    titleKey: 'mobile.safety.item.alias.title',
    descKey: 'mobile.safety.item.alias.desc',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    emoji: '📞',
    titleKey: 'mobile.safety.item.safeCall.title',
    descKey: 'mobile.safety.item.safeCall.desc',
    color: '#06b6d4',
    bg: '#ecfeff',
  },
  {
    emoji: '🙈',
    titleKey: 'mobile.safety.item.faceBlur.title',
    descKey: 'mobile.safety.item.faceBlur.desc',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    emoji: '👻',
    titleKey: 'mobile.safety.item.incognito.title',
    descKey: 'mobile.safety.item.incognito.desc',
    color: '#d946ef',
    bg: '#fdf4ff',
  },
  {
    emoji: '🤝',
    titleKey: 'mobile.safety.item.consentShield.title',
    descKey: 'mobile.safety.item.consentShield.desc',
    color: '#14b8a6',
    bg: '#f0fdfa',
  },
];

export default function SafetyScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.safety.title')}</Text>
      <Text style={s.sub}>{t('mobile.safety.subtitle')}</Text>
      <View style={s.grid}>
        {SAFETY_ITEMS.map((item, i) => (
          <View key={i} style={[s.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
            <Text style={s.ce}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.ct}>{t(item.titleKey)}</Text>
              <Text style={s.cs}>{t(item.descKey)}</Text>
            </View>
            <View style={[s.btn, { backgroundColor: item.color }]}>
              <Text style={s.bt}>{t('mobile.safety.activate')}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  grid: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  ce: { fontSize: 28 },
  ct: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cs: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  btn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
const s = sc;

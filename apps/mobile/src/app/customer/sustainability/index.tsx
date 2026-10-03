import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}
interface Card {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: Card[] = [
  {
    emoji: '🌿',
    titleKey: 'mobile.sustainability.card.greenSalon.title',
    subtitleKey: 'mobile.sustainability.card.greenSalon.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '♻️', textKey: 'mobile.sustainability.card.greenSalon.tip1' },
      { emoji: '🌿', textKey: 'mobile.sustainability.card.greenSalon.tip2' },
      { emoji: '💡', textKey: 'mobile.sustainability.card.greenSalon.tip3' },
      { emoji: '💧', textKey: 'mobile.sustainability.card.greenSalon.tip4' },
    ],
  },
  {
    emoji: '♿',
    titleKey: 'mobile.sustainability.card.accessibleSalon.title',
    subtitleKey: 'mobile.sustainability.card.accessibleSalon.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '♿', textKey: 'mobile.sustainability.card.accessibleSalon.tip1' },
      { emoji: '🤟', textKey: 'mobile.sustainability.card.accessibleSalon.tip2' },
      { emoji: '🦻', textKey: 'mobile.sustainability.card.accessibleSalon.tip3' },
      { emoji: '🦯', textKey: 'mobile.sustainability.card.accessibleSalon.tip4' },
    ],
  },
  {
    emoji: '🧘',
    titleKey: 'mobile.sustainability.card.sensorySalon.title',
    subtitleKey: 'mobile.sustainability.card.sensorySalon.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🤫', textKey: 'mobile.sustainability.card.sensorySalon.tip1' },
      { emoji: '🌙', textKey: 'mobile.sustainability.card.sensorySalon.tip2' },
      { emoji: '🚫', textKey: 'mobile.sustainability.card.sensorySalon.tip3' },
      { emoji: '🗺️', textKey: 'mobile.sustainability.card.sensorySalon.tip4' },
    ],
  },
  {
    emoji: '🌍',
    titleKey: 'mobile.sustainability.card.beautyForAll.title',
    subtitleKey: 'mobile.sustainability.card.beautyForAll.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🎨', textKey: 'mobile.sustainability.card.beautyForAll.tip1' },
      { emoji: '💇', textKey: 'mobile.sustainability.card.beautyForAll.tip2' },
      { emoji: '🧓', textKey: 'mobile.sustainability.card.beautyForAll.tip3' },
      { emoji: '🫶', textKey: 'mobile.sustainability.card.beautyForAll.tip4' },
    ],
  },
  {
    emoji: '🧎',
    titleKey: 'mobile.sustainability.card.prayerRoom.title',
    subtitleKey: 'mobile.sustainability.card.prayerRoom.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🕌', textKey: 'mobile.sustainability.card.prayerRoom.tip1' },
      { emoji: '🧕', textKey: 'mobile.beautyServices.prayerRoom.tip2' },
      { emoji: '🧭', textKey: 'mobile.beautyServices.prayerRoom.tip3' },
      { emoji: '💧', textKey: 'mobile.beautyServices.prayerRoom.tip4' },
    ],
  },
  {
    emoji: '☕',
    titleKey: 'mobile.sustainability.card.hospitalityCorner.title',
    subtitleKey: 'mobile.sustainability.card.hospitalityCorner.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '☕', textKey: 'mobile.sustainability.card.hospitalityCorner.tip1' },
      { emoji: '🍵', textKey: 'mobile.sustainability.card.hospitalityCorner.tip2' },
      { emoji: '💧', textKey: 'mobile.sustainability.card.hospitalityCorner.tip3' },
      { emoji: '🌴', textKey: 'mobile.sustainability.card.hospitalityCorner.tip4' },
    ],
  },
  {
    emoji: '🎁',
    titleKey: 'mobile.sustainability.card.unexpectedGift.title',
    subtitleKey: 'mobile.sustainability.card.unexpectedGift.subtitle',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '💐', textKey: 'mobile.sustainability.card.unexpectedGift.tip1' },
      { emoji: '💌', textKey: 'mobile.beautyInnovation.card.randomKindness.tip2' },
      { emoji: '🎁', textKey: 'mobile.sustainability.card.unexpectedGift.tip3' },
      { emoji: '💝', textKey: 'mobile.sustainability.card.unexpectedGift.tip4' },
    ],
  },
  {
    emoji: '⏳',
    titleKey: 'mobile.sustainability.card.noRush.title',
    subtitleKey: 'mobile.sustainability.card.noRush.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '☕', textKey: 'mobile.sustainability.card.noRush.tip1' },
      { emoji: '💬', textKey: 'mobile.sustainability.card.noRush.tip2' },
      { emoji: '📅', textKey: 'mobile.sustainability.card.noRush.tip3' },
      { emoji: '🙋', textKey: 'mobile.sustainability.card.noRush.tip4' },
    ],
  },
  {
    emoji: '🌱',
    titleKey: 'mobile.sustainability.card.zeroWasteBeauty.title',
    subtitleKey: 'mobile.sustainability.card.zeroWasteBeauty.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧼', textKey: 'mobile.sustainability.card.zeroWasteBeauty.tip1' },
      { emoji: '🧺', textKey: 'mobile.sustainability.card.zeroWasteBeauty.tip2' },
      { emoji: '🧴', textKey: 'mobile.sustainability.card.zeroWasteBeauty.tip3' },
      { emoji: '📦', textKey: 'mobile.sustainability.card.zeroWasteBeauty.tip4' },
    ],
  },
  {
    emoji: '♻️',
    titleKey: 'mobile.sustainability.card.refillablePackaging.title',
    subtitleKey: 'mobile.sustainability.card.refillablePackaging.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💰', textKey: 'mobile.sustainability.card.refillablePackaging.tip1' },
      { emoji: '♻️', textKey: 'mobile.sustainability.card.refillablePackaging.tip2' },
      { emoji: '💄', textKey: 'mobile.sustainability.card.refillablePackaging.tip3' },
      { emoji: '🔄', textKey: 'mobile.sustainability.card.refillablePackaging.tip4' },
    ],
  },
  {
    emoji: '🧪',
    titleKey: 'mobile.sustainability.card.cleanBeauty.title',
    subtitleKey: 'mobile.sustainability.card.cleanBeauty.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🚫', textKey: 'mobile.sustainability.card.cleanBeauty.tip1' },
      { emoji: '🌱', textKey: 'mobile.sustainability.card.cleanBeauty.tip2' },
      { emoji: '🔍', textKey: 'mobile.sustainability.card.cleanBeauty.tip3' },
      { emoji: '📜', textKey: 'mobile.sustainability.card.cleanBeauty.tip4' },
    ],
  },
  {
    emoji: '🔄',
    titleKey: 'mobile.sustainability.card.recycledBeauty.title',
    subtitleKey: 'mobile.sustainability.card.recycledBeauty.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '☕', textKey: 'mobile.sustainability.card.recycledBeauty.tip1' },
      { emoji: '🍊', textKey: 'mobile.sustainability.card.recycledBeauty.tip2' },
      { emoji: '🥑', textKey: 'mobile.sustainability.card.recycledBeauty.tip3' },
      { emoji: '🌾', textKey: 'mobile.sustainability.card.recycledBeauty.tip4' },
    ],
  },
  {
    emoji: '🚯',
    titleKey: 'mobile.sustainability.card.plasticFreeBeauty.title',
    subtitleKey: 'mobile.sustainability.card.plasticFreeBeauty.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🪥', textKey: 'mobile.sustainability.card.plasticFreeBeauty.tip1' },
      { emoji: '🫙', textKey: 'mobile.sustainability.card.plasticFreeBeauty.tip2' },
      { emoji: '🪒', textKey: 'mobile.sustainability.card.plasticFreeBeauty.tip3' },
      { emoji: '🧼', textKey: 'mobile.sustainability.card.plasticFreeBeauty.tip4' },
    ],
  },
  {
    emoji: '🌱',
    titleKey: 'mobile.sustainability.card.veganBeauty.title',
    subtitleKey: 'mobile.sustainability.card.veganBeauty.subtitle',
    color: '#16a34a',
    bg: '#f0fdf4',
    tips: [
      { emoji: '🚫', textKey: 'mobile.sustainability.card.veganBeauty.tip1' },
      { emoji: '🌱', textKey: 'mobile.sustainability.card.veganBeauty.tip2' },
      { emoji: '🔍', textKey: 'mobile.sustainability.card.veganBeauty.tip3' },
      { emoji: '📖', textKey: 'mobile.sustainability.card.veganBeauty.tip4' },
    ],
  },
  {
    emoji: '🕌',
    titleKey: 'mobile.sustainability.card.halalBeauty.title',
    subtitleKey: 'mobile.sustainability.card.halalBeauty.subtitle',
    color: '#059669',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🚫', textKey: 'mobile.sustainability.card.halalBeauty.tip1' },
      { emoji: '💧', textKey: 'mobile.sustainability.card.halalBeauty.tip2' },
      { emoji: '📜', textKey: 'mobile.sustainability.card.halalBeauty.tip3' },
      { emoji: '🌙', textKey: 'mobile.sustainability.card.halalBeauty.tip4' },
    ],
  },
  {
    emoji: '🐰',
    titleKey: 'mobile.sustainability.card.crueltyFree.title',
    subtitleKey: 'mobile.sustainability.card.crueltyFree.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🐰', textKey: 'mobile.sustainability.card.crueltyFree.tip1' },
      { emoji: '✅', textKey: 'mobile.sustainability.card.crueltyFree.tip2' },
      { emoji: '🚫', textKey: 'mobile.sustainability.card.crueltyFree.tip3' },
      { emoji: '⚠️', textKey: 'mobile.sustainability.card.crueltyFree.tip4' },
    ],
  },
  {
    emoji: '🌾',
    titleKey: 'mobile.sustainability.card.glutenFree.title',
    subtitleKey: 'mobile.sustainability.card.glutenFree.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '⚠️', textKey: 'mobile.sustainability.card.glutenFree.tip1' },
      { emoji: '🌾', textKey: 'mobile.sustainability.card.glutenFree.tip2' },
      { emoji: '🔍', textKey: 'mobile.sustainability.card.glutenFree.tip3' },
      { emoji: '🩺', textKey: 'mobile.sustainability.card.glutenFree.tip4' },
    ],
  },
  {
    emoji: '🌸',
    titleKey: 'mobile.sustainability.card.fragranceFree.title',
    subtitleKey: 'mobile.sustainability.card.fragranceFree.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '⚠️', textKey: 'mobile.sustainability.card.fragranceFree.tip1' },
      { emoji: '🔍', textKey: 'mobile.sustainability.card.fragranceFree.tip2' },
      { emoji: '🌿', textKey: 'mobile.sustainability.card.fragranceFree.tip3' },
      { emoji: '🩺', textKey: 'mobile.sustainability.card.fragranceFree.tip4' },
    ],
  },
];

export default function SustainabilityScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.sustainability.title')}</Text>
      <Text style={s.sub}>{t('mobile.sustainability.subtitle')}</Text>
      <View style={s.grid}>
        {CARDS.map((c, i) => (
          <View key={i} style={[s.card, { borderColor: c.color + '30' }]}>
            <View style={s.ch}>
              <Text style={s.ce}>{c.emoji}</Text>
              <View style={s.cw}>
                <Text style={[s.ct, { color: c.color }]}>{t(c.titleKey)}</Text>
                <Text style={s.cs}>{t(c.subtitleKey)}</Text>
              </View>
            </View>
            <View style={s.tl}>
              {c.tips.map((tip, j) => (
                <View key={j} style={[s.tr, { backgroundColor: c.bg }]}>
                  <Text style={s.te}>{tip.emoji}</Text>
                  <Text style={[s.tt, { color: c.color }]}>{t(tip.textKey)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  grid: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ce: { fontSize: 28 },
  cw: { flex: 1 },
  ct: { fontSize: 15, fontWeight: '700' },
  cs: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tl: { gap: 6 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  te: { fontSize: 14, width: 20, textAlign: 'center' },
  tt: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
const s = sc;

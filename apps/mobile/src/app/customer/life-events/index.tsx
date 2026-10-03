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
    emoji: '🌸',
    titleKey: 'mobile.lifeEvents.title',
    subtitleKey: 'mobile.lifeEvents.card.lifeStages.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🌱', textKey: 'mobile.lifeEvents.card.lifeStages.tip1' },
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.lifeStages.tip2' },
      { emoji: '💡', textKey: 'mobile.lifeEvents.card.lifeStages.tip3' },
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.lifeStages.tip4' },
    ],
  },
  {
    emoji: '👰',
    titleKey: 'mobile.lifeEvents.card.brideJourney.title',
    subtitleKey: 'mobile.lifeEvents.card.brideJourney.subtitle',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '🌱', textKey: 'mobile.lifeEvents.card.brideJourney.tip1' },
      { emoji: '✨', textKey: 'mobile.lifeEvents.card.brideJourney.tip2' },
      { emoji: '💄', textKey: 'mobile.lifeEvents.card.brideJourney.tip3' },
      { emoji: '💇', textKey: 'mobile.lifeEvents.card.brideJourney.tip4' },
    ],
  },
  {
    emoji: '👑',
    titleKey: 'mobile.lifeEvents.card.goldenBeauty.title',
    subtitleKey: 'mobile.lifeEvents.card.goldenBeauty.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.goldenBeauty.tip1' },
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.goldenBeauty.tip2' },
      { emoji: '✨', textKey: 'mobile.personalCare.card.chestCare.tip2' },
      { emoji: '💖', textKey: 'mobile.lifeEvents.card.goldenBeauty.tip4' },
    ],
  },
  {
    emoji: '💼',
    titleKey: 'mobile.lifeEvents.card.careerBeauty.title',
    subtitleKey: 'mobile.lifeEvents.card.careerBeauty.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '⏰', textKey: 'mobile.lifeEvents.card.careerBeauty.tip1' },
      { emoji: '💄', textKey: 'mobile.lifeEvents.card.careerBeauty.tip2' },
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.careerBeauty.tip3' },
      { emoji: '✨', textKey: 'mobile.lifeEvents.card.careerBeauty.tip4' },
    ],
  },
  {
    emoji: '👶',
    titleKey: 'mobile.familyBeauty.postpartumCare.title',
    subtitleKey: 'mobile.lifeEvents.card.postpartumRecovery.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💆', textKey: 'mobile.familyBeauty.bridalBody.tip2' },
      { emoji: '🧴', textKey: 'mobile.familyBeauty.newMomSupport.tip2' },
      { emoji: '⏰', textKey: 'mobile.lifeEvents.card.postpartumRecovery.tip3' },
      { emoji: '🏠', textKey: 'mobile.lifeEvents.card.postpartumRecovery.tip4' },
    ],
  },
  {
    emoji: '🎒',
    titleKey: 'mobile.lifeEvents.card.teenSkin.title',
    subtitleKey: 'mobile.lifeEvents.card.teenSkin.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.teenSkin.tip1' },
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.teenSkin.tip2' },
      { emoji: '🌿', textKey: 'mobile.lifeEvents.card.teenSkin.tip3' },
      { emoji: '💡', textKey: 'mobile.lifeEvents.card.teenSkin.tip4' },
    ],
  },
  {
    emoji: '🌱',
    titleKey: 'mobile.lifeEvents.card.twenties.title',
    subtitleKey: 'mobile.lifeEvents.card.twenties.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🌞', textKey: 'mobile.lifeEvents.card.twenties.tip1' },
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.twenties.tip2' },
      { emoji: '🍊', textKey: 'mobile.lifeEvents.card.twenties.tip3' },
      { emoji: '🚫', textKey: 'mobile.lifeEvents.card.twenties.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.lifeEvents.card.thirties.title',
    subtitleKey: 'mobile.lifeEvents.card.thirties.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💡', textKey: 'mobile.lifeEvents.card.thirties.tip1' },
      { emoji: '👀', textKey: 'mobile.lifeEvents.card.thirties.tip2' },
      { emoji: '✨', textKey: 'mobile.lifeEvents.card.thirties.tip3' },
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.thirties.tip4' },
    ],
  },
  {
    emoji: '🌟',
    titleKey: 'mobile.lifeEvents.card.forties.title',
    subtitleKey: 'mobile.lifeEvents.card.forties.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💪', textKey: 'mobile.lifeEvents.card.forties.tip1' },
      { emoji: '🧱', textKey: 'mobile.beautyTips.dryClimate.tip4' },
      { emoji: '💆', textKey: 'mobile.lifeEvents.card.forties.tip3' },
      { emoji: '✨', textKey: 'mobile.lifeEvents.card.forties.tip4' },
    ],
  },
  {
    emoji: '👑',
    titleKey: 'mobile.lifeEvents.card.fifties.title',
    subtitleKey: 'mobile.lifeEvents.card.fifties.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.fifties.tip1' },
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.fifties.tip2' },
      { emoji: '🩺', textKey: 'mobile.lifeEvents.card.fifties.tip3' },
      { emoji: '💖', textKey: 'mobile.lifeEvents.card.fifties.tip4' },
    ],
  },
  {
    emoji: '🌺',
    titleKey: 'mobile.lifeEvents.card.sixties.title',
    subtitleKey: 'mobile.lifeEvents.card.sixties.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.sixties.tip1' },
      { emoji: '💆', textKey: 'mobile.lifeEvents.card.sixties.tip2' },
      { emoji: '🌂', textKey: 'mobile.lifeEvents.card.sixties.tip3' },
      { emoji: '🥗', textKey: 'mobile.lifeEvents.card.sixties.tip4' },
    ],
  },
  {
    emoji: '🩺',
    titleKey: 'mobile.lifeEvents.card.pcos.title',
    subtitleKey: 'mobile.lifeEvents.card.pcos.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🚫', textKey: 'mobile.lifeEvents.card.pcos.tip1' },
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.pcos.tip2' },
      { emoji: '🥗', textKey: 'mobile.lifeEvents.card.pcos.tip3' },
      { emoji: '🩺', textKey: 'mobile.lifeEvents.card.pcos.tip4' },
    ],
  },
  {
    emoji: '🤰',
    titleKey: 'mobile.lifeEvents.card.pregnancySafe.title',
    subtitleKey: 'mobile.lifeEvents.card.pregnancySafe.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '✅', textKey: 'mobile.lifeEvents.card.pregnancySafe.tip1' },
      { emoji: '⚠️', textKey: 'mobile.lifeEvents.card.pregnancySafe.tip2' },
      { emoji: '🚫', textKey: 'mobile.lifeEvents.card.pregnancySafe.tip3' },
      { emoji: '🩺', textKey: 'mobile.lifeEvents.card.pregnancySafe.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.lifeEvents.card.postpartumHair.title',
    subtitleKey: 'mobile.lifeEvents.card.postpartumHair.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📅', textKey: 'mobile.lifeEvents.card.postpartumHair.tip1' },
      { emoji: '💆', textKey: 'mobile.lifeEvents.card.postpartumHair.tip2' },
      { emoji: '💊', textKey: 'mobile.lifeEvents.card.postpartumHair.tip3' },
      { emoji: '✂️', textKey: 'mobile.lifeEvents.card.postpartumHair.tip4' },
    ],
  },
  {
    emoji: '🦋',
    titleKey: 'mobile.lifeEvents.card.menopause.title',
    subtitleKey: 'mobile.lifeEvents.card.menopause.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💧', textKey: 'mobile.lifeEvents.card.menopause.tip1' },
      { emoji: '🌿', textKey: 'mobile.lifeEvents.card.menopause.tip2' },
      { emoji: '💪', textKey: 'mobile.lifeEvents.card.menopause.tip3' },
      { emoji: '☀️', textKey: 'mobile.lifeEvents.card.menopause.tip4' },
    ],
  },
  {
    emoji: '🩹',
    titleKey: 'mobile.lifeEvents.card.hormonalAcne.title',
    subtitleKey: 'mobile.lifeEvents.card.hormonalAcne.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { emoji: '📍', textKey: 'mobile.lifeEvents.card.hormonalAcne.tip1' },
      { emoji: '🧴', textKey: 'mobile.lifeEvents.card.hormonalAcne.tip2' },
      { emoji: '🥗', textKey: 'mobile.lifeEvents.card.hormonalAcne.tip3' },
      { emoji: '🩺', textKey: 'mobile.lifeEvents.card.hormonalAcne.tip4' },
    ],
  },
];

export default function LifeEventsScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.lifeEvents.title')}</Text>
      <Text style={s.sub}>{t('mobile.lifeEvents.subtitle')}</Text>
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

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
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

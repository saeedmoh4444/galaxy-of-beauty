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
    emoji: '👭',
    titleKey: 'mobile.public.mommy-and-me.title',
    subtitleKey: 'mobile.familyBeauty.mommyAndMe.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🧖', textKey: 'mobile.familyBeauty.mommyAndMe.tip1' },
      { emoji: '👩', textKey: 'mobile.familyBeauty.mommyAndMe.tip2' },
      { emoji: '👧', textKey: 'mobile.familyBeauty.mommyAndMe.tip3' },
      { emoji: '🌸', textKey: 'mobile.familyBeauty.mommyAndMe.tip4' },
    ],
  },
  {
    emoji: '👪',
    titleKey: 'mobile.familyBeauty.threeGenerations.title',
    subtitleKey: 'mobile.familyBeauty.threeGenerations.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '👵', textKey: 'mobile.familyBeauty.threeGenerations.tip1' },
      { emoji: '👩', textKey: 'mobile.familyBeauty.threeGenerations.tip2' },
      { emoji: '👧', textKey: 'mobile.familyBeauty.threeGenerations.tip3' },
      { emoji: '🎁', textKey: 'mobile.familyBeauty.threeGenerations.tip4' },
    ],
  },
  {
    emoji: '💄',
    titleKey: 'mobile.familyBeauty.teenBeauty.title',
    subtitleKey: 'mobile.familyBeauty.teenBeauty.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '💄', textKey: 'mobile.familyBeauty.teenBeauty.tip1' },
      { emoji: '📋', textKey: 'mobile.familyBeauty.teenBeauty.tip2' },
      { emoji: '👩', textKey: 'mobile.familyBeauty.teenBeauty.tip3' },
      { emoji: '✅', textKey: 'mobile.familyBeauty.teenBeauty.tip4' },
    ],
  },
  {
    emoji: '🧖',
    titleKey: 'mobile.familyBeauty.firstFacial.title',
    subtitleKey: 'mobile.familyBeauty.firstFacial.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🎂', textKey: 'mobile.familyBeauty.firstFacial.tip1' },
      { emoji: '👩', textKey: 'mobile.familyBeauty.firstFacial.tip2' },
      { emoji: '🧴', textKey: 'mobile.familyBeauty.firstFacial.tip3' },
      { emoji: '💬', textKey: 'mobile.familyBeauty.firstFacial.tip4' },
    ],
  },
  {
    emoji: '👰',
    titleKey: 'mobile.familyBeauty.bridalTribe.title',
    subtitleKey: 'mobile.familyBeauty.bridalTribe.subtitle',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '👰', textKey: 'mobile.familyBeauty.bridalTribe.tip1' },
      { emoji: '👭', textKey: 'mobile.familyBeauty.bridalTribe.tip2' },
      { emoji: '💄', textKey: 'mobile.familyBeauty.bridalTribe.tip3' },
      { emoji: '🏠', textKey: 'mobile.familyBeauty.bridalTribe.tip4' },
    ],
  },
  {
    emoji: '🍼',
    titleKey: 'wishlistGifts.occasion.babyShower',
    subtitleKey: 'mobile.familyBeauty.babyShower.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🤰', textKey: 'mobile.familyBeauty.babyShower.tip1' },
      { emoji: '🎉', textKey: 'mobile.familyBeauty.babyShower.tip2' },
      { emoji: '💆', textKey: 'mobile.familyBeauty.babyShower.tip3' },
      { emoji: '🎁', textKey: 'mobile.familyBeauty.babyShower.tip4' },
    ],
  },
  {
    emoji: '💖',
    titleKey: 'mobile.familyBeauty.valentine.title',
    subtitleKey: 'mobile.familyBeauty.valentine.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '👭', textKey: 'mobile.familyBeauty.valentine.tip1' },
      { emoji: '💅', textKey: 'mobile.familyBeauty.valentine.tip2' },
      { emoji: '☕', textKey: 'mobile.familyBeauty.valentine.tip3' },
      { emoji: '🎁', textKey: 'mobile.familyBeauty.valentine.tip4' },
    ],
  },
  {
    emoji: '🤝',
    titleKey: 'mobile.familyBeauty.newMomSupport.title',
    subtitleKey: 'mobile.familyBeauty.newMomSupport.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💆', textKey: 'mobile.familyBeauty.newMomSupport.tip1' },
      { emoji: '🧴', textKey: 'mobile.familyBeauty.newMomSupport.tip2' },
      { emoji: '⏰', textKey: 'mobile.familyBeauty.newMomSupport.tip3' },
      { emoji: '🏠', textKey: 'mobile.familyBeauty.newMomSupport.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.familyBeauty.bridalSkin.title',
    subtitleKey: 'mobile.familyBeauty.bridalSkin.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧴', textKey: 'mobile.familyBeauty.bridalSkin.tip1' },
      { emoji: '🧖', textKey: 'mobile.familyBeauty.bridalSkin.tip2' },
      { emoji: '🚫', textKey: 'mobile.familyBeauty.bridalSkin.tip3' },
      { emoji: '💧', textKey: 'mobile.familyBeauty.bridalSkin.tip4' },
    ],
  },
  {
    emoji: '🛁',
    titleKey: 'mobile.familyBeauty.bridalBody.title',
    subtitleKey: 'mobile.familyBeauty.bridalBody.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧽', textKey: 'mobile.familyBeauty.bridalBody.tip1' },
      { emoji: '💆', textKey: 'mobile.familyBeauty.bridalBody.tip2' },
      { emoji: '🪒', textKey: 'mobile.familyBeauty.bridalBody.tip3' },
      { emoji: '🌞', textKey: 'mobile.familyBeauty.bridalBody.tip4' },
    ],
  },
  {
    emoji: '🆘',
    titleKey: 'mobile.familyBeauty.bridalEmergency.title',
    subtitleKey: 'mobile.familyBeauty.bridalEmergency.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💊', textKey: 'mobile.familyBeauty.bridalEmergency.tip1' },
      { emoji: '🩹', textKey: 'mobile.familyBeauty.bridalEmergency.tip2' },
      { emoji: '📄', textKey: 'mobile.beautyTips.humid.tip2' },
      { emoji: '💄', textKey: 'mobile.familyBeauty.bridalEmergency.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.familyBeauty.bridalTrial.title',
    subtitleKey: 'mobile.familyBeauty.bridalTrial.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '📅', textKey: 'mobile.familyBeauty.bridalTrial.tip1' },
      { emoji: '📷', textKey: 'mobile.familyBeauty.bridalTrial.tip2' },
      { emoji: '👗', textKey: 'mobile.familyBeauty.bridalTrial.tip3' },
      { emoji: '💬', textKey: 'mobile.familyBeauty.bridalTrial.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.familyBeauty.bridalGlow.title',
    subtitleKey: 'mobile.familyBeauty.bridalGlow.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '💧', textKey: 'mobile.familyBeauty.bridalGlow.tip1' },
      { emoji: '🥑', textKey: 'mobile.familyBeauty.bridalGlow.tip2' },
      { emoji: '😴', textKey: 'mobile.familyBeauty.bridalGlow.tip3' },
      { emoji: '🧘', textKey: 'mobile.familyBeauty.bridalGlow.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.familyBeauty.pregnancyGlow.title',
    subtitleKey: 'mobile.familyBeauty.pregnancyGlow.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🌸', textKey: 'mobile.familyBeauty.pregnancyGlow.tip1' },
      { emoji: '🌹', textKey: 'mobile.familyBeauty.pregnancyGlow.tip2' },
      { emoji: '😴', textKey: 'mobile.familyBeauty.pregnancyGlow.tip3' },
      { emoji: '🥗', textKey: 'mobile.familyBeauty.pregnancyGlow.tip4' },
    ],
  },
  {
    emoji: '💆',
    titleKey: 'mobile.familyBeauty.pregnancyMassage.title',
    subtitleKey: 'mobile.familyBeauty.pregnancyMassage.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🛌', textKey: 'mobile.familyBeauty.pregnancyMassage.tip1' },
      { emoji: '✅', textKey: 'mobile.familyBeauty.pregnancyMassage.tip2' },
      { emoji: '🚫', textKey: 'mobile.familyBeauty.pregnancyMassage.tip3' },
      { emoji: '😌', textKey: 'mobile.familyBeauty.pregnancyMassage.tip4' },
    ],
  },
  {
    emoji: '🤱',
    titleKey: 'mobile.familyBeauty.nursingBeauty.title',
    subtitleKey: 'mobile.familyBeauty.nursingBeauty.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💧', textKey: 'mobile.familyBeauty.nursingBeauty.tip1' },
      { emoji: '🧴', textKey: 'mobile.familyBeauty.nursingBeauty.tip2' },
      { emoji: '💊', textKey: 'mobile.familyBeauty.nursingBeauty.tip3' },
      { emoji: '⏰', textKey: 'mobile.familyBeauty.nursingBeauty.tip4' },
    ],
  },
  {
    emoji: '🌷',
    titleKey: 'mobile.familyBeauty.postpartumCare.title',
    subtitleKey: 'mobile.familyBeauty.postpartumCare.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🪞', textKey: 'mobile.familyBeauty.postpartumCare.tip1' },
      { emoji: '💬', textKey: 'mobile.familyBeauty.postpartumCare.tip2' },
      { emoji: '🩺', textKey: 'mobile.familyBeauty.postpartumCare.tip3' },
      { emoji: '💗', textKey: 'mobile.familyBeauty.postpartumCare.tip4' },
    ],
  },
];

export default function FamilyBeautyScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('familyBeauty.title')}</Text>
      <Text style={s.sub}>{t('familyBeauty.subtitle')}</Text>
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

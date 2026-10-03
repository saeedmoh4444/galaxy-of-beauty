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
    emoji: '💄',
    titleKey: 'mobile.beautyTips.makeup.title',
    subtitleKey: 'mobile.beautyTips.makeup.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💧', textKey: 'mobile.beautyTips.makeup.tip1' },
      { emoji: '🧼', textKey: 'mobile.beautyTips.makeup.tip2' },
      { emoji: '📅', textKey: 'mobile.beautyTips.makeup.tip3' },
      { emoji: '🌙', textKey: 'mobile.beautyTips.makeup.tip4' },
    ],
  },
  {
    emoji: '🌸',
    titleKey: 'mobile.beautyTips.spring.title',
    subtitleKey: 'mobile.beautyTips.spring.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '✨', textKey: 'mobile.beautyTips.spring.tip1' },
      { emoji: '🧴', textKey: 'mobile.beautyTips.spring.tip2' },
      { emoji: '🌞', textKey: 'mobile.beautyTips.spring.tip3' },
      { emoji: '🎨', textKey: 'mobile.beautyTips.spring.tip4' },
    ],
  },
  {
    emoji: '🍉',
    titleKey: 'mobile.beautyTips.summer.title',
    subtitleKey: 'mobile.beautyTips.summer.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🌞', textKey: 'mobile.beautyTips.summer.tip1' },
      { emoji: '🧴', textKey: 'mobile.beautyTips.summer.tip2' },
      { emoji: '💧', textKey: 'mobile.beautyTips.summer.tip3' },
      { emoji: '🚫', textKey: 'mobile.beautyTips.summer.tip4' },
    ],
  },
  {
    emoji: '⛄',
    titleKey: 'mobile.beautyTips.winter.title',
    subtitleKey: 'mobile.beautyTips.winter.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyTips.winter.tip1' },
      { emoji: '💋', textKey: 'mobile.beautyTips.winter.tip2' },
      { emoji: '🎭', textKey: 'mobile.beautyTips.winter.tip3' },
      { emoji: '🧣', textKey: 'mobile.beautyTips.winter.tip4' },
    ],
  },
  {
    emoji: '🔥',
    titleKey: 'mobile.beautyTips.trending.title',
    subtitleKey: 'mobile.beautyTips.trending.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🪞', textKey: 'mobile.beautyTips.trending.tip1' },
      { emoji: '🎨', textKey: 'mobile.beautyTips.trending.tip2' },
      { emoji: '💋', textKey: 'mobile.beautyTips.trending.tip3' },
      { emoji: '🌿', textKey: 'mobile.beautyTips.trending.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'beautyTips.ingredient.name',
    subtitleKey: 'mobile.beautyTips.hyaluronic.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '✅', textKey: 'mobile.beautyTips.hyaluronic.tip1' },
      { emoji: '🌍', textKey: 'mobile.beautyTips.hyaluronic.tip2' },
      { emoji: '🔗', textKey: 'mobile.beautyTips.hyaluronic.tip3' },
      {
        emoji: '💦',
        textKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.tip2',
      },
    ],
  },
  {
    emoji: '👗',
    titleKey: 'mobile.beautyTips.style.title',
    subtitleKey: 'mobile.styleMatch.hint',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '🎩', textKey: 'mobile.beautyTips.style.tip1' },
      { emoji: '⚡', textKey: 'mobile.beautyTips.style.tip2' },
      { emoji: '🌼', textKey: 'mobile.beautyTips.style.tip3' },
      { emoji: '💎', textKey: 'mobile.beautyTips.style.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'beautyTips.challenge.title',
    subtitleKey: 'mobile.beautyTips.hydration.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🌞', textKey: 'mobile.beautyTips.hydration.tip1' },
      { emoji: '💧', textKey: 'mobile.beautyTips.hydration.tip2' },
      { emoji: '🌙', textKey: 'mobile.beautyTips.hydration.tip3' },
      { emoji: '🎭', textKey: 'mobile.beautyTips.hydration.tip4' },
    ],
  },
  {
    emoji: '💦',
    titleKey: 'mobile.beautyTips.humid.title',
    subtitleKey: 'mobile.beautyTips.humid.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyTips.humid.tip1' },
      { emoji: '🧻', textKey: 'mobile.beautyTips.humid.tip2' },
      { emoji: '💄', textKey: 'mobile.beautyTips.humid.tip3' },
      { emoji: '🍃', textKey: 'mobile.beautyTips.humid.tip4' },
    ],
  },
  {
    emoji: '🌵',
    titleKey: 'mobile.beautyTips.dryClimate.title',
    subtitleKey: 'mobile.beautyTips.dryClimate.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyTips.dryClimate.tip1' },
      { emoji: '💧', textKey: 'mobile.beautyTips.dryClimate.tip2' },
      { emoji: '💨', textKey: 'mobile.beautyTips.dryClimate.tip3' },
      { emoji: '🧱', textKey: 'mobile.beautyTips.dryClimate.tip4' },
    ],
  },
  {
    emoji: '🥵',
    titleKey: 'mobile.beautyTips.heat.title',
    subtitleKey: 'mobile.beautyTips.heat.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🌞', textKey: 'mobile.beautyTips.heat.tip1' },
      { emoji: '💦', textKey: 'mobile.beautyInnovation.card.beautyWeather.tip4' },
      { emoji: '👒', textKey: 'mobile.beautyTips.heat.tip3' },
      { emoji: '🌿', textKey: 'mobile.beautyTips.heat.tip4' },
    ],
  },
  {
    emoji: '🥶',
    titleKey: 'mobile.beautyTips.cold.title',
    subtitleKey: 'mobile.beautyTips.cold.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧼', textKey: 'mobile.beautyTips.cold.tip1' },
      { emoji: '🧴', textKey: 'mobile.beautyTips.cold.tip2' },
      { emoji: '🧣', textKey: 'mobile.beautyTips.cold.tip3' },
      { emoji: '🧴', textKey: 'mobile.beautyTips.cold.tip4' },
    ],
  },
  {
    emoji: '🧳',
    titleKey: 'mobile.beautyTips.travel.title',
    subtitleKey: 'mobile.beautyTips.travel.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧳', textKey: 'mobile.beautyTips.travel.tip1' },
      { emoji: '🛫', textKey: 'mobile.beautyTips.travel.tip2' },
      { emoji: '🎭', textKey: 'mobile.beautyTips.travel.tip3' },
      { emoji: '🌍', textKey: 'mobile.beautyTips.travel.tip4' },
    ],
  },
  {
    emoji: '❌',
    titleKey: 'mobile.beautyTips.careMistakes.title',
    subtitleKey: 'mobile.beautyTips.careMistakes.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { emoji: '🚫', textKey: 'mobile.beautyTips.careMistakes.tip1' },
      { emoji: '❌', textKey: 'mobile.beautyTips.careMistakes.tip2' },
      { emoji: '🌞', textKey: 'mobile.beautyTips.careMistakes.tip3' },
      { emoji: '🔄', textKey: 'mobile.beautyTips.careMistakes.tip4' },
    ],
  },
  {
    emoji: '💄',
    titleKey: 'mobile.beautyTips.makeupMistakes.title',
    subtitleKey: 'mobile.beautyTips.makeupMistakes.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '❌', textKey: 'mobile.beautyTips.makeupMistakes.tip1' },
      { emoji: '🧼', textKey: 'mobile.beautyTips.makeupMistakes.tip2' },
      { emoji: '🚫', textKey: 'mobile.beautyTips.makeupMistakes.tip3' },
      { emoji: '💋', textKey: 'mobile.beautyTips.makeupMistakes.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.beautyTips.hairMistakes.title',
    subtitleKey: 'mobile.beautyTips.hairMistakes.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🔥', textKey: 'mobile.beautyTips.hairMistakes.tip1' },
      { emoji: '🚫', textKey: 'mobile.beautyTips.hairMistakes.tip2' },
      { emoji: '🪥', textKey: 'mobile.beautyTips.hairMistakes.tip3' },
      { emoji: '😴', textKey: 'mobile.beautyTips.hairMistakes.tip4' },
    ],
  },
  {
    emoji: '🚨',
    titleKey: 'mobile.beautyTips.overExfoliation.title',
    subtitleKey: 'mobile.beautyTips.overExfoliation.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🔍', textKey: 'mobile.beautyTips.overExfoliation.tip1' },
      { emoji: '🛑', textKey: 'mobile.beautyTips.overExfoliation.tip2' },
      { emoji: '🧴', textKey: 'mobile.beautyTips.overExfoliation.tip3' },
      { emoji: '🌿', textKey: 'mobile.beautyTips.overExfoliation.tip4' },
    ],
  },
  {
    emoji: '📦',
    titleKey: 'mobile.beautyTips.productOverload.title',
    subtitleKey: 'mobile.beautyTips.productOverload.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🚫', textKey: 'mobile.beautyTips.productOverload.tip1' },
      { emoji: '🌞', textKey: 'mobile.beautyTips.productOverload.tip2' },
      { emoji: '🔄', textKey: 'mobile.beautyTips.productOverload.tip3' },
      { emoji: '🌿', textKey: 'mobile.beautyTips.productOverload.tip4' },
    ],
  },
  {
    emoji: '🌙',
    titleKey: 'mobile.beautyTips.eidGlow.title',
    subtitleKey: 'mobile.beautyTips.eidGlow.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '📅', textKey: 'mobile.beautyTips.eidGlow.tip1' },
      { emoji: '🛁', textKey: 'mobile.beautyTips.eidGlow.tip2' },
      { emoji: '💄', textKey: 'mobile.beautyTips.eidGlow.tip3' },
      { emoji: '📷', textKey: 'mobile.beautyTips.eidGlow.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.beautyTips.eidHair.title',
    subtitleKey: 'mobile.beautyTips.eidHair.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🎀', textKey: 'mobile.beautyTips.eidHair.tip1' },
      { emoji: '🌊', textKey: 'mobile.beautyTips.eidHair.tip2' },
      { emoji: '💫', textKey: 'mobile.beautyTips.eidHair.tip3' },
      { emoji: '✨', textKey: 'mobile.beautyTips.eidHair.tip4' },
    ],
  },
  {
    emoji: '💅',
    titleKey: 'mobile.beautyTips.eidNails.title',
    subtitleKey: 'mobile.beautyTips.eidNails.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🎨', textKey: 'mobile.beautyTips.eidNails.tip1' },
      { emoji: '✨', textKey: 'mobile.beautyTips.eidNails.tip2' },
      { emoji: '🌙', textKey: 'mobile.beautyTips.eidNails.tip3' },
      { emoji: '📅', textKey: 'mobile.beautyTips.eidNails.tip4' },
    ],
  },
  {
    emoji: '🌺',
    titleKey: 'mobile.beautyTips.eidPerfume.title',
    subtitleKey: 'mobile.beautyTips.eidPerfume.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🌹', textKey: 'mobile.beautyTips.eidPerfume.tip1' },
      { emoji: '🎵', textKey: 'mobile.beautyTips.eidPerfume.tip2' },
      { emoji: '⏰', textKey: 'mobile.beautyTips.eidPerfume.tip3' },
      { emoji: '🎁', textKey: 'mobile.beautyTips.eidPerfume.tip4' },
    ],
  },
];

export default function BeautyTipsScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('beautyTips.title')}</Text>
      <Text style={s.sub}>{t('beautyTips.subtitle')}</Text>
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

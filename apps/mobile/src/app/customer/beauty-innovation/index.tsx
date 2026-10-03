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
    emoji: '🎙️',
    titleKey: 'mobile.beautyInnovation.card.voiceAssistant.title',
    subtitleKey: 'mobile.beautyInnovation.card.voiceAssistant.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📋', textKey: 'mobile.beautyInnovation.card.voiceAssistant.tip1' },
      { emoji: '🔊', textKey: 'mobile.beautyInnovation.card.voiceAssistant.tip2' },
      { emoji: '💬', textKey: 'mobile.beautyInnovation.card.voiceAssistant.tip3' },
      { emoji: '🔒', textKey: 'mobile.beautyInnovation.card.voiceAssistant.tip4' },
    ],
  },
  {
    emoji: '🎬',
    // Vlog card reuses the beauty-extras vlog keys (verbatim ar match).
    titleKey: 'mobile.beautyExtras.card.beautyVlog.title',
    subtitleKey: 'beautyInnovation.vlogTitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💄', textKey: 'mobile.beautyExtras.card.beautyVlog.tip1' },
      { emoji: '👩', textKey: 'mobile.beautyExtras.card.beautyVlog.tip2' },
      { emoji: '👀', textKey: 'mobile.beautyExtras.card.beautyVlog.tip3' },
      { emoji: '📺', textKey: 'mobile.beautyExtras.card.beautyVlog.tip4' },
    ],
  },
  {
    emoji: '🎵',
    titleKey: 'mobile.beautyInnovation.card.playlist.title',
    subtitleKey: 'mobile.beautyInnovation.card.playlist.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🎶', textKey: 'mobile.beautyInnovation.card.playlist.tip1' },
      { emoji: '🌊', textKey: 'mobile.beautyInnovation.card.playlist.tip2' },
      { emoji: '📻', textKey: 'mobile.beautyInnovation.card.playlist.tip3' },
      { emoji: '🔄', textKey: 'mobile.beautyInnovation.card.playlist.tip4' },
    ],
  },
  {
    emoji: '⛅',
    titleKey: 'mobile.beautyInnovation.card.beautyWeather.title',
    subtitleKey: 'mobile.beautyInnovation.card.beautyWeather.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '☀️', textKey: 'mobile.beautyInnovation.card.beautyWeather.tip1' },
      { emoji: '💧', textKey: 'mobile.beautyInnovation.card.beautyWeather.tip2' },
      { emoji: '💄', textKey: 'mobile.beautyInnovation.card.beautyWeather.tip3' },
      { emoji: '💦', textKey: 'mobile.beautyInnovation.card.beautyWeather.tip4' },
    ],
  },
  {
    emoji: '🌙',
    titleKey: 'mobile.beautyInnovation.card.nightOut.title',
    subtitleKey: 'mobile.beautyInnovation.card.nightOut.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💃', textKey: 'mobile.beautyInnovation.card.nightOut.tip1' },
      { emoji: '⏰', textKey: 'mobile.beautyInnovation.card.nightOut.tip2' },
      { emoji: '💅', textKey: 'mobile.beautyInnovation.card.nightOut.tip3' },
      { emoji: '⭐', textKey: 'mobile.beautyInnovation.card.nightOut.tip4' },
    ],
  },
  {
    emoji: '🎩',
    titleKey: 'mobile.beautyInnovation.card.concierge.title',
    subtitleKey: 'mobile.beautyInnovation.card.concierge.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '📅', textKey: 'mobile.beautyInnovation.card.concierge.tip1' },
      { emoji: '🎁', textKey: 'mobile.beautyInnovation.card.concierge.tip2' },
      { emoji: '💬', textKey: 'mobile.beautyInnovation.card.concierge.tip3' },
      { emoji: '🕐', textKey: 'mobile.beautyInnovation.card.concierge.tip4' },
    ],
  },
  {
    emoji: '💝',
    titleKey: 'mobile.beautyInnovation.card.randomKindness.title',
    subtitleKey: 'mobile.beautyInnovation.card.randomKindness.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '💐', textKey: 'mobile.beautyInnovation.card.randomKindness.tip1' },
      { emoji: '💌', textKey: 'mobile.beautyInnovation.card.randomKindness.tip2' },
      { emoji: '🎁', textKey: 'mobile.beautyInnovation.card.randomKindness.tip3' },
      { emoji: '🤍', textKey: 'mobile.beautyInnovation.card.randomKindness.tip4' },
    ],
  },
];

export default function BeautyInnovationScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('beautyInnovation.title')}</Text>
      <Text style={s.sub}>{t('beautyInnovation.subtitle')}</Text>
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
  c: { flex: 1, backgroundColor: '#f5f3ff' },
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

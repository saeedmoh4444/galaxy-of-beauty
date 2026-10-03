import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}

interface PerfumeCard {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const PERFUME_CARDS: PerfumeCard[] = [
  {
    emoji: '🌸',
    titleKey: 'mobile.perfumeGuide.card.layers.title',
    subtitleKey: 'mobile.perfumeGuide.card.layers.subtitle',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '🍋', textKey: 'mobile.perfumeGuide.card.layers.tip1' },
      { emoji: '🌹', textKey: 'mobile.perfumeGuide.card.layers.tip2' },
      { emoji: '🪵', textKey: 'mobile.perfumeGuide.card.layers.tip3' },
      { emoji: '⏰', textKey: 'mobile.perfumeGuide.card.layers.tip4' },
    ],
  },
  {
    emoji: '🪵',
    titleKey: 'mobile.perfumeGuide.card.oud.title',
    subtitleKey: 'mobile.perfumeGuide.card.oud.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💧', textKey: 'mobile.perfumeGuide.card.oud.tip1' },
      { emoji: '🔥', textKey: 'mobile.perfumeGuide.card.oud.tip2' },
      { emoji: '💎', textKey: 'mobile.perfumeGuide.card.oud.tip3' },
      { emoji: '💰', textKey: 'mobile.perfumeGuide.card.oud.tip4' },
    ],
  },
  {
    emoji: '🌙',
    titleKey: 'mobile.perfumeGuide.card.musk.title',
    subtitleKey: 'mobile.perfumeGuide.card.musk.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🤍', textKey: 'mobile.perfumeGuide.card.musk.tip1' },
      { emoji: '🌹', textKey: 'mobile.perfumeGuide.card.musk.tip2' },
      { emoji: '🪵', textKey: 'mobile.perfumeGuide.card.musk.tip3' },
      { emoji: '🫒', textKey: 'mobile.perfumeGuide.card.musk.tip4' },
    ],
  },
  {
    emoji: '🌹',
    titleKey: 'mobile.perfumeGuide.card.taifRose.title',
    subtitleKey: 'mobile.perfumeGuide.card.taifRose.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🌄', textKey: 'mobile.perfumeGuide.card.taifRose.tip1' },
      { emoji: '🌅', textKey: 'mobile.perfumeGuide.card.taifRose.tip2' },
      { emoji: '💧', textKey: 'mobile.perfumeGuide.card.taifRose.tip3' },
      { emoji: '💎', textKey: 'mobile.perfumeGuide.card.taifRose.tip4' },
    ],
  },
  {
    emoji: '🧪',
    titleKey: 'mobile.perfumeGuide.card.blending.title',
    subtitleKey: 'mobile.perfumeGuide.card.blending.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧩', textKey: 'mobile.perfumeGuide.card.blending.tip1' },
      { emoji: '📊', textKey: 'mobile.perfumeGuide.card.blending.tip2' },
      { emoji: '⏰', textKey: 'mobile.perfumeGuide.card.blending.tip3' },
      { emoji: '🫒', textKey: 'mobile.perfumeGuide.card.blending.tip4' },
    ],
  },
  {
    emoji: '📦',
    titleKey: 'mobile.perfumeGuide.card.storage.title',
    subtitleKey: 'mobile.perfumeGuide.card.storage.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧊', textKey: 'mobile.perfumeGuide.card.storage.tip1' },
      { emoji: '🌞', textKey: 'mobile.perfumeGuide.card.storage.tip2' },
      { emoji: '🎁', textKey: 'mobile.perfumeGuide.card.storage.tip3' },
      { emoji: '🚿', textKey: 'mobile.perfumeGuide.card.storage.tip4' },
    ],
  },
  {
    emoji: '📅',
    titleKey: 'mobile.perfumeGuide.card.season.title',
    subtitleKey: 'mobile.perfumeGuide.card.season.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🌷', textKey: 'mobile.perfumeGuide.card.season.tip1' },
      { emoji: '🌞', textKey: 'mobile.perfumeGuide.card.season.tip2' },
      { emoji: '🍂', textKey: 'mobile.perfumeGuide.card.season.tip3' },
      { emoji: '🧣', textKey: 'mobile.perfumeGuide.card.season.tip4' },
    ],
  },
  {
    emoji: '🎯',
    titleKey: 'mobile.perfumeGuide.card.occasion.title',
    subtitleKey: 'mobile.perfumeGuide.card.occasion.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💼', textKey: 'mobile.perfumeGuide.card.occasion.tip1' },
      { emoji: '🌃', textKey: 'mobile.perfumeGuide.card.occasion.tip2' },
      { emoji: '💪', textKey: 'mobile.perfumeGuide.card.occasion.tip3' },
      { emoji: '💍', textKey: 'mobile.perfumeGuide.card.occasion.tip4' },
    ],
  },
  {
    emoji: '⏳',
    titleKey: 'mobile.perfumeGuide.card.longevity.title',
    subtitleKey: 'mobile.perfumeGuide.card.longevity.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '💧', textKey: 'mobile.perfumeGuide.card.longevity.tip1' },
      { emoji: '🫀', textKey: 'mobile.perfumeGuide.card.longevity.tip2' },
      { emoji: '🚫', textKey: 'mobile.perfumeGuide.card.longevity.tip3' },
      { emoji: '👗', textKey: 'mobile.perfumeGuide.card.longevity.tip4' },
    ],
  },
  {
    emoji: '🌿',
    titleKey: 'mobile.perfumeGuide.card.notes.title',
    subtitleKey: 'beautyDna.reason.scent_oriental',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🪵', textKey: 'mobile.perfumeGuide.card.notes.tip1' },
      { emoji: '🧂', textKey: 'mobile.perfumeGuide.card.notes.tip2' },
      { emoji: '🌸', textKey: 'mobile.perfumeGuide.card.notes.tip3' },
      { emoji: '🍋', textKey: 'mobile.perfumeGuide.card.notes.tip4' },
    ],
  },
];

export default function PerfumeGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.perfumeGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.perfumeGuide.subtitle')}</Text>

      <View style={styles.grid}>
        {PERFUME_CARDS.map((card, i) => (
          <View key={i} style={[styles.card, { borderColor: card.color + '30' }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: card.color }]}>{t(card.titleKey)}</Text>
                <Text style={styles.cardSubtitle}>{t(card.subtitleKey)}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {card.tips.map((tip, j) => (
                <View key={j} style={[styles.tipRow, { backgroundColor: card.bg }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipText, { color: card.color }]}>{t(tip.textKey)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf4ff' },
  content: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardEmoji: { fontSize: 28 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tipsList: { gap: 6 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipEmoji: { fontSize: 14, width: 20, textAlign: 'center' },
  tipText: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});

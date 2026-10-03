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
    emoji: '🚿',
    titleKey: 'mobile.hairCareGuide.washing.title',
    subtitleKey: 'mobile.hairCareGuide.washing.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💧', textKey: 'mobile.hairCareGuide.washing.tip1' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.washing.tip2' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.washing.tip3' },
      { emoji: '🚿', textKey: 'mobile.hairCareGuide.washing.tip4' },
    ],
  },
  {
    emoji: '🥑',
    titleKey: 'mobile.hairCareGuide.hairMask.title',
    subtitleKey: 'mobile.hairCareGuide.hairMask.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🥑', textKey: 'mobile.hairCareGuide.hairMask.tip1' },
      { emoji: '🥚', textKey: 'mobile.hairCareGuide.hairMask.tip2' },
      { emoji: '🍌', textKey: 'mobile.hairCareGuide.hairMask.tip3' },
      { emoji: '🍎', textKey: 'mobile.hairCareGuide.hairMask.tip4' },
    ],
  },
  {
    emoji: '🫒',
    titleKey: 'mobile.hairCareGuide.hairOils.title',
    subtitleKey: 'mobile.hairCareGuide.hairOils.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🥥', textKey: 'mobile.hairCareGuide.hairOils.tip1' },
      { emoji: '🫒', textKey: 'mobile.hairCareGuide.hairOils.tip2' },
      { emoji: '🌿', textKey: 'mobile.hairCareGuide.hairOils.tip3' },
      { emoji: '🌱', textKey: 'mobile.hairCareGuide.hairOils.tip4' },
    ],
  },
  {
    emoji: '🔥',
    titleKey: 'mobile.hairCareGuide.heatProtection.title',
    subtitleKey: 'mobile.hairCareGuide.heatProtection.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🛡️', textKey: 'mobile.hairCareGuide.heatProtection.tip1' },
      { emoji: '🌡️', textKey: 'mobile.hairCareGuide.heatProtection.tip2' },
      { emoji: '🔥', textKey: 'mobile.hairCareGuide.heatProtection.tip3' },
      { emoji: '📅', textKey: 'mobile.hairCareGuide.heatProtection.tip4' },
    ],
  },
  {
    emoji: '🧖',
    titleKey: 'mobile.hairCareGuide.scalp.title',
    subtitleKey: 'mobile.hairCareGuide.scalp.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.scalp.tip1' },
      { emoji: '💆', textKey: 'mobile.hairCareGuide.scalp.tip2' },
      { emoji: '💦', textKey: 'mobile.hairCareGuide.scalp.tip3' },
      { emoji: '💧', textKey: 'mobile.hairCareGuide.scalp.tip4' },
    ],
  },
  {
    emoji: '🎨',
    titleKey: 'mobile.hairCareGuide.hairColor.title',
    subtitleKey: 'mobile.hairCareGuide.hairColor.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🚿', textKey: 'mobile.hairCareGuide.hairColor.tip1' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.hairColor.tip2' },
      { emoji: '☀️', textKey: 'mobile.hairCareGuide.hairColor.tip3' },
      { emoji: '📅', textKey: 'mobile.hairCareGuide.hairColor.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.hairCareGuide.hairstyling.title',
    subtitleKey: 'mobile.hairCareGuide.hairstyling.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🌀', textKey: 'mobile.hairCareGuide.hairstyling.tip1' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.hairstyling.tip2' },
      { emoji: '🌊', textKey: 'mobile.hairCareGuide.hairstyling.tip3' },
      { emoji: '🌿', textKey: 'mobile.hairCareGuide.hairstyling.tip4' },
    ],
  },
  {
    emoji: '👰',
    titleKey: 'mobile.hairCareGuide.bridalHair.title',
    subtitleKey: 'mobile.hairCareGuide.bridalHair.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '📅', textKey: 'mobile.hairCareGuide.bridalHair.tip1' },
      { emoji: '💇', textKey: 'mobile.hairCareGuide.bridalHair.tip2' },
      { emoji: '🎨', textKey: 'mobile.hairCareGuide.bridalHair.tip3' },
      { emoji: '🫒', textKey: 'mobile.hairCareGuide.bridalHair.tip4' },
    ],
  },
  {
    emoji: '🌞',
    titleKey: 'mobile.hairCareGuide.summerHair.title',
    subtitleKey: 'mobile.hairCareGuide.summerHair.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '👒', textKey: 'mobile.hairCareGuide.summerHair.tip1' },
      { emoji: '💧', textKey: 'mobile.hairCareGuide.summerHair.tip2' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.summerHair.tip3' },
      { emoji: '🚿', textKey: 'mobile.hairCareGuide.summerHair.tip4' },
    ],
  },
  {
    emoji: '🧕',
    titleKey: 'mobile.hairCareGuide.hijabHair.title',
    subtitleKey: 'mobile.hairCareGuide.hijabHair.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧣', textKey: 'mobile.hairCareGuide.hijabHair.tip1' },
      { emoji: '💨', textKey: 'mobile.hairCareGuide.hijabHair.tip2' },
      { emoji: '💧', textKey: 'mobile.hairCareGuide.hijabHair.tip3' },
      { emoji: '🚫', textKey: 'mobile.hairCareGuide.hijabHair.tip4' },
    ],
  },
  {
    emoji: '🖌',
    titleKey: 'mobile.hairCareGuide.balayage.title',
    subtitleKey: 'mobile.hairCareGuide.balayage.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🖌️', textKey: 'mobile.hairCareGuide.balayage.tip1' },
      { emoji: '✨', textKey: 'mobile.hairCareGuide.balayage.tip2' },
      { emoji: '📅', textKey: 'mobile.hairCareGuide.balayage.tip3' },
      { emoji: '💰', textKey: 'mobile.hairCareGuide.balayage.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.hairCareGuide.hairGloss.title',
    subtitleKey: 'mobile.hairCareGuide.hairGloss.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '✨', textKey: 'mobile.hairCareGuide.hairGloss.tip1' },
      { emoji: '🌈', textKey: 'mobile.hairCareGuide.hairGloss.tip2' },
      { emoji: '⏱️', textKey: 'mobile.hairCareGuide.hairGloss.tip3' },
      { emoji: '📅', textKey: 'mobile.hairCareGuide.hairGloss.tip4' },
    ],
  },
  {
    emoji: '🔗',
    titleKey: 'mobile.hairCareGuide.bondRepair.title',
    subtitleKey: 'mobile.hairCareGuide.bondRepair.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🔗', textKey: 'mobile.hairCareGuide.bondRepair.tip1' },
      { emoji: '💇', textKey: 'mobile.hairCareGuide.bondRepair.tip2' },
      { emoji: '🧴', textKey: 'mobile.hairCareGuide.bondRepair.tip3' },
      { emoji: '✨', textKey: 'mobile.hairCareGuide.bondRepair.tip4' },
    ],
  },
  {
    emoji: '➰',
    titleKey: 'mobile.hairCareGuide.heatlessCurls.title',
    subtitleKey: 'mobile.hairCareGuide.heatlessCurls.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧦', textKey: 'mobile.hairCareGuide.heatlessCurls.tip1' },
      { emoji: '🎀', textKey: 'mobile.hairCareGuide.heatlessCurls.tip2' },
      { emoji: '💤', textKey: 'mobile.hairCareGuide.heatlessCurls.tip3' },
      { emoji: '🌙', textKey: 'mobile.hairCareGuide.heatlessCurls.tip4' },
    ],
  },
  {
    emoji: '🩺',
    titleKey: 'mobile.hairCareGuide.hairLoss.title',
    subtitleKey: 'mobile.hairCareGuide.hairLoss.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🩺', textKey: 'mobile.hairCareGuide.hairLoss.tip1' },
      { emoji: '💆', textKey: 'mobile.hairCareGuide.hairLoss.tip2' },
      { emoji: '🥗', textKey: 'mobile.hairCareGuide.hairLoss.tip3' },
      { emoji: '💊', textKey: 'mobile.hairCareGuide.hairLoss.tip4' },
    ],
  },
];

export default function HairCareGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.hairCareGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.hairCareGuide.subtitle')}</Text>
      <View style={styles.grid}>
        {CARDS.map((card, i) => (
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
  container: { flex: 1, backgroundColor: '#f5f3ff' },
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

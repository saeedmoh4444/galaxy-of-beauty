import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}
interface CareCard {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: CareCard[] = [
  {
    emoji: '✏️',
    titleKey: 'mobile.personalCare.card.brows.title',
    subtitleKey: 'mobile.personalCare.card.brows.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '📐', textKey: 'mobile.personalCare.card.brows.tip1' },
      { emoji: '🪞', textKey: 'mobile.personalCare.card.brows.tip2' },
      { emoji: '💄', textKey: 'mobile.personalCare.card.brows.tip3' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.brows.tip4' },
    ],
  },
  {
    emoji: '👀',
    titleKey: 'mobile.personalCare.card.lashes.title',
    subtitleKey: 'mobile.personalCare.card.lashes.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧼', textKey: 'mobile.personalCare.card.lashes.tip1' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.lashes.tip2' },
      { emoji: '🚫', textKey: 'mobile.personalCare.card.lashes.tip3' },
      { emoji: '⏸️', textKey: 'mobile.personalCare.card.lashes.tip4' },
    ],
  },
  {
    emoji: '🧴',
    titleKey: 'mobile.personalCare.card.body.title',
    subtitleKey: 'mobile.personalCare.card.body.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧽', textKey: 'mobile.personalCare.card.body.tip1' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.body.tip2' },
      { emoji: '🌞', textKey: 'mobile.personalCare.card.body.tip3' },
      { emoji: '💧', textKey: 'mobile.personalCare.card.body.tip4' },
    ],
  },
  {
    emoji: '🦷',
    titleKey: 'mobile.personalCare.card.smile.title',
    subtitleKey: 'mobile.personalCare.card.smile.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🪥', textKey: 'mobile.personalCare.card.smile.tip1' },
      { emoji: '🦷', textKey: 'mobile.personalCare.card.smile.tip2' },
      { emoji: '🍓', textKey: 'mobile.personalCare.card.smile.tip3' },
      { emoji: '🩺', textKey: 'mobile.personalCare.card.smile.tip4' },
    ],
  },
  {
    emoji: '🛁',
    titleKey: 'mobile.personalCare.card.moroccanBath.title',
    subtitleKey: 'mobile.personalCare.card.moroccanBath.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧼', textKey: 'mobile.personalCare.card.moroccanBath.tip1' },
      { emoji: '🧽', textKey: 'mobile.personalCare.card.moroccanBath.tip2' },
      { emoji: '🏺', textKey: 'mobile.personalCare.card.moroccanBath.tip3' },
      { emoji: '🌹', textKey: 'mobile.personalCare.card.moroccanBath.tip4' },
    ],
  },
  {
    emoji: '🕯️',
    titleKey: 'mobile.personalCare.card.aromatherapy.title',
    subtitleKey: 'mobile.personalCare.card.aromatherapy.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💜', textKey: 'mobile.personalCare.card.aromatherapy.tip1' },
      { emoji: '🍋', textKey: 'mobile.personalCare.card.aromatherapy.tip2' },
      { emoji: '🌹', textKey: 'mobile.personalCare.card.aromatherapy.tip3' },
      { emoji: '🌿', textKey: 'mobile.personalCare.card.aromatherapy.tip4' },
    ],
  },
  {
    emoji: '🪥',
    titleKey: 'mobile.personalCare.card.dryBrushing.title',
    subtitleKey: 'mobile.personalCare.card.dryBrushing.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🔼', textKey: 'mobile.personalCare.card.dryBrushing.tip1' },
      { emoji: '🚿', textKey: 'mobile.personalCare.card.dryBrushing.tip2' },
      { emoji: '📅', textKey: 'mobile.personalCare.card.dryBrushing.tip3' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.dryBrushing.tip4' },
    ],
  },
  {
    emoji: '🧊',
    titleKey: 'mobile.personalCare.card.iceCubes.title',
    subtitleKey: 'mobile.personalCare.card.iceCubes.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '✨', textKey: 'mobile.personalCare.card.iceCubes.tip1' },
      { emoji: '🌅', textKey: 'mobile.personalCare.card.iceCubes.tip2' },
      { emoji: '🌹', textKey: 'mobile.personalCare.card.iceCubes.tip3' },
      { emoji: '⌛', textKey: 'mobile.personalCare.card.iceCubes.tip4' },
    ],
  },
  {
    emoji: '♨️',
    titleKey: 'mobile.personalCare.card.facialSteam.title',
    subtitleKey: 'mobile.personalCare.card.facialSteam.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🌿', textKey: 'mobile.personalCare.card.facialSteam.tip1' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.facialSteam.tip2' },
      { emoji: '📏', textKey: 'mobile.personalCare.card.facialSteam.tip3' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.facialSteam.tip4' },
    ],
  },
  {
    emoji: '💤',
    titleKey: 'mobile.personalCare.card.silkPillow.title',
    subtitleKey: 'mobile.personalCare.card.silkPillow.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💇', textKey: 'mobile.personalCare.card.silkPillow.tip1' },
      { emoji: '😴', textKey: 'mobile.personalCare.card.silkPillow.tip2' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.silkPillow.tip3' },
      { emoji: '🧼', textKey: 'mobile.personalCare.card.silkPillow.tip4' },
    ],
  },
  {
    emoji: '🪒',
    titleKey: 'mobile.personalCare.card.hairRemoval.title',
    subtitleKey: 'mobile.personalCare.card.hairRemoval.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🍯', textKey: 'mobile.personalCare.card.hairRemoval.tip1' },
      { emoji: '🪒', textKey: 'mobile.personalCare.card.hairRemoval.tip2' },
      { emoji: '🔦', textKey: 'mobile.personalCare.card.hairRemoval.tip3' },
      { emoji: '🧵', textKey: 'mobile.personalCare.card.hairRemoval.tip4' },
    ],
  },
  {
    emoji: '🥤',
    titleKey: 'mobile.personalCare.card.detoxWater.title',
    subtitleKey: 'mobile.personalCare.card.detoxWater.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🍋', textKey: 'mobile.personalCare.card.detoxWater.tip1' },
      { emoji: '🍓', textKey: 'mobile.personalCare.card.detoxWater.tip2' },
      { emoji: '🥒', textKey: 'mobile.personalCare.card.detoxWater.tip3' },
      { emoji: '🍊', textKey: 'mobile.personalCare.card.detoxWater.tip4' },
    ],
  },
  {
    emoji: '💡',
    titleKey: 'mobile.personalCare.card.ledMask.title',
    subtitleKey: 'mobile.personalCare.card.ledMask.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🔴', textKey: 'mobile.personalCare.card.ledMask.tip1' },
      { emoji: '🔵', textKey: 'mobile.personalCare.card.ledMask.tip2' },
      { emoji: '🟡', textKey: 'mobile.personalCare.card.ledMask.tip3' },
      { emoji: '🟢', textKey: 'mobile.personalCare.card.ledMask.tip4' },
    ],
  },
  {
    emoji: '💎',
    titleKey: 'mobile.personalCare.card.guaSha.title',
    subtitleKey: 'mobile.personalCare.card.guaSha.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.personalCare.card.guaSha.tip1' },
      { emoji: '🔼', textKey: 'mobile.personalCare.card.guaSha.tip2' },
      { emoji: '🖐️', textKey: 'mobile.personalCare.card.guaSha.tip3' },
      { emoji: '🧊', textKey: 'mobile.personalCare.card.guaSha.tip4' },
    ],
  },
  {
    emoji: '⚡',
    titleKey: 'mobile.personalCare.card.microcurrent.title',
    subtitleKey: 'mobile.personalCare.card.microcurrent.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💪', textKey: 'mobile.personalCare.card.microcurrent.tip1' },
      { emoji: '🔼', textKey: 'mobile.personalCare.card.microcurrent.tip2' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.microcurrent.tip3' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.microcurrent.tip4' },
    ],
  },
  {
    emoji: '📡',
    titleKey: 'mobile.personalCare.card.radioFrequency.title',
    subtitleKey: 'mobile.personalCare.card.radioFrequency.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🔥', textKey: 'mobile.personalCare.card.radioFrequency.tip1' },
      { emoji: '✨', textKey: 'mobile.personalCare.card.radioFrequency.tip2' },
      { emoji: '📅', textKey: 'mobile.personalCare.card.radioFrequency.tip3' },
      { emoji: '⏳', textKey: 'mobile.personalCare.card.radioFrequency.tip4' },
    ],
  },
  {
    emoji: '🥶',
    titleKey: 'mobile.personalCare.card.cryoStick.title',
    subtitleKey: 'mobile.personalCare.card.cryoStick.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '✨', textKey: 'mobile.personalCare.card.cryoStick.tip1' },
      { emoji: '❄️', textKey: 'mobile.personalCare.card.cryoStick.tip2' },
      { emoji: '🌅', textKey: 'mobile.personalCare.card.cryoStick.tip3' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.cryoStick.tip4' },
    ],
  },
  {
    emoji: '🔊',
    titleKey: 'mobile.personalCare.card.ultrasonic.title',
    subtitleKey: 'mobile.personalCare.card.ultrasonic.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '📳', textKey: 'mobile.personalCare.card.ultrasonic.tip1' },
      { emoji: '💧', textKey: 'mobile.personalCare.card.ultrasonic.tip2' },
      { emoji: '🔼', textKey: 'mobile.personalCare.card.ultrasonic.tip3' },
      { emoji: '📅', textKey: 'mobile.personalCare.card.ultrasonic.tip4' },
    ],
  },
  {
    emoji: '⚡',
    titleKey: 'mobile.personalCare.card.highFrequency.title',
    subtitleKey: 'mobile.personalCare.card.highFrequency.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🦠', textKey: 'mobile.personalCare.card.highFrequency.tip1' },
      { emoji: '✨', textKey: 'mobile.personalCare.card.highFrequency.tip2' },
      { emoji: '🩹', textKey: 'mobile.personalCare.card.highFrequency.tip3' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.highFrequency.tip4' },
    ],
  },
  {
    emoji: '🦵',
    titleKey: 'mobile.personalCare.card.cellulite.title',
    subtitleKey: 'mobile.personalCare.card.cellulite.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '💆', textKey: 'mobile.personalCare.card.cellulite.tip1' },
      { emoji: '🏃', textKey: 'mobile.personalCare.card.cellulite.tip2' },
      { emoji: '💧', textKey: 'mobile.personalCare.card.cellulite.tip3' },
      { emoji: '🫒', textKey: 'mobile.personalCare.card.cellulite.tip4' },
    ],
  },
  {
    emoji: '〰️',
    titleKey: 'mobile.personalCare.card.stretchMarks.title',
    subtitleKey: 'mobile.personalCare.card.stretchMarks.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.personalCare.card.stretchMarks.tip1' },
      { emoji: '🌹', textKey: 'mobile.personalCare.card.stretchMarks.tip2' },
      { emoji: '🪡', textKey: 'mobile.personalCare.card.stretchMarks.tip3' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.stretchMarks.tip4' },
    ],
  },
  {
    emoji: '🏋️',
    titleKey: 'mobile.personalCare.card.bodySculpting.title',
    subtitleKey: 'mobile.personalCare.card.bodySculpting.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧊', textKey: 'mobile.personalCare.card.bodySculpting.tip1' },
      { emoji: '📡', textKey: 'mobile.personalCare.card.bodySculpting.tip2' },
      { emoji: '🔊', textKey: 'mobile.personalCare.card.bodySculpting.tip3' },
      { emoji: '💉', textKey: 'mobile.personalCare.card.bodySculpting.tip4' },
    ],
  },
  {
    emoji: '🧖',
    titleKey: 'mobile.personalCare.card.bodyWraps.title',
    subtitleKey: 'mobile.personalCare.card.bodyWraps.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🏺', textKey: 'mobile.personalCare.card.bodyWraps.tip1' },
      { emoji: '🍫', textKey: 'mobile.personalCare.card.bodyWraps.tip2' },
      { emoji: '🌿', textKey: 'mobile.personalCare.card.bodyWraps.tip3' },
      { emoji: '☕', textKey: 'mobile.personalCare.card.bodyWraps.tip4' },
    ],
  },
  {
    emoji: '💆',
    titleKey: 'mobile.personalCare.card.lymphaticDrainage.title',
    subtitleKey: 'mobile.personalCare.card.lymphaticDrainage.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '👐', textKey: 'mobile.personalCare.card.lymphaticDrainage.tip1' },
      { emoji: '💧', textKey: 'mobile.personalCare.card.lymphaticDrainage.tip2' },
      { emoji: '💪', textKey: 'mobile.personalCare.card.lymphaticDrainage.tip3' },
      { emoji: '📅', textKey: 'mobile.personalCare.card.lymphaticDrainage.tip4' },
    ],
  },
  {
    emoji: '📦',
    titleKey: 'mobile.personalCare.card.makeupStorage.title',
    subtitleKey: 'mobile.personalCare.card.makeupStorage.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🧊', textKey: 'mobile.personalCare.card.makeupStorage.tip1' },
      { emoji: '🧰', textKey: 'mobile.personalCare.card.makeupStorage.tip2' },
      { emoji: '🌞', textKey: 'mobile.personalCare.card.makeupStorage.tip3' },
      { emoji: '📂', textKey: 'mobile.personalCare.card.makeupStorage.tip4' },
    ],
  },
  {
    emoji: '📆',
    titleKey: 'mobile.personalCare.card.productShelfLife.title',
    subtitleKey: 'mobile.personalCare.card.productShelfLife.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '👁️', textKey: 'mobile.personalCare.card.productShelfLife.tip1' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.productShelfLife.tip2' },
      { emoji: '💄', textKey: 'mobile.personalCare.card.productShelfLife.tip3' },
      { emoji: '💅', textKey: 'mobile.personalCare.card.productShelfLife.tip4' },
    ],
  },
  {
    emoji: '🪞',
    titleKey: 'mobile.personalCare.card.vanityOrganization.title',
    subtitleKey: 'mobile.personalCare.card.vanityOrganization.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '☀️', textKey: 'mobile.personalCare.card.vanityOrganization.tip1' },
      { emoji: '📦', textKey: 'mobile.personalCare.card.vanityOrganization.tip2' },
      { emoji: '🪞', textKey: 'mobile.personalCare.card.vanityOrganization.tip3' },
      { emoji: '🧽', textKey: 'mobile.personalCare.card.vanityOrganization.tip4' },
    ],
  },
  {
    emoji: '🧳',
    titleKey: 'mobile.personalCare.card.travelBag.title',
    subtitleKey: 'mobile.personalCare.card.travelBag.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.personalCare.card.travelBag.tip1' },
      { emoji: '🎨', textKey: 'mobile.personalCare.card.travelBag.tip2' },
      { emoji: '📝', textKey: 'mobile.personalCare.card.travelBag.tip3' },
      { emoji: '🛂', textKey: 'mobile.personalCare.card.travelBag.tip4' },
    ],
  },
  {
    emoji: '🧹',
    titleKey: 'mobile.personalCare.card.declutter.title',
    subtitleKey: 'mobile.personalCare.card.declutter.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🚮', textKey: 'mobile.personalCare.card.declutter.tip1' },
      { emoji: '📆', textKey: 'mobile.personalCare.card.declutter.tip2' },
      { emoji: '✅', textKey: 'mobile.personalCare.card.declutter.tip3' },
      { emoji: '🎁', textKey: 'mobile.personalCare.card.declutter.tip4' },
    ],
  },
  {
    emoji: '🧣',
    titleKey: 'mobile.personalCare.card.neckCare.title',
    subtitleKey: 'mobile.personalCare.card.neckCare.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '👐', textKey: 'mobile.personalCare.card.neckCare.tip1' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.neckCare.tip2' },
      { emoji: '🌞', textKey: 'mobile.personalCare.card.neckCare.tip3' },
      { emoji: '🛌', textKey: 'mobile.personalCare.card.neckCare.tip4' },
    ],
  },
  {
    emoji: '💗',
    titleKey: 'mobile.personalCare.card.chestCare.title',
    subtitleKey: 'mobile.personalCare.card.chestCare.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧴', textKey: 'mobile.personalCare.card.chestCare.tip1' },
      { emoji: '🧽', textKey: 'mobile.personalCare.card.chestCare.tip2' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.chestCare.tip3' },
      { emoji: '🌞', textKey: 'mobile.personalCare.card.chestCare.tip4' },
    ],
  },
  {
    emoji: '📱',
    titleKey: 'mobile.personalCare.card.techNeck.title',
    subtitleKey: 'mobile.personalCare.card.techNeck.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '📱', textKey: 'mobile.personalCare.card.techNeck.tip1' },
      { emoji: '🪑', textKey: 'mobile.personalCare.card.techNeck.tip2' },
      { emoji: '🤸', textKey: 'mobile.personalCare.card.techNeck.tip3' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.techNeck.tip4' },
    ],
  },
  {
    emoji: '😷',
    titleKey: 'mobile.personalCare.card.neckMask.title',
    subtitleKey: 'mobile.personalCare.card.neckMask.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '♻️', textKey: 'mobile.personalCare.card.neckMask.tip1' },
      { emoji: '🎭', textKey: 'mobile.personalCare.card.neckMask.tip2' },
      { emoji: '⏰', textKey: 'mobile.personalCare.card.neckMask.tip3' },
      { emoji: '🌙', textKey: 'mobile.personalCare.card.neckMask.tip4' },
    ],
  },
  {
    emoji: '💪',
    titleKey: 'mobile.personalCare.card.neckFirming.title',
    subtitleKey: 'mobile.personalCare.card.neckFirming.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '😮', textKey: 'mobile.personalCare.card.neckFirming.tip1' },
      { emoji: '⬆️', textKey: 'mobile.personalCare.card.neckFirming.tip2' },
      { emoji: '🧴', textKey: 'mobile.personalCare.card.neckFirming.tip3' },
      { emoji: '💆', textKey: 'mobile.personalCare.card.neckFirming.tip4' },
    ],
  },
  {
    emoji: '👜',
    titleKey: 'mobile.personalCare.card.beautyEmergencyKit.title',
    subtitleKey: 'mobile.personalCare.card.beautyEmergencyKit.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💋', textKey: 'mobile.personalCare.card.beautyEmergencyKit.tip1' },
      { emoji: '🧻', textKey: 'mobile.personalCare.card.beautyEmergencyKit.tip2' },
      { emoji: '🪞', textKey: 'mobile.personalCare.card.beautyEmergencyKit.tip3' },
      { emoji: '🩹', textKey: 'mobile.personalCare.card.beautyEmergencyKit.tip4' },
    ],
  },
];

export default function PersonalCareScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.personalCare.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.personalCare.subtitle')}</Text>
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
  container: { flex: 1, backgroundColor: '#fffbeb' },
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

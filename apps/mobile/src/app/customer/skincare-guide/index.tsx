import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}

interface IngredientCard {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const INGREDIENTS: IngredientCard[] = [
  {
    emoji: '🍊',
    titleKey: 'mobile.skincareGuide.ingredient.vitaminC.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.vitaminC.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🌅', textKey: 'mobile.skincareGuide.ingredient.vitaminC.tip1' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.vitaminC.tip2' },
      { emoji: '🛡️', textKey: 'mobile.skincareGuide.ingredient.vitaminC.tip3' },
      { emoji: '🧪', textKey: 'mobile.skincareGuide.ingredient.vitaminC.tip4' },
    ],
  },
  {
    emoji: '🌙',
    titleKey: 'mobile.skincareGuide.ingredient.retinol.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.retinol.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🌙', textKey: 'mobile.skincareGuide.ingredient.retinol.tip1' },
      { emoji: '🤏', textKey: 'mobile.skincareGuide.ingredient.retinol.tip2' },
      { emoji: '📈', textKey: 'mobile.skincareGuide.ingredient.retinol.tip3' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.retinol.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.tip1' },
      { emoji: '💦', textKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.tip2' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.tip3' },
      { emoji: '✅', textKey: 'mobile.skincareGuide.ingredient.hyaluronicAcid.tip4' },
    ],
  },
  {
    emoji: '🧴',
    titleKey: 'mobile.skincareGuide.ingredient.niacinamide.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.niacinamide.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.niacinamide.tip1' },
      { emoji: '🎯', textKey: 'mobile.skincareGuide.ingredient.niacinamide.tip2' },
      { emoji: '🧱', textKey: 'mobile.skincareGuide.ingredient.niacinamide.tip3' },
      { emoji: '✅', textKey: 'mobile.skincareGuide.ingredient.niacinamide.tip4' },
    ],
  },
  {
    emoji: '🌿',
    titleKey: 'mobile.skincareGuide.ingredient.azelaicAcid.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.azelaicAcid.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🩹', textKey: 'mobile.skincareGuide.ingredient.azelaicAcid.tip1' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.azelaicAcid.tip2' },
      { emoji: '🌸', textKey: 'mobile.skincareGuide.ingredient.azelaicAcid.tip3' },
      { emoji: '🧪', textKey: 'mobile.skincareGuide.ingredient.azelaicAcid.tip4' },
    ],
  },
  {
    emoji: '🧱',
    titleKey: 'mobile.skincareGuide.ingredient.ceramides.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.ceramides.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧱', textKey: 'mobile.skincareGuide.ingredient.ceramides.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.ceramides.tip2' },
      { emoji: '🌸', textKey: 'mobile.skincareGuide.ingredient.ceramides.tip3' },
      { emoji: '🧪', textKey: 'mobile.skincareGuide.ingredient.ceramides.tip4' },
    ],
  },
  {
    emoji: '🧬',
    titleKey: 'mobile.skincareGuide.ingredient.peptides.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.peptides.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.peptides.tip1' },
      { emoji: '🔁', textKey: 'mobile.skincareGuide.ingredient.peptides.tip2' },
      { emoji: '✅', textKey: 'mobile.skincareGuide.ingredient.peptides.tip3' },
      { emoji: '📅', textKey: 'mobile.skincareGuide.ingredient.peptides.tip4' },
    ],
  },
  {
    emoji: '🍋',
    titleKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🍋', textKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.tip1' },
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.tip2' },
      { emoji: '🌸', textKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.tip3' },
      { emoji: '🚫', textKey: 'mobile.skincareGuide.ingredient.exfoliatingAcids.tip4' },
    ],
  },
  {
    emoji: '💦',
    titleKey: 'mobile.skincareGuide.ingredient.faceMist.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.faceMist.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🌹', textKey: 'mobile.skincareGuide.ingredient.faceMist.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.faceMist.tip2' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.faceMist.tip3' },
      { emoji: '✈️', textKey: 'mobile.skincareGuide.ingredient.faceMist.tip4' },
    ],
  },
  {
    emoji: '🫒',
    titleKey: 'mobile.skincareGuide.ingredient.faceOils.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.faceOils.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🌙', textKey: 'mobile.skincareGuide.ingredient.faceOils.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.faceOils.tip2' },
      { emoji: '🫒', textKey: 'mobile.skincareGuide.ingredient.faceOils.tip3' },
      { emoji: '🌿', textKey: 'mobile.skincareGuide.ingredient.faceOils.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.skincareGuide.ingredient.glassSkin.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.glassSkin.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.glassSkin.tip1' },
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.glassSkin.tip2' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.glassSkin.tip3' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.glassSkin.tip4' },
    ],
  },
  {
    emoji: '🧖',
    titleKey: 'mobile.skincareGuide.ingredient.sheetMask.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.sheetMask.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧼', textKey: 'mobile.skincareGuide.ingredient.sheetMask.tip1' },
      { emoji: '⏱️', textKey: 'mobile.skincareGuide.ingredient.sheetMask.tip2' },
      { emoji: '💆', textKey: 'mobile.skincareGuide.ingredient.sheetMask.tip3' },
      { emoji: '📆', textKey: 'mobile.skincareGuide.ingredient.sheetMask.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'mobile.skincareGuide.ingredient.essence.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.essence.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📋', textKey: 'mobile.skincareGuide.ingredient.essence.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.essence.tip2' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.essence.tip3' },
      { emoji: '🤲', textKey: 'mobile.skincareGuide.ingredient.essence.tip4' },
    ],
  },
  {
    emoji: '🐌',
    titleKey: 'mobile.skincareGuide.ingredient.snailMucin.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.snailMucin.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧪', textKey: 'mobile.skincareGuide.ingredient.snailMucin.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.snailMucin.tip2' },
      { emoji: '🩹', textKey: 'mobile.skincareGuide.ingredient.snailMucin.tip3' },
      { emoji: '✅', textKey: 'mobile.skincareGuide.ingredient.snailMucin.tip4' },
    ],
  },
  {
    emoji: '🌿',
    titleKey: 'mobile.skincareGuide.ingredient.centella.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.centella.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🌸', textKey: 'mobile.skincareGuide.ingredient.centella.tip1' },
      { emoji: '🩹', textKey: 'mobile.skincareGuide.ingredient.centella.tip2' },
      { emoji: '🧊', textKey: 'mobile.skincareGuide.ingredient.centella.tip3' },
      { emoji: '🧱', textKey: 'mobile.skincareGuide.ingredient.centella.tip4' },
    ],
  },
  {
    emoji: '🧪',
    titleKey: 'mobile.skincareGuide.ingredient.chemicalPeel.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.chemicalPeel.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🍋', textKey: 'mobile.skincareGuide.ingredient.chemicalPeel.tip1' },
      { emoji: '📆', textKey: 'mobile.skincareGuide.ingredient.chemicalPeel.tip2' },
      { emoji: '🩺', textKey: 'mobile.skincareGuide.ingredient.chemicalPeel.tip3' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.chemicalPeel.tip4' },
    ],
  },
  {
    emoji: '💉',
    titleKey: 'mobile.skincareGuide.ingredient.microneedling.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.microneedling.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧬', textKey: 'mobile.skincareGuide.ingredient.microneedling.tip1' },
      { emoji: '🩹', textKey: 'mobile.skincareGuide.ingredient.microneedling.tip2' },
      { emoji: '📅', textKey: 'mobile.skincareGuide.ingredient.microneedling.tip3' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.microneedling.tip4' },
    ],
  },
  {
    emoji: '💦',
    titleKey: 'mobile.skincareGuide.ingredient.hydrafacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.hydrafacial.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧼', textKey: 'mobile.skincareGuide.ingredient.hydrafacial.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.hydrafacial.tip2' },
      { emoji: '⏱️', textKey: 'mobile.skincareGuide.ingredient.hydrafacial.tip3' },
      { emoji: '📅', textKey: 'mobile.skincareGuide.ingredient.hydrafacial.tip4' },
    ],
  },
  {
    emoji: '🌿',
    titleKey: 'mobile.skincareGuide.ingredient.bakuchiol.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.bakuchiol.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🌱', textKey: 'mobile.skincareGuide.ingredient.bakuchiol.tip1' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.bakuchiol.tip2' },
      { emoji: '🤰', textKey: 'mobile.skincareGuide.ingredient.bakuchiol.tip3' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.bakuchiol.tip4' },
    ],
  },
  {
    emoji: '⚗️',
    titleKey: 'mobile.skincareGuide.ingredient.mixingIngredients.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.mixingIngredients.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '✅', textKey: 'mobile.skincareGuide.ingredient.mixingIngredients.tip1' },
      { emoji: '💪', textKey: 'mobile.skincareGuide.ingredient.mixingIngredients.tip2' },
      { emoji: '🚫', textKey: 'mobile.skincareGuide.ingredient.mixingIngredients.tip3' },
      { emoji: '❌', textKey: 'mobile.skincareGuide.ingredient.mixingIngredients.tip4' },
    ],
  },
  {
    emoji: '💨',
    titleKey: 'mobile.skincareGuide.ingredient.oxygenFacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.oxygenFacial.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💦', textKey: 'mobile.skincareGuide.ingredient.oxygenFacial.tip1' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.oxygenFacial.tip2' },
      { emoji: '⏱️', textKey: 'mobile.skincareGuide.ingredient.oxygenFacial.tip3' },
      { emoji: '⭐', textKey: 'mobile.skincareGuide.ingredient.oxygenFacial.tip4' },
    ],
  },
  {
    emoji: '💎',
    titleKey: 'mobile.skincareGuide.ingredient.diamondFacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.diamondFacial.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '💎', textKey: 'mobile.skincareGuide.ingredient.diamondFacial.tip1' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.diamondFacial.tip2' },
      { emoji: '🧼', textKey: 'mobile.skincareGuide.ingredient.diamondFacial.tip3' },
      { emoji: '📅', textKey: 'mobile.skincareGuide.ingredient.diamondFacial.tip4' },
    ],
  },
  {
    emoji: '👑',
    titleKey: 'mobile.skincareGuide.ingredient.goldFacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.goldFacial.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.goldFacial.tip1' },
      { emoji: '⏳', textKey: 'mobile.skincareGuide.ingredient.goldFacial.tip2' },
      { emoji: '🌟', textKey: 'mobile.skincareGuide.ingredient.goldFacial.tip3' },
      { emoji: '💎', textKey: 'mobile.skincareGuide.ingredient.goldFacial.tip4' },
    ],
  },
  {
    emoji: '🩸',
    titleKey: 'mobile.skincareGuide.ingredient.plasmaFacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.plasmaFacial.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { emoji: '💉', textKey: 'mobile.skincareGuide.ingredient.plasmaFacial.tip1' },
      { emoji: '🧬', textKey: 'mobile.skincareGuide.ingredient.plasmaFacial.tip2' },
      { emoji: '🌿', textKey: 'mobile.skincareGuide.ingredient.plasmaFacial.tip3' },
      { emoji: '📅', textKey: 'mobile.skincareGuide.ingredient.plasmaFacial.tip4' },
    ],
  },
  {
    emoji: '🐟',
    titleKey: 'mobile.skincareGuide.ingredient.caviarFacial.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.caviarFacial.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧬', textKey: 'mobile.skincareGuide.ingredient.caviarFacial.tip1' },
      { emoji: '🐟', textKey: 'mobile.skincareGuide.ingredient.caviarFacial.tip2' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.caviarFacial.tip3' },
      { emoji: '💎', textKey: 'mobile.skincareGuide.ingredient.caviarFacial.tip4' },
    ],
  },
  {
    emoji: '👁️',
    titleKey: 'mobile.skincareGuide.ingredient.darkCircles.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.darkCircles.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '😴', textKey: 'mobile.skincareGuide.ingredient.darkCircles.tip1' },
      { emoji: '🩸', textKey: 'mobile.skincareGuide.ingredient.darkCircles.tip2' },
      { emoji: '🧬', textKey: 'mobile.skincareGuide.ingredient.darkCircles.tip3' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.darkCircles.tip4' },
    ],
  },
  {
    emoji: '🧊',
    titleKey: 'mobile.skincareGuide.ingredient.underEyeBags.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.underEyeBags.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧊', textKey: 'mobile.skincareGuide.ingredient.underEyeBags.tip1' },
      { emoji: '☕', textKey: 'mobile.skincareGuide.ingredient.underEyeBags.tip2' },
      { emoji: '🛏️', textKey: 'mobile.skincareGuide.ingredient.underEyeBags.tip3' },
      { emoji: '🧂', textKey: 'mobile.skincareGuide.ingredient.underEyeBags.tip4' },
    ],
  },
  {
    emoji: '👀',
    titleKey: 'mobile.skincareGuide.ingredient.crowFeet.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.crowFeet.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🕶️', textKey: 'mobile.skincareGuide.ingredient.crowFeet.tip1' },
      { emoji: '🤲', textKey: 'mobile.skincareGuide.ingredient.crowFeet.tip2' },
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.crowFeet.tip3' },
      { emoji: '💉', textKey: 'mobile.skincareGuide.ingredient.crowFeet.tip4' },
    ],
  },
  {
    emoji: '💆',
    titleKey: 'mobile.skincareGuide.ingredient.eyeMassage.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.eyeMassage.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💍', textKey: 'mobile.skincareGuide.ingredient.eyeMassage.tip1' },
      { emoji: '🔄', textKey: 'mobile.skincareGuide.ingredient.eyeMassage.tip2' },
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.eyeMassage.tip3' },
      { emoji: '⏱️', textKey: 'mobile.skincareGuide.ingredient.eyeMassage.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'mobile.skincareGuide.ingredient.eyeSerum.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.eyeSerum.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '☕', textKey: 'mobile.skincareGuide.ingredient.eyeSerum.tip1' },
      { emoji: '🧬', textKey: 'mobile.skincareGuide.ingredient.eyeSerum.tip2' },
      { emoji: '💧', textKey: 'mobile.skincareGuide.ingredient.eyeSerum.tip3' },
      { emoji: '🍊', textKey: 'mobile.skincareGuide.ingredient.eyeSerum.tip4' },
    ],
  },
  {
    emoji: '🩹',
    titleKey: 'mobile.skincareGuide.ingredient.acneScars.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.acneScars.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { emoji: '🕳️', textKey: 'mobile.skincareGuide.ingredient.acneScars.tip1' },
      { emoji: '🔴', textKey: 'mobile.skincareGuide.ingredient.acneScars.tip2' },
      { emoji: '🟤', textKey: 'mobile.skincareGuide.ingredient.acneScars.tip3' },
      { emoji: '💊', textKey: 'mobile.skincareGuide.ingredient.acneScars.tip4' },
    ],
  },
  {
    emoji: '🔬',
    titleKey: 'mobile.skincareGuide.ingredient.postAcneMarks.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.postAcneMarks.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🟤', textKey: 'mobile.skincareGuide.ingredient.postAcneMarks.tip1' },
      { emoji: '🔴', textKey: 'mobile.skincareGuide.ingredient.postAcneMarks.tip2' },
      { emoji: '🌙', textKey: 'mobile.skincareGuide.ingredient.postAcneMarks.tip3' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.postAcneMarks.tip4' },
    ],
  },
  {
    emoji: '🔍',
    titleKey: 'mobile.skincareGuide.ingredient.minimizePores.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.minimizePores.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.minimizePores.tip1' },
      { emoji: '💊', textKey: 'mobile.skincareGuide.ingredient.minimizePores.tip2' },
      { emoji: '🧊', textKey: 'mobile.skincareGuide.ingredient.minimizePores.tip3' },
      { emoji: '✨', textKey: 'mobile.skincareGuide.ingredient.minimizePores.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🍊', textKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.tip1' },
      { emoji: '🤰', textKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.tip2' },
      { emoji: '🍋', textKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.tip3' },
      { emoji: '⏳', textKey: 'mobile.skincareGuide.ingredient.fadeAcneMarks.tip4' },
    ],
  },
  {
    emoji: '🩹',
    titleKey: 'mobile.skincareGuide.ingredient.scarTreatments.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.scarTreatments.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.scarTreatments.tip1' },
      { emoji: '💉', textKey: 'mobile.skincareGuide.ingredient.scarTreatments.tip2' },
      { emoji: '⚡', textKey: 'mobile.skincareGuide.ingredient.scarTreatments.tip3' },
      { emoji: '⏰', textKey: 'mobile.skincareGuide.ingredient.scarTreatments.tip4' },
    ],
  },
  {
    emoji: '😷',
    titleKey: 'mobile.skincareGuide.ingredient.maskne.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.maskne.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🔄', textKey: 'mobile.skincareGuide.ingredient.maskne.tip1' },
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.maskne.tip2' },
      { emoji: '🚫', textKey: 'mobile.skincareGuide.ingredient.maskne.tip3' },
      { emoji: '🧼', textKey: 'mobile.skincareGuide.ingredient.maskne.tip4' },
    ],
  },
  {
    emoji: '🌸',
    titleKey: 'mobile.skincareGuide.ingredient.koreanRoutine.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.koreanRoutine.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '1️⃣', textKey: 'mobile.skincareGuide.ingredient.koreanRoutine.tip1' },
      { emoji: '2️⃣', textKey: 'mobile.skincareGuide.ingredient.koreanRoutine.tip2' },
      { emoji: '3️⃣', textKey: 'mobile.skincareGuide.ingredient.koreanRoutine.tip3' },
      { emoji: '4️⃣', textKey: 'mobile.skincareGuide.ingredient.koreanRoutine.tip4' },
    ],
  },
  {
    emoji: '🍵',
    titleKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.title',
    subtitleKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧴', textKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.tip1' },
      { emoji: '☀️', textKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.tip2' },
      { emoji: '💆', textKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.tip3' },
      { emoji: '🍵', textKey: 'mobile.skincareGuide.ingredient.japaneseRoutine.tip4' },
    ],
  },
];

export default function SkincareGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.skincareGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.skincareGuide.subtitle')}</Text>

      <View style={styles.grid}>
        {INGREDIENTS.map((ingredient, i) => (
          <View key={i} style={[styles.card, { borderColor: ingredient.color + '30' }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{ingredient.emoji}</Text>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: ingredient.color }]}>
                  {t(ingredient.titleKey)}
                </Text>
                <Text style={styles.cardSubtitle}>{t(ingredient.subtitleKey)}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {ingredient.tips.map((tip, j) => (
                <View key={j} style={[styles.tipRow, { backgroundColor: ingredient.bg }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipText, { color: ingredient.color }]}>
                    {t(tip.textKey)}
                  </Text>
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
  container: { flex: 1, backgroundColor: '#fdf2f8' },
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

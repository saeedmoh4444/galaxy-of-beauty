// First-run funnel (audit stage 12): index.tsx routes unseen installs
// here. Finishing marks the flag and lands on the home tab. The
// beautyOnboarding router (questions/submit/status) is a separate
// auth-gated post-signup questionnaire — this walkthrough stays static.
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { router } from 'expo-router';
import { useLocale } from '@/components/LocaleProvider';
import { markSeenOnboarding } from '@/utils/onboarding';

const slides = [
  {
    emoji: '🌸',
    titleKey: 'mobile.public.onboarding.slide1.title',
    descKey: 'mobile.public.onboarding.slide1.desc',
  },
  {
    emoji: '📅',
    titleKey: 'mobile.public.onboarding.slide2.title',
    descKey: 'mobile.public.onboarding.slide2.desc',
  },
  {
    emoji: '💇',
    titleKey: 'mobile.public.onboarding.slide3.title',
    descKey: 'mobile.public.onboarding.slide3.desc',
  },
  {
    emoji: '🎁',
    titleKey: 'mobile.public.onboarding.slide4.title',
    descKey: 'mobile.public.onboarding.slide4.desc',
  },
] as const;

export default function OnboardingScreen(): JSX.Element {
  const { t } = useLocale();
  const [step, setStep] = useState(0);

  const isLast = step === slides.length - 1;

  return (
    <View style={styles.c}>
      <View style={styles.i}>
        <Text style={styles.emoji}>{slides[step]!.emoji}</Text>
        <Text style={styles.title}>{t(slides[step]!.titleKey)}</Text>
        <Text style={styles.desc}>{t(slides[step]!.descKey)}</Text>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.buttons}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>{t('mobile.public.onboarding.back')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              if (isLast) {
                // First-run funnel: mark seen and land on the home tab.
                void markSeenOnboarding().then(() => router.replace('/(tabs)/home'));
              } else {
                setStep(step + 1);
              }
            }}
            style={[styles.nextBtn, isLast && styles.doneBtn]}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? t('mobile.public.onboarding.start') : t('mobile.public.onboarding.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emoji: { fontSize: 80, marginBottom: 30 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  dotActive: { backgroundColor: '#db2777', width: 24 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 30, width: '100%' },
  backBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  nextBtn: {
    flex: 2,
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  doneBtn: { backgroundColor: '#059669' },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

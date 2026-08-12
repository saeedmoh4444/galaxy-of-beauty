import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const slides = [
  {
    emoji: '💆‍♀️',
    title: 'أهلاً بكِ في جالكسي بيوتي',
    desc: 'منصتكِ الشاملة لكل خدمات التجميل والعناية',
  },
  { emoji: '📅', title: 'احجزي بسهولة', desc: 'تصفحي الخدمات واحجزي موعدكِ في دقائق' },
  { emoji: '👩‍🎨', title: 'أفضل الفنيات', desc: 'اختاري من نخبة الفنيات المحترفات في منطقتكِ' },
  { emoji: '🎁', title: 'مكافآت وخصومات', desc: 'اكسبي نقاط واستمتعي بعروض حصرية' },
];

export default function OnboardingScreen(): JSX.Element {
  const [step, setStep] = useState(0);

  const isLast = step === slides.length - 1;

  return (
    <View style={styles.c}>
      <View style={styles.i}>
        <Text style={styles.emoji}>{slides[step]!.emoji}</Text>
        <Text style={styles.title}>{slides[step]!.title}</Text>
        <Text style={styles.desc}>{slides[step]!.desc}</Text>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.buttons}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>السابق</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => (isLast ? null : setStep(step + 1))}
            style={[styles.nextBtn, isLast && styles.doneBtn]}
          >
            <Text style={styles.nextBtnText}>{isLast ? '✨ ابدئي الآن' : 'التالي →'}</Text>
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

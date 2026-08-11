import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const questions = [
  {
    id: 'occasion',
    text: 'ما المناسبة؟',
    options: [
      { label: 'يومي', value: 'daily', icon: '☀️' },
      { label: 'مناسبة خاصة', value: 'special', icon: '✨' },
      { label: 'زفاف', value: 'wedding', icon: '👰' },
      { label: 'استرخاء', value: 'relax', icon: '🧖‍♀️' },
      { label: 'تجربة جديدة', value: 'new', icon: '🎨' },
    ],
  },
  {
    id: 'budget',
    text: 'ميزانيتك؟',
    options: [
      { label: 'اقتصادية', value: 'low', icon: '💰' },
      { label: 'متوسطة', value: 'mid', icon: '💵' },
      { label: 'فاخرة', value: 'high', icon: '💎' },
      { label: 'بدون حدود', value: 'unlimited', icon: '👑' },
    ],
  },
  {
    id: 'style',
    text: 'أسلوبك المفضل؟',
    options: [
      { label: 'طبيعي', value: 'natural', icon: '🌿' },
      { label: 'جريء', value: 'bold', icon: '🎯' },
      { label: 'كلاسيكي', value: 'classic', icon: '👗' },
      { label: 'عصري', value: 'modern', icon: '📱' },
    ],
  },
];

export default function BeautyQuizScreen(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const select = (value: string) => {
    const q = questions[step]!;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>✨ نتيجة الاختبار</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>شكراً لمشاركتك!</Text>
          <Text style={styles.resultDesc}>بناءً على إجاباتك، سنرشح لكِ أفضل الخدمات</Text>
          <View style={styles.answers}>
            {Object.entries(answers).map(([qId, val]) => {
              const q = questions.find((x) => x.id === qId);
              const opt = q?.options.find((o) => o.value === val);
              return (
                <Text key={qId} style={styles.answerRow}>
                  {opt?.icon} {q?.text}: {opt?.label}
                </Text>
              );
            })}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setStep(0);
            setAnswers({});
            setDone(false);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>🔄 إعادة</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = questions[step]!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💄 اختبار الجمال</Text>
      <Text style={styles.progress}>
        {step + 1}/{questions.length}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${((step + 1) / questions.length) * 100}%` }]}
        />
      </View>
      <Text style={styles.question}>{q.text}</Text>
      <View style={styles.options}>
        {q.options.map((o) => (
          <TouchableOpacity key={o.value} onPress={() => select(o.value)} style={styles.option}>
            <Text style={styles.optionIcon}>{o.icon}</Text>
            <Text style={styles.optionLabel}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 8 },
  progress: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: '#db2777', borderRadius: 3 },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionIcon: { fontSize: 28 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  resultEmoji: { fontSize: 56 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 12 },
  resultDesc: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  answers: { marginTop: 16, width: '100%' },
  answerRow: { fontSize: 13, color: '#374151', paddingVertical: 4 },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceRecommenderScreen() {
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.serviceRecommender.questions.query() as any as Promise<Record<string, unknown>[]>)
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchResults = (ans: Record<string, string>) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.serviceRecommender.recommend.query({ answers: ans }) as any as Promise<Record<string, unknown>[]>)
      .then((data) => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  if (results) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
        <Text style={styles.title}>✨ خدماتكِ المثالية</Text>
        {results.map((r: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{r.emoji as string}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{r.nameAr as string}</Text>
              <View style={styles.resultBar}><View style={[styles.resultFill, { width: `${r.matchPct as number}%` }]} /></View>
              <Text style={styles.resultPct}>{r.matchPct as number}% تطابق</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.resetBtn} onPress={() => { setStep(0); setAnswers({}); setResults(null); }} activeOpacity={0.8}>
          <Text style={styles.resetText}>🔄 إعادة الاختبار</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = questions[step];
  if (!q) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🤖 اكتشفي خدماتكِ</Text>
      <View style={styles.progressRow}>
        {questions.map((_, i) => <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />)}
      </View>
      <Text style={styles.questionNum}>السؤال {step + 1} من {questions.length}</Text>
      <Text style={styles.question}>{q.q as string}</Text>
      {(q.opts as Record<string, unknown>[]).map((o: Record<string, unknown>, i: number) => (
        <TouchableOpacity key={i} style={styles.option} onPress={() => {
          const updated = { ...answers, [q.id as string]: o.k as string };
          setAnswers(updated);
          if (step < questions.length - 1) setStep(step + 1);
          else fetchResults(updated);
        }} activeOpacity={0.7}>
          <Text style={styles.optionText}>{o.l as string}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  dotActive: { backgroundColor: '#7c3aed', width: 24 },
  questionNum: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  question: { fontSize: 19, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 20, lineHeight: 28 },
  option: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', padding: 16, marginBottom: 10 },
  optionText: { fontSize: 15, color: '#374151', textAlign: 'right' },
  resultCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'center' },
  resultEmoji: { fontSize: 36, marginRight: 12 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  resultBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginTop: 6, marginBottom: 4 },
  resultFill: { height: 6, backgroundColor: '#7c3aed', borderRadius: 3 },
  resultPct: { fontSize: 11, fontWeight: '600', color: '#7c3aed', textAlign: 'right' },
  resetBtn: { backgroundColor: '#ede9fe', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  resetText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
});

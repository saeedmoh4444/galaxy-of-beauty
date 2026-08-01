import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function GiftQuizScreen() {
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.giftQuiz.questions.query() as any).then((d: any) => { setQuestions(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fetchResults = (ans: Record<string, string>) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.giftQuiz.recommend.query({ answers: ans }) as any).then((d: any) => { setResults(d); setLoading(false); }).catch(() => setLoading(false));
  };

  if (loading) return <SkeletonList count={3} />;

  if (results) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}><Text style={styles.title}>🎁 توصيات الهدايا</Text></View>
        <ScrollView contentContainerStyle={styles.inner}>
          {results.map((r: Record<string, unknown>, i: number) => (
            <View key={i} style={styles.resultCard}>
              <Text style={styles.resultEmoji}>{r.emoji as string}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{r.nameAr as string}</Text>
                <Text style={styles.resultDesc}>{r.descAr as string}</Text>
                <Text style={styles.resultPrice}>{r.price as number} ر.س</Text>
                <View style={styles.scoreBar}><View style={[styles.scoreFill, { width: `${r.score as number}%` }]} /></View>
                <Text style={styles.scoreText}>{r.score as number}% تطابق</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.resetBtn} onPress={() => { setStep(0); setAnswers({}); setResults(null); }}><Text style={styles.resetText}>🔄 إعادة</Text></TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const q = questions[step];
  if (!q) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎁 اختبار الهدايا</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.progressRow}>{questions.map((_, i) => <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />)}</View>
        <Text style={styles.questionNum}>السؤال {step + 1} من {questions.length}</Text>
        <Text style={styles.question}>{q.questionAr as string}</Text>
        {(q.options as Record<string, unknown>[]).map((o: Record<string, unknown>, i: number) => (
          <TouchableOpacity key={i} style={styles.option} onPress={() => {
            const updated = { ...answers, [q.id as string]: o.key as string };
            setAnswers(updated);
            if (step < questions.length - 1) setStep(step + 1);
            else fetchResults(updated);
          }} activeOpacity={0.7}>
            <Text style={styles.optionText}>{o.labelAr as string}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fce7f3', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#be185d', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  dotActive: { backgroundColor: '#be185d', width: 24 },
  questionNum: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  question: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 20 },
  option: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', padding: 14, marginBottom: 8 },
  optionText: { fontSize: 15, color: '#374151', textAlign: 'right' },
  resultCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, alignItems: 'center' },
  resultEmoji: { fontSize: 40 },
  resultName: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  resultDesc: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  resultPrice: { fontSize: 16, fontWeight: '800', color: '#be185d', textAlign: 'right', marginTop: 6 },
  scoreBar: { height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, marginTop: 6 },
  scoreFill: { height: 4, backgroundColor: '#be185d', borderRadius: 2 },
  scoreText: { fontSize: 11, color: '#be185d', textAlign: 'right', marginTop: 2 },
  resetBtn: { backgroundColor: '#fce7f3', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
  resetText: { fontSize: 14, fontWeight: '600', color: '#be185d' },
});

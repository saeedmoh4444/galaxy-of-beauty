import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CertificationQuizScreen() {
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null);
  const [certs, setCerts] = useState<Record<string, unknown>[]>([]);
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (trpc.certificationQuiz.quizzes.query() as any).then((d: any) => { setQuestions(d || []); setLoading(false); }).catch(() => setLoading(false));
    (trpc.certificationQuiz.myCertificates.query() as any).then((d: any) => setCerts(d || [])).catch(() => {});
  }, []);

  const start = (id: string) => { setLoading(true); (trpc.certificationQuiz.get.query({ id }) as any).then((d: any) => { setQuiz(d); setAnswers([]); setResult(null); setLoading(false); }).catch(() => setLoading(false)); };

  const submit = () => { if (!quiz) return; setLoading(true); (trpc.certificationQuiz.submit.mutate({ quizId: quiz.id as string, answers }) as any).then((d: any) => { setResult(d); setLoading(false); }).catch(() => setLoading(false)); };

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  if (result) return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{result.passed ? '🎉 مبروك!' : '📚 حاولي مرة أخرى'}</Text>
      <Text style={styles.score}>{result.score}%</Text>
      {result.certificate && <View style={styles.cert}><Text style={styles.certName}>🎓 {result.certificate.quizName}</Text></View>}
      <TouchableOpacity style={styles.resetBtn} onPress={() => { setQuiz(null); setResult(null); }}><Text>🔄 اختبار آخر</Text></TouchableOpacity>
    </ScrollView>
  );

  if (quiz) return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{quiz.nameAr as string}</Text>
      {(quiz.questions as Record<string, unknown>[]).map((q: Record<string, unknown>, qi: number) => (
        <View key={qi} style={styles.qCard}>
          <Text style={styles.qText}>{q.q as string}</Text>
          {(q.opts as string[]).map((opt: string, oi: number) => (
            <TouchableOpacity key={oi} onPress={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }} style={[styles.opt, answers[qi] === oi && styles.optSelected]}><Text style={styles.optText}>{opt}</Text></TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity style={styles.submitBtn} onPress={submit}><Text style={styles.submitText}>تقديم ✓</Text></TouchableOpacity>
    </ScrollView>
  );

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎓 الشهادات</Text>
      {certs.length > 0 && <Text style={styles.section}>شهاداتي</Text>}
      {certs.map((c: Record<string, unknown>, i: number) => <View key={i} style={styles.certCard}><Text>🎓 {c.quizName as string}</Text><Text style={styles.certScore}>{c.score as number}%</Text></View>)}
      <Text style={styles.section}>الاختبارات المتاحة</Text>
      {(questions as Record<string, unknown>[]).map((q: Record<string, unknown>) => <TouchableOpacity key={q.id as string} onPress={() => start(q.id as string)} style={styles.quizCard}><Text style={styles.quizEmoji}>{q.emoji as string}</Text><View><Text style={styles.quizName}>{q.nameAr as string}</Text><Text style={styles.quizCount}>{q.questionCount as number} أسئلة</Text></View></TouchableOpacity>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  score: { fontSize: 40, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginTop: 12, marginBottom: 8 },
  quizCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, alignItems: 'center' },
  quizEmoji: { fontSize: 36 }, quizName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' }, quizCount: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
  qCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  qText: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  opt: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, marginBottom: 4 },
  optSelected: { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  optText: { fontSize: 13, color: '#374151', textAlign: 'right' },
  submitBtn: { backgroundColor: '#d97706', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cert: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, marginTop: 8 }, certName: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  certCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fef3c7', borderRadius: 10, padding: 10, marginBottom: 6 }, certScore: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  resetBtn: { marginTop: 16, alignSelf: 'center' },
});

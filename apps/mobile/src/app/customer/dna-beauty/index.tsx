import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function DNABeautyScreen(): JSX.Element {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    ((trpc as any).dnaBeauty.questions.query() as any).then((d: any) => { setQuestions(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const analyze = () => {
    setAnalyzing(true);
    ((trpc as any).dnaBeauty.analyze.query({ answers }) as any).then((d: any) => { setResult(d); setAnalyzing(false); }).catch(() => setAnalyzing(false));
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  if (analyzing) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🧬 تحليل الجينات</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>🧬</Text>
          <Text style={styles.resultTitle}>نتيجة التحليل</Text>
          <Text style={styles.score}>{result.score as number}% تطابق</Text>
          <View style={styles.traits}>
            {(result.traits as any[])?.map((t: any) => <Text key={t.key} style={styles.traitChip}>{t.label as string}</Text>)}
          </View>
          <Text style={styles.recTitle}>✅ موصى به:</Text>
          <View style={styles.tags}>{(result.recommendations as string[])?.map((r: string) => <Text key={r} style={styles.recChip}>{r}</Text>)}</View>
          <Text style={styles.avoidTitle}>🚫 تجنبي:</Text>
          <View style={styles.tags}>{(result.avoid as string[])?.map((a: string) => <Text key={a} style={styles.avoidChip}>{a}</Text>)}</View>
          <TouchableOpacity onPress={() => { setAnswers({}); setResult(null); }} style={styles.resetBtn}><Text style={styles.resetBtnText}>🔄 إعادة</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🧬 تحليل الجينات</Text>
      <Text style={styles.sub}>اكتشفي احتياجات بشرتكِ بناءً على سماتكِ الوراثية</Text>
      <View style={styles.card}>
        <Text style={styles.quizTitle}>🧬 أكملي الاستبيان</Text>
        {questions.map((q: any) => (
          <View key={q.id} style={styles.qRow}>
            <Text style={styles.qText}>{q.q as string}</Text>
            <View style={styles.qBtns}>
              <TouchableOpacity onPress={() => setAnswers({...answers, [q.id as string]: true})} style={[styles.qBtn, answers[q.id as string] === true && styles.qBtnYes]}>
                <Text style={[styles.qBtnText, answers[q.id as string] === true && styles.qBtnTextActive]}>نعم</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAnswers({...answers, [q.id as string]: false})} style={[styles.qBtn, answers[q.id as string] === false && styles.qBtnNo]}>
                <Text style={[styles.qBtnText, answers[q.id as string] === false && styles.qBtnTextActive]}>لا</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={analyze} style={styles.analyzeBtn}><Text style={styles.analyzeBtnText}>🧬 تحليل</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#c4b5fd' },
  resultEmoji: { fontSize: 56 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  score: { fontSize: 28, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 10 },
  traitChip: { fontSize: 11, color: '#7c3aed', backgroundColor: '#ede9fe', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  recTitle: { fontSize: 14, fontWeight: '700', color: '#059669', marginTop: 16, alignSelf: 'flex-start' },
  recChip: { fontSize: 11, color: '#059669', backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginRight: 4 },
  avoidTitle: { fontSize: 14, fontWeight: '700', color: '#dc2626', marginTop: 12, alignSelf: 'flex-start' },
  avoidChip: { fontSize: 11, color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginRight: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  resetBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16, width: '100%' },
  resetBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  quizTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
  qText: { flex: 1, fontSize: 13, color: '#374151' },
  qBtns: { flexDirection: 'row', gap: 8 },
  qBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#e5e7eb' },
  qBtnYes: { backgroundColor: '#7c3aed' }, qBtnNo: { backgroundColor: '#ef4444' },
  qBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' }, qBtnTextActive: { color: '#fff' },
  analyzeBtn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

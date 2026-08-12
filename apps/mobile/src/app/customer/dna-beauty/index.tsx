import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function DNABeautyScreen(): JSX.Element {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).dnaBeauty.questions.query() as any)
      .then((d: any) => {
        setQuestions(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const analyze = () => {
    setAnalyzing(true);
    ((trpc as any).dnaBeauty.analyze.query({ answers }) as any)
      .then((d: any) => {
        setResult(d);
        setAnalyzing(false);
      })
      .catch(() => setAnalyzing(false));
  };
  if (loading) return <SkeletonList count={4} />;
  if (analyzing)
    return (
      <View style={styles.c}>
        <SkeletonList count={3} />
      </View>
    );
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> تحليل الجينات</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>نتيجة التحليل</Text>
          <Text style={styles.score}>{result.score as number}% تطابق</Text>
          <TouchableOpacity
            onPress={() => {
              setAnswers({});
              setResult(null);
            }}
            style={styles.rst}
          >
            <Text style={styles.rstText}> إعادة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> تحليل الجينات</Text>
      <View style={styles.card}>
        <Text style={styles.qt}>أكملي الاستبيان</Text>
        {questions.map((q: any) => (
          <View key={q.id} style={styles.qr}>
            <Text style={styles.qq}>{q.q as string}</Text>
            <View style={styles.qb}>
              <TouchableOpacity
                onPress={() => setAnswers({ ...answers, [q.id as string]: true })}
                style={[styles.qbtn, answers[q.id as string] === true && styles.qy]}
              >
                <Text style={[styles.qbt, answers[q.id as string] === true && styles.qat]}>
                  نعم
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAnswers({ ...answers, [q.id as string]: false })}
                style={[styles.qbtn, answers[q.id as string] === false && styles.qn]}
              >
                <Text style={[styles.qbt, answers[q.id as string] === false && styles.qat]}>
                  لا
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={analyze} style={styles.ab}>
          <Text style={styles.abt}> تحليل</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#c4b5fd' },
  re: { fontSize: 56 },
  rt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  score: { fontSize: 28, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  rst: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, marginTop: 16 },
  rstText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  qt: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  qr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  qq: { flex: 1, fontSize: 13, color: '#374151' },
  qb: { flexDirection: 'row', gap: 8 },
  qbtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#e5e7eb' },
  qy: { backgroundColor: '#7c3aed' },
  qn: { backgroundColor: '#ef4444' },
  qbt: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  qat: { color: '#fff' },
  ab: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  abt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
